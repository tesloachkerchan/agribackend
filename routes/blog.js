const express = require('express')
const router = express.Router();
const axios = require('axios')
const multer = require('multer');
const fs = require('fs');
const path = require('path')
const Post = require('../models/blogModel')
const upload = multer({ dest: 'uploads/' });

router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/posts',upload.single('blog'), async (req, res) => {
  const { categories, title, author, description } = req.body;

  // Check if file was uploaded successfully
    if (!req.file) {
      return res.status(400).json({ message: 'No blog file uploaded' });
    }

    // Upload license image to imgbb
        const fileData = fs.readFileSync(req.file.path);
        const base64Data = fileData.toString('base64');

        const formData = new FormData();
        formData.append('image', base64Data);
        const IMGKEY = process.env.IMG_KEY;

    const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
      params: {
        key: IMGKEY,
      },
    });

  const img = response.data.data.url;
    const newPost = new Post({
    img,
    categories,
    title,
    author,
    description,
  });

  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/posts/:id', async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPost) return res.status(404).json({ message: 'Post not found' });
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/posts/:id', async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export the router
module.exports = router;