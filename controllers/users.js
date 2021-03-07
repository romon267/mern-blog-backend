const bcrypt = require('bcryptjs');
const usersRouter = require('express').Router();
const { validationResult } = require('express-validator');
const User = require('../models/user');
const { regValidator } = require('../validators/auth');

// This controller is used for
// Getting users from DB
// Creating new users

// Fetching all users and populating their posts data
usersRouter.get('/', async (req, res) => {
  const users = await User.find().populate('posts', { title: 1, url: 1, likes: 1 });
  return res.json(users);
});

// Creating a new user, with validation!
usersRouter.post('/', regValidator, async (req, res) => {
  // Validating the user input and throwing errors if any
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const {
    name,
    email,
    username,
    password1,
  } = req.body;
  // If no errors => encrypt the password
  const passwordHash = await bcrypt.hash(password1, 12);

  // And then create a new user
  const user = new User({
    name,
    email,
    username,
    passwordHash,
  });
  // Save the user to a database and respond to request with it
  const savedUser = await user.save();
  return res.status(201).json(savedUser);
});

module.exports = usersRouter;
