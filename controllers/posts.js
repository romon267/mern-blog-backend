/* eslint-disable no-underscore-dangle */
const postsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { postValidator } = require('../validators/post');
const Post = require('../models/post');
const User = require('../models/user');
const logger = require('../utils/logger');
require('express-async-errors');
const {
  mostLikes,
  mostPosts,
  findFavoritePost,
  totalLikes,
} = require('../utils/list_helper');

// This controller is serving all routes that are associated with posts
// Get all posts, fetch posts by id, username and url
// Update posts on PUT route and delete on DELETE route

// Getting all posts from DB, sorting by date and populating author field
postsRouter.get('/', async (req, res) => {
  const posts = await Post.find().sort('-createdAt').populate('author', {
    name: 1,
    email: 1,
    username: 1,
    comments: 1,
  }).exec();
  return res.json(posts);
});

// Fetching single post by id
postsRouter.get('/:id', async (req, res) => {
  const fetchedPost = await Post.findById(req.params.id);
  return res.json(fetchedPost);
});

// Fetching single post by username
postsRouter.get('/user/:username', async (req, res) => {
  const posts = await Post.find({ username: req.params.username }).sort('-createdAt').populate('author', {
    name: 1,
    email: 1,
    username: 1,
  }).exec();
  return res.json(posts);
});

// Fetching single post by url
postsRouter.get('/url/:url', async (req, res) => {
  const posts = await Post.findOne({ url: req.params.url }).sort('-createdAt').populate('author', {
    name: 1,
    email: 1,
    username: 1,
    comments: 1,
  }).exec();
  return res.json(posts);
});

// Creating new post
postsRouter.post('/', postValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Getting the values from request body
  const {
    title,
    likes,
    content,
    url,
  } = req.body;
  if (!title || !content) {
    const err = new Error('Title and content are required');
    err.name = 'ValidationError';
    throw err;
  }
  // Getting jwt token from request
  const { token } = req;
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: 'token missing or invalid' });
  }
  // User must be assigned as author of the post, if user not found, post won't be created
  const user = await User.findById(decodedToken.id);
  if (!user) {
    return res.status(400).json({ error: 'Author not found!' });
  }
  // Setting new default values for likes and url if none were provided
  let newLikes;
  let newUrl;
  if (!likes || likes === '') {
    newLikes = 0;
  }
  // Generating the url for post
  // Url is creating from title and username,
  // replacing all spaces with '-' and special symbols with ''
  if (!url || url === '') {
    newUrl = title
      .concat('-', user.username)
      .replace(/ /g, '-')
      .replace(/[^a-zA-Z0-9-]/gi, '')
      .toLowerCase();
  }
  const checkUrl = await Post.findOne({ url: newUrl });
  if (checkUrl) {
    newUrl = newUrl
      .concat('-', crypto.randomBytes(20).toString('hex'));
  }
  // Finally creating new post and saving to DB, then adding to user.posts array
  const post = new Post({
    title,
    content,
    author: user._id,
    likes: likes || newLikes,
    url: url || newUrl,
  });
  const savedPost = await post.save();
  // Populating the post to return with json populated version
  await savedPost.populate('author', { username: 1, id: 1 }).execPopulate();
  user.posts = user.posts.concat(savedPost._id);
  await user.save();
  return res.status(201).json(savedPost);
});

// Replacing the post in DB
postsRouter.put('/:id', async (req, res) => {
  // Verify the user is author of the post
  // Check if token is present
  if (!req.token) {
    return res.status(401).json({ error: 'token is missing' });
  }
  // Verify the token
  const decodedToken = jwt.verify(req.token, process.env.SECRET);
  if (!req.token || !decodedToken.id) {
    logger.info('DECODED TOKEN:', decodedToken);
    return res.status(401).json({ error: 'token is missing or invalid' });
  }
  // Find the user associated with that token
  const user = await User.findById(decodedToken.id);
  if (!user) {
    return res.status(401).json({ error: 'author verification failed' });
  }

  const {
    title,
    url,
    likes,
    comments,
  } = req.body;
  logger.info('BODY:', req.body);
  // Checking that post is existing by ID
  const post = await Post.findById(req.params.id);
  if (!post) {
    const err = new Error();
    err.name = 'PostNotFound';
    throw err;
  }
  // If user sending the request is not the author of the post
  // He only can update the likes and comments!
  let updatedPost;
  if (post.author.toString() !== user._id.toString()) {
    updatedPost = {
      title: post.title,
      url: post.url,
      author: post.author,
      likes: likes || post.likes,
      comments: comments || post.comments,
    };
  } else {
    updatedPost = {
      title: title || post.title,
      url: url || post.url,
      author: post.author,
      likes: likes || post.likes,
      comments: comments || post.comments,
    };
  }
  logger.info('WHAT WILL BE SAVED:', updatedPost);
  // Updating the post and populating to return as json
  const savedPost = await Post.findByIdAndUpdate(req.params.id, updatedPost, {
    new: true,
    runValidators: true,
  });
  await savedPost.populate('author').execPopulate();
  return res.json(savedPost);
});

postsRouter.delete('/:id', async (req, res) => {
  // Verify the user is author of the post
  // Check if token is present
  if (!req.token) {
    return res.status(401).json({ error: 'token is missing' });
  }
  // Verify the token
  const decodedToken = jwt.verify(req.token, process.env.SECRET);
  if (!req.token || !decodedToken.id) {
    logger.info('DECODED TOKEN:', decodedToken);
    return res.status(401).json({ error: 'token is missing or invalid' });
  }
  // Find the user associated with that token
  const user = await User.findById(decodedToken.id);
  if (!user) {
    return res.status(401).json({ error: 'author verification failed' });
  }

  // Validating the user's ability to delete the post
  const post = await Post.findById(req.params.id);
  logger.info(post);
  if (!post) {
    const err = new Error();
    err.name = 'PostNotFound';
    throw err;
  }
  if (post.author.toString() !== user._id.toString()) {
    return res.status(401).json({ error: 'access denied' });
  }
  await Post.findByIdAndDelete(req.params.id);
  user.posts = user.posts.filter((p) => p._id.toString() !== req.params.id.toString());
  await user.save();
  return res.status(204).end();
});

// Some cool data about all posts in a given array :)
postsRouter.get('/all/best', async (req, res) => {
  const posts = await Post.find().populate('author', { username: 1 });
  return res.json({
    mostLikedAuthor: mostLikes(posts),
    mostPostsAuthor: mostPosts(posts),
    mostLikedPost: findFavoritePost(posts),
    totalLikes: totalLikes(posts),
  });
});

module.exports = postsRouter;
