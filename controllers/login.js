const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const loginRouter = require('express').Router();
const { validationResult } = require('express-validator');
const User = require('../models/user');
const { loginValidator } = require('../validators/auth');

// This contoller is used for authenticating users
// Post route is logging user in

loginRouter.post('/', loginValidator, async (req, res) => {
  // Validating the user input and throwing errors if any
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, password } = req.body;
  // Searching the user with provided username
  const user = await User.findOne({ username });
  // If user is valid, comparing passwords
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash);

  // If user or password is invalid, return error
  if (!(user && passwordCorrect)) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  // If data is valid and correct, create a token and send back with a response
  const userForToken = {
    username: user.username,
    // eslint-disable-next-line no-underscore-dangle
    id: user._id,
  };
  const token = jwt.sign(userForToken, process.env.SECRET);
  return res.status(200).send({ token, username: user.username });
});

module.exports = loginRouter;
