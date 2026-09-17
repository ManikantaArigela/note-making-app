const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// ==========================================
// 1. READ: Get All Notes
// ==========================================
router.get('/', async (req, res) => {
  try {
    // Sort notes: pinned ones first, then most recently updated ones first
    const notes = await Note.find().sort({ pinned: -1, updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
});

// ==========================================
// 2. CREATE: Add a New Note
// ==========================================
router.post('/', async (req, res) => {
  try {
    const { title, content, pinned, color, tags } = req.body;
    
    // Create a new Note document instance
    const newNote = new Note({
      title,
      content,
      pinned,
      color,
      tags
    });

    // Save the note to MongoDB
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(400).json({ message: 'Error creating note', error: error.message });
  }
});

// ==========================================
// 3. UPDATE: Modify an Existing Note
// ==========================================
router.put('/:id', async (req, res) => {
  try {
    const { title, content, pinned, color, tags } = req.body;
    
    // Find the note by ID and update it with the new properties
    // { new: true } returns the updated note rather than the old one
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content, pinned, color, tags },
      { new: true, runValidators: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: 'Error updating note', error: error.message });
  }
});

// ==========================================
// 4. DELETE: Remove a Note
// ==========================================
router.delete('/:id', async (req, res) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.id);

    if (!deletedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
});

module.exports = router;
