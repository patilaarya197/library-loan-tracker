const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book ID is required']
  },
  memberName: {
    type: String,
    required: [true, 'Member name is required'],
    trim: true
  },
  borrowDate: {
    type: Date,
    default: Date.now
  },
  returnDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Loan', loanSchema);
