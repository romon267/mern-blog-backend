const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcryptjs');
const { usersInDb } = require('./test_helper');
const app = require('../app');
const User = require('../models/user');

const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany();
  const passwordHash = await bcrypt.hash('rootpassword', 12);
  const newUser = new User({
    name: 'root',
    username: 'root',
    email: 'rooter@root.com',
    passwordHash,
  });
  await newUser.save();
});

describe('creating a new user', () => {
  test('succeeds if data is valid', async () => {
    const usersAtStart = await usersInDb();
    const user = {
      name: 'Valid Name',
      email: 'valid@email.com',
      username: 'validUser123',
      password1: 'matchingPasswords123',
      password2: 'matchingPasswords123',
    };
    await api
      .post('/api/users')
      .send(user)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    const usersAtEnd = await usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);
    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(user.username);
  });

  test('fails if 1 field is invalid', async () => {
    const usersAtStart = await usersInDb();
    const user = {
      name: 'Ve',
      email: 'valid@email.com',
      username: 'validUser123',
      password1: 'matchingPasswords123',
      password2: 'matchingPasswords123',
    };
    await api
      .post('/api/users')
      .send(user)
      .expect(400);
    const usersAtEnd = await usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).not.toContain(user.username);
  });

  test('fails if multiple fields are invalid', async () => {
    const usersAtStart = await usersInDb();
    const user = {
      name: 'Ve',
      email: 'novalid',
      username: '13',
      password1: 'matchingPass words123',
      password2: 'matchingPrds123',
    };
    await api
      .post('/api/users')
      .send(user)
      .expect(400);
    const usersAtEnd = await usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).not.toContain(user.username);
  });

  test('fails if username or email is already taken', async () => {
    const usersAtStart = await usersInDb();
    const user = {
      name: 'root',
      username: 'root',
      email: 'rooter@root.com',
      password1: 'matching123',
      password2: 'matching123',
    };
    const response = await api
      .post('/api/users')
      .send(user)
      .expect(400);
    const errors = response.body.errors.map((error) => error.msg);
    const usersAtEnd = await usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
    expect(errors).toContain('Username is already taken!');
  });
});

afterAll(() => {
  mongoose.connection.close();
});
