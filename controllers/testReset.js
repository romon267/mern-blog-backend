const router = require('express').Router();
const Post = require('../models/post');
const User = require('../models/user');

// This endpoint is used when running server in test mode
// to keep the DB state predictable every time
router.post('/reset', async (req, res) => {
  await Post.deleteMany();
  await User.deleteMany();

  res.status(204).end();
});

module.exports = router;
