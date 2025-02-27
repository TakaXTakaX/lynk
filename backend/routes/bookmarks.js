const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Bookmark = require('../models/Bookmark');

// @route   GET /api/bookmarks
// @desc    Get all bookmarks for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(bookmarks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/bookmarks
// @desc    Create a new bookmark
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { url, title, description, tags, collection, favicon, thumbnail } = req.body;
    
    // Check if bookmark already exists for this user
    const existingBookmark = await Bookmark.findOne({ 
      user: req.user.id,
      url
    });
    
    if (existingBookmark) {
      return res.status(400).json({ message: 'Bookmark already exists' });
    }
    
    // Create new bookmark
    const newBookmark = new Bookmark({
      user: req.user.id,
      url,
      title,
      description,
      tags,
      collection,
      favicon,
      thumbnail
    });
    
    const bookmark = await newBookmark.save();
    res.json(bookmark);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/bookmarks/:id
// @desc    Get bookmark by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);
    
    // Check if bookmark exists
    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }
    
    // Check if user owns the bookmark
    if (bookmark.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    res.json(bookmark);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/bookmarks/:id
// @desc    Update bookmark
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, tags, collection } = req.body;
    
    // Find bookmark by ID
    let bookmark = await Bookmark.findById(req.params.id);
    
    // Check if bookmark exists
    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }
    
    // Check if user owns the bookmark
    if (bookmark.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Update fields
    bookmark.title = title || bookmark.title;
    bookmark.description = description || bookmark.description;
    bookmark.tags = tags || bookmark.tags;
    bookmark.collection = collection || bookmark.collection;
    bookmark.updatedAt = Date.now();
    
    // Save updated bookmark
    await bookmark.save();
    res.json(bookmark);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/bookmarks/:id
// @desc    Delete bookmark
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find bookmark by ID
    const bookmark = await Bookmark.findById(req.params.id);
    
    // Check if bookmark exists
    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }
    
    // Check if user owns the bookmark
    if (bookmark.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Delete bookmark
    await bookmark.remove();
    res.json({ message: 'Bookmark removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/bookmarks/search/:query
// @desc    Search bookmarks
// @access  Private
router.get('/search/:query', auth, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({
      $and: [
        { user: req.user.id },
        { $text: { $search: req.params.query } }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(bookmarks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;