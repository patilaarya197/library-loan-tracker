const express = require('express');
const router = express.Router();
const dataStore = require('../utils/dataStore');

// GET /loans - List active loans with form to issue new loan
router.get('/', async (req, res) => {
  try {
    const isDbConnected = req.app.locals.isDbConnected !== false;
    const { search, filter } = req.query;
    const filterType = filter || 'active';

    const booksAvailable = await dataStore.getAllBooks(isDbConnected);
    const loans = await dataStore.getAllLoans(isDbConnected, filterType, search);

    res.render('loans/index', {
      pageTitle: 'Loan Tracking',
      activeTab: 'loans',
      isDbConnected,
      loans,
      booksAvailable: booksAvailable.filter(b => (b.availableCopies !== undefined ? b.availableCopies : b.totalCopies) > 0),
      filter: filterType,
      search: search || '',
      message: req.query.msg || null,
      error: req.query.error || null
    });
  } catch (error) {
    console.error('Error fetching active loans:', error);
    res.render('loans/index', {
      pageTitle: 'Loan Tracking',
      activeTab: 'loans',
      isDbConnected: false,
      loans: [],
      booksAvailable: [],
      filter: 'active',
      search: '',
      error: 'Failed to load loan tracking entries.'
    });
  }
});

// POST /loans - Create a new loan
router.post('/', async (req, res) => {
  try {
    const isDbConnected = req.app.locals.isDbConnected !== false;
    const { bookId, memberName } = req.body;
    
    if (!bookId || !memberName) {
      return res.redirect('/loans?error=Please+provide+both+book+and+member+name');
    }

    await dataStore.createLoan(isDbConnected, bookId, memberName);
    res.redirect('/loans?msg=Loan+issued+successfully');
  } catch (error) {
    console.error('Error creating loan:', error);
    res.redirect(`/loans?error=${encodeURIComponent(error.message || 'Failed to create loan.')}`);
  }
});

// POST /loans/:id/return - Set returnDate to now
router.post('/:id/return', async (req, res) => {
  try {
    const isDbConnected = req.app.locals.isDbConnected !== false;
    await dataStore.returnLoan(isDbConnected, req.params.id);
    res.redirect('/loans?msg=Book+returned+successfully');
  } catch (error) {
    console.error('Error setting return date:', error);
    res.redirect('/loans?error=Failed+to+process+book+return');
  }
});

module.exports = router;
