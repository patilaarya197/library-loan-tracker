const express = require('express');
const router = express.Router();
const dataStore = require('../utils/dataStore');

// GET / - Library Dashboard
router.get('/', async (req, res) => {
  try {
    const isDbConnected = req.app.locals.isDbConnected !== false;
    const stats = await dataStore.getDashboardStats(isDbConnected);

    res.render('dashboard', {
      pageTitle: 'Dashboard',
      activeTab: 'dashboard',
      isDbConnected,
      totalBooks: stats.totalBooks,
      activeLoans: stats.activeLoans,
      overdueLoans: stats.overdueLoans
    });
  } catch (error) {
    console.error('Error rendering dashboard:', error);
    res.render('dashboard', {
      pageTitle: 'Dashboard',
      activeTab: 'dashboard',
      isDbConnected: false,
      totalBooks: 0,
      activeLoans: 0,
      overdueLoans: 0,
      error: 'Failed to connect to database.'
    });
  }
});

module.exports = router;
