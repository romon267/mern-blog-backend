/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcryptjs');
const { initialPosts, postsInDb } = require('./test_helper');
const app = require('../app');
const Post = require('../models/post');
const User = require('../models/user');

const api = supertest(app);

// Before each test the testing database is reset to have only initial posts
beforeEach(async () => {
  await Post.deleteMany();
  const user = User.findOne();
  const initialChanged = initialPosts.map(({ title, likes, url }) => ({
    title, likes, url, author: user._id,
  }));
  const postObjects = initialChanged.map((post) => new Post(post));
  const promiseArray = postObjects.map((post) => post.save());
  await Promise.all(promiseArray);
});

describe('getting the posts:', () => {
  // GET => /api/posts returning valid data
  test('posts returned in correct amount and type', async () => {
    const response = await api
      .get('/api/posts')
      .expect(200)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toHaveLength(initialPosts.length);
  });

  // Fetching a single post returning valid data
  test('single post can be retrieved + id defined', async () => {
    const posts = await postsInDb();
    const postToView = posts[3];
    const response = await api
      .get(`/api/posts/${postToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toEqual(postToView);
    expect(response.body.id).toBeDefined();
  });
});

describe('Adding a new post:', () => {
  // Post creation working as intended
  test('a valid post can be created only logged in', async () => {
    const postsAtStart = await postsInDb();
    const newPost = {
      title: 'The new post for a test',
      likes: 12,
      url: 'asdas/',
    };
    // logging in
    const rootUser = {
      username: 'root',
      password: 'rootpassword',
    };
    const response = await api
      .post('/api/login')
      .send(rootUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    const { token } = response.body;
    // Creting a post
    await api
      .post('/api/posts')
      .send(newPost)
      .set('Authorization', `bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    const postsAtEnd = await postsInDb();
    const postsNoIds = postsAtEnd.map(({
      title, likes, url,
    }) => ({
      title,
      likes,
      url,
    }));
    expect(postsAtEnd).toHaveLength(postsAtStart.length + 1);
    expect(postsNoIds).toContainEqual(newPost);
  });

  // Post creation with only title and author
  test('post creation is valid with title only', async () => {
    // logging in
    const rootUser = {
      username: 'root',
      password: 'rootpassword',
    };
    const responseL = await api
      .post('/api/login')
      .send(rootUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    const { token } = responseL.body;
    // Creating and sending post
    const postsAtStart = await postsInDb();
    const newPost = {
      title: 'Big brain post meme',
    };
    const createdPost = {
      title: 'Big brain post meme',
      url: 'big-brain-post-meme-root',
      likes: 0,
    };
    const response = await api
      .post('/api/posts')
      .send(newPost)
      .set('Authorization', `bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    const postsAtEnd = await postsInDb();
    const postsNoIds = postsAtEnd.map(({
      title, likes, url,
    }) => ({
      title,
      likes,
      url,
    }));
    expect(response.body.id).toBeDefined();
    expect(response.body.likes).toBeDefined();
    expect(response.body.url).toBeDefined();
    expect(postsAtEnd).toHaveLength(postsAtStart.length + 1);
    expect(postsNoIds).toContainEqual(createdPost);
  });

  // Post creation is rejected if no title provided
  test('post cant be created without a title', async () => {
    const postsAtStart = await postsInDb();
    const newPost = {
      author: 'dummy',
    };
    await api.post('/api/posts').send(newPost).expect(400);
    const postsAtEnd = await postsInDb();
    expect(postsAtEnd).toHaveLength(postsAtStart.length);
    expect(postsAtEnd).toEqual(postsAtStart);
  });
});

describe('Deleting a post', () => {
  test('works if request is valid', async () => {
    const postsAtStart = await postsInDb();
    // logging in
    const rootUser = {
      username: 'root',
      password: 'rootpassword',
    };
    const responseL = await api
      .post('/api/login')
      .send(rootUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    const { token } = responseL.body;
    // Creating a post
    const newPost = { title: 'DUmb post' };
    await api
      .post('/api/posts')
      .send(newPost)
      .set('Authorization', `bearer ${token}`)
      .expect(201)
      .expect('Content-type', /application\/json/);
    // Deleting post
    const post = await Post.findOne({ title: newPost.title });
    console.log('post for deletion', post);
    await api
      .delete(`/api/posts/${post._id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204);
    const postsAtEnd = await postsInDb();
    const titles = postsAtEnd.map((p) => p.title);
    expect(postsAtEnd).toHaveLength(postsAtStart.length - 1);
    expect(titles).not.toContain(newPost.title);
  });

  test('not working if id is non existing', async () => {
    // logging in
    const rootUser = {
      username: 'root',
      password: 'rootpassword',
    };
    const responseL = await api
      .post('/api/login')
      .send(rootUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    const { token } = responseL.body;
    //
    const postsAtStart = await postsInDb();
    await api
      .delete(`/api/posts/${postsAtStart[0].id.replace('6', '5')}`)
      .set('Authorization', `bearer ${token}`)
      .expect(400);
    const postsAtEnd = await postsInDb();
    expect(postsAtEnd).toHaveLength(postsAtStart.length);
  });

  test('not working if id is crap', async () => {
    // logging in
    const rootUser = {
      username: 'root',
      password: 'rootpassword',
    };
    const responseL = await api
      .post('/api/login')
      .send(rootUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    const { token } = responseL.body;
    //
    const postsAtStart = await postsInDb();
    await api
      .delete('/api/posts/crap')
      .set('Authorization', `bearer ${token}`)
      .expect(400);
    const postsAtEnd = await postsInDb();
    expect(postsAtEnd).toHaveLength(postsAtStart.length);
  });

  test('not working if user is not authorized', async () => {
    const postsAtStart = await postsInDb();
    await api
      .delete(`/api/posts/${postsAtStart[0].id}`)
      .expect(401);
    const postsAtEnd = await postsInDb();
    expect(postsAtEnd).toHaveLength(postsAtStart.length);
  });

  test('not working if user is not author of post', async () => {
    // Creating second user
    const passwordHash = await bcrypt.hash('rootpassword', 12);
    const newUser = new User({
      name: 'root2',
      username: 'root2',
      email: 'rooter2@root.com',
      passwordHash,
    });
    await newUser.save();
    // logging in
    const rootUser = {
      username: 'root2',
      password: 'rootpassword',
    };
    const responseL = await api
      .post('/api/login')
      .send(rootUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    const { token } = responseL.body;
    //
    const postsAtStart = await postsInDb();
    await api
      .delete(`/api/posts/${postsAtStart[0].id}`)
      .send('Authorization', `bearer ${token}`)
      .expect(401);
    const postsAtEnd = await postsInDb();
    expect(postsAtEnd).toHaveLength(postsAtStart.length);
  });
});

describe('Updating a post', () => {
  test('works with full data', async () => {
    // logging in
    const rootUser = {
      username: 'root',
      password: 'rootpassword',
    };
    const responseL = await api
      .post('/api/login')
      .send(rootUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    const { token } = responseL.body;
    //
    const postsAtStart = await postsInDb();
    const postToChange = postsAtStart[1];
    const cPost = {
      title: 'New title',
      url: 'url-is-new',
      likes: 75,
    };
    const sError = await api
      .put(`/api/posts/${postToChange.id}`)
      .send(cPost)
      .set('Authorization', `bearer ${token}`);
      // .expect(200);
    console.log('error::::::::::::::::::::', sError);
    const postsAtEnd = await postsInDb();
    const postsNoIds = postsAtEnd.map(({
      title, likes, url,
    }) => ({
      title,
      likes,
      url,
    }));
    expect(postsNoIds).toContainEqual(cPost);
  });

  test('works with one field', async () => {
    // logging in
    const rootUser = {
      username: 'root',
      password: 'rootpassword',
    };
    const responseL = await api
      .post('/api/login')
      .send(rootUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    const { token } = responseL.body;
    //
    const postsAtStart = await postsInDb();
    const postToChange = postsAtStart[1];
    const cPost = {
      likes: 75,
    };
    await api
      .put(`/api/posts/${postToChange.id}`)
      .send(cPost)
      .set('Authorization', `bearer ${token}`)
      .expect(200);
    const postsAtEnd = await postsInDb();
    const changedPost = {
      title: postToChange.title,
      author: postToChange.author,
      url: postToChange.url,
      likes: 75,
    };
    const postsNoIds = postsAtEnd.map(({
      title, likes, url,
    }) => ({
      title,
      likes,
      url,
    }));
    expect(postsNoIds).toContainEqual(changedPost);
  });

  test('not working with invalid id', async () => {
    // logging in
    const rootUser = {
      username: 'root',
      password: 'rootpassword',
    };
    const responseL = await api
      .post('/api/login')
      .send(rootUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    const { token } = responseL.body;
    //
    const postsAtStart = await postsInDb();
    const cPost = {
      likes: 75,
    };
    await api
      .put('/api/posts/crap')
      .set('Authorization', `bearer ${token}`)
      .expect(400);
    const postsAtEnd = await postsInDb();
    expect(postsAtEnd).toEqual(postsAtStart);
    expect(postsAtEnd).not.toContainEqual(cPost);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
