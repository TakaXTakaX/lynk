const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Collection = require('../models/Collection');
const Bookmark = require('../models/Bookmark');

// @route   GET /api/collections
// @desc    Get all collections for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const collections = await Collection.find({ user: req.user.id })
      .sort({ name: 1 });
    res.json(collections);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/collections
// @desc    Create a new collection
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    // Check if collection name already exists for this user
    const existingCollection = await Collection.findOne({ 
      user: req.user.id,
      name
    });
    
    if (existingCollection) {
      return res.status(400).json({ message: 'Collection name already exists' });
    }
    
    // Create new collection
    const newCollection = new Collection({
      user: req.user.id,
      name,
      description,
      color
    });
    
    const collection = await newCollection.save();
    res.json(collection);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/collections/:id
// @desc    Update collection
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    // Find collection by ID
    let collection = await Collection.findById(req.params.id);
    
    // Check if collection exists
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    // Check if user owns the collection
    if (collection.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Update fields
    collection.name = name || collection.name;
    collection.description = description || collection.description;
    collection.color = color || collection.color;
    
    // Save updated collection
    await collection.save();
    res.json(collection);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/collections/:id
// @desc    Delete collection
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find collection by ID
    const collection = await Collection.findById(req.params.id);
    
    // Check if collection exists
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    // Check if user owns the collection
    if (collection.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Remove collection from bookmarks
    await Bookmark.updateMany(
      { collection: req.params.id },
      { $unset: { collection: "" } }
    );
    
    // Delete collection
    await collection.remove();
    res.json({ message: 'Collection removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/collections/:id/bookmarks
// @desc    Get all bookmarks in a collection
// @access  Private
router.get('/:id/bookmarks', auth, async (req, res) => {
  try {
    // Check if collection exists and belongs to user
    const collection = await Collection.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    // Get bookmarks in collection
    const bookmarks = await Bookmark.find({
      user: req.user.id,
      collection: req.params.id
    }).sort({ createdAt: -1 });
    
    res.json(bookmarks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;