const { body } = require('express-validator');

const postValidator = [
  body(
    'title',
  )
    .isLength({ min: 5 })
    .withMessage('Title: minlength is 5!')
    .trim(),
  body('content')
    .isLength({ min: 6 })
    .withMessage('Content: minlength is 6.')
    .trim(),
];

module.exports = { postValidator };
