const mongoose = require('mongoose');

// Schema: Defines the blueprint/structure of each Note in our database
const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  pinned: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#1e1e2f' // Default dark card color
  },
  tags: {
    type: [String],
    default: []
  }
}, {
  // Automatically adds createdAt and updatedAt timestamp fields
  timestamps: true
});

// Model: An interface to query and interact with the database using our Schema
module.exports = mongoose.model('Note', NoteSchema);
