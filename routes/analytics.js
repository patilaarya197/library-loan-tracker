const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Loan = require('../models/Loan');
const dataStore = require('../utils/dataStore');

// GET /analytics - Analytics page computing top borrowed books, overdue loans, and never-borrowed books
router.get('/', async (req, res) => {
  try {
    const isDbConnected = req.app.locals.isDbConnected !== false;

    let mostBorrowedBooks = [];
    let overdueLoans = [];
    let neverBorrowedBooks = [];

    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    if (isDbConnected) {
      try {
        // (1) Most-borrowed books pipeline
        mostBorrowedBooks = await Loan.aggregate([
          { $group: { _id: '$bookId', borrowCount: { $sum: 1 } } },
          { $sort: { borrowCount: -1 } },
          { $limit: 5 },
          { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } },
          { $unwind: '$book' }
        ]);

        // (2) Currently overdue loans pipeline
        overdueLoans = await Loan.aggregate([
          { $match: { returnDate: null, borrowDate: { $lt: fourteenDaysAgo } } },
          { $lookup: { from: 'books', localField: 'bookId', foreignField: '_id', as: 'book' } },
          { $unwind: '$book' },
          { $sort: { borrowDate: 1 } }
        ]);

        // (3) Books never borrowed pipeline
        neverBorrowedBooks = await Book.aggregate([
          { $lookup: { from: 'loans', localField: '_id', foreignField: 'bookId', as: 'loans' } },
          { $match: { loans: { $size: 0 } } },
          { $sort: { title: 1 } }
        ]);
      } catch (err) {
        console.warn('MongoDB aggregation failed, falling back to dataStore calculations:', err.message);
      }
    }

    // Fallback logic using dataStore if MongoDB is offline or returned empty sets
    if (!mostBorrowedBooks.length && !overdueLoans.length && !neverBorrowedBooks.length) {
      const allBooks = await dataStore.getAllBooks(false);
      const allLoans = await dataStore.getAllLoans(false, 'all');

      // 1. Most Borrowed Books
      const countMap = {};
      allLoans.forEach(l => {
        if (l.bookId) {
          const bId = l.bookId._id ? l.bookId._id.toString() : l.bookId.toString();
          countMap[bId] = (countMap[bId] || 0) + 1;
        }
      });

      mostBorrowedBooks = Object.keys(countMap)
        .map(bId => {
          const bookObj = allBooks.find(b => b._id.toString() === bId) || allLoans.find(l => l.bookId && l.bookId._id.toString() === bId)?.bookId;
          return {
            book: bookObj || { title: 'Unknown', author: '—', category: 'General' },
            borrowCount: countMap[bId]
          };
        })
        .sort((a, b) => b.borrowCount - a.borrowCount)
        .slice(0, 5);

      // 2. Overdue Loans
      overdueLoans = allLoans.filter(l => !l.returnDate && new Date(l.borrowDate).getTime() < fourteenDaysAgo.getTime()).map(l => ({
        ...l,
        book: l.bookId || { title: 'Unknown' }
      }));

      // 3. Books Never Borrowed
      const borrowedBookIds = new Set(allLoans.map(l => l.bookId ? (l.bookId._id ? l.bookId._id.toString() : l.bookId.toString()) : ''));
      neverBorrowedBooks = allBooks.filter(b => !borrowedBookIds.has(b._id.toString()));
    }

    res.render('analytics', {
      pageTitle: 'Analytics & Insights',
      activeTab: 'analytics',
      isDbConnected,
      mostBorrowedBooks,
      overdueLoans,
      neverBorrowedBooks
    });
  } catch (error) {
    console.error('Error rendering analytics page:', error);
    res.render('analytics', {
      pageTitle: 'Analytics & Insights',
      activeTab: 'analytics',
      isDbConnected: false,
      mostBorrowedBooks: [],
      overdueLoans: [],
      neverBorrowedBooks: [],
      error: 'Failed to compute analytics.'
    });
  }
});

module.exports = router;
