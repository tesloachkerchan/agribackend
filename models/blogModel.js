const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  img: {
    type: String,
    required: true,
  },
  categories: {
    type: [String],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
},
    { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
