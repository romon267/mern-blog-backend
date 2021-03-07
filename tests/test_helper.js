/* eslint-disable no-underscore-dangle */
const Post = require('../models/post');
const User = require('../models/user');

const initialPosts = [
  {
    title: 'post one',
    author: 'user2',
    likes: 23,
    url: 'asdsa/',
  },
  {
    title: 'post2',
    author: 'user1',
    likes: 24,
    url: 'asdsa/',
  },
  {
    title: 'post3',
    author: 'user1',
    likes: 12,
    url: 'asdsa/',
  },
  {
    title: 'post4',
    author: 'user1',
    likes: 12,
    url: 'asdsa/',
  },
  {
    title: 'post5',
    author: 'user2',
    likes: 37,
    url: 'asdsa/',
  },
  {
    title: 'post6',
    author: 'user2',
    likes: 33,
    url: 'asdsa/',
  },
];

const nonExistingId = async () => {
  const post = new Post({ title: 'willremovethissoon', author: 'removed', url: 'dummy/' });
  await post.save();
  await post.remove();

  return post._id.toString();
};

const usersInDb = async () => {
  const users = await User.find();
  return users.map((user) => user.toJSON());
};

const postsInDb = async () => {
  const posts = await Post.find();
  return posts.map((post) => post.toJSON());
};

// const getToken = async () => {

// }

module.exports = {
  initialPosts,
  postsInDb,
  nonExistingId,
  usersInDb,
};
