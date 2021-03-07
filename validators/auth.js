const { body } = require('express-validator');
const User = require('../models/user');

const regValidator = [
  body(
    'name',
  )
    .isLength({ min: 3 })
    .withMessage('Name: minlength is 3!')
    .isAscii()
    .withMessage('Only ascii characters in name!')
    .trim(),
  body(
    'username',
  )
    .isLength({ min: 3 })
    .withMessage('Username: minlength is 3!')
    .isAlphanumeric()
    .withMessage('Only numbers and characters allowed in username!')
    .trim()
    .custom((value) => !/\s/.test(value))
    .withMessage('No spaces allowed in username!')
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
      if (user) {
        throw new Error('Username is already taken!');
      }
      return true;
    }),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email.')
    .custom((value) => !/\s/.test(value))
    .withMessage('No spaces are allowed in the email')
    .normalizeEmail()
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error('Email is already taken!');
      }
      return true;
    }),
  body('password1', 'Password min length: 6 characters, no spaces allowed.')
    .isLength({ min: 6 })
    .withMessage('Password minlength is 6.')
    .isAscii()
    .withMessage('Only ascii characters in password allowed.')
    .custom((value) => !/\s/.test(value))
    .withMessage('No spaces allowed')
    .trim(),
  body('password2').custom((value, { req }) => {
    if (value !== req.body.password1) {
      throw new Error('Passwords have to match!');
    }
    return true;
  }),
];

const loginValidator = [
  body(
    'username',
  )
    .isLength({ min: 3 })
    .withMessage('Username: minlength is 3!')
    .isAlphanumeric()
    .withMessage('Only numbers and characters allowed in username!')
    .trim()
    .custom((value) => !/\s/.test(value))
    .withMessage('No spaces allowed in username!')
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
      if (user) {
        return true;
      }
      throw new Error('User not found!');
    }),
  body('password', 'Password min length: 6 characters, no spaces allowed.')
    .isLength({ min: 6 })
    .withMessage('Password minlength is 6.')
    .isAscii()
    .withMessage('Only ascii characters in password allowed.')
    .custom((value) => !/\s/.test(value))
    .withMessage('No spaces allowed')
    .trim(),
];

module.exports = { regValidator, loginValidator };
