const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    default: 'General'
  },
  totalCopies: {
    type: Number,
    required: [true, 'Total copies is required'],
    min: [0, 'Total copies cannot be negative'],
    default: 1
  },
  availableCopies: {
    type: Number,
    default: function() {
      return this.totalCopies;
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);
