/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minLength: 5,
  },
  content: {
    type: String,
    required: true,
    minLength: 6,
  },
  url: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
  },
  comments: [
    {
      id: String,
      content: String,
      author: String,
    },
  ],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// When converting to json(when sending data to front-end)
// We remove _id(special ObjectId type) and set id(String)
// and __v property as not needed
postSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Post', postSchema);
