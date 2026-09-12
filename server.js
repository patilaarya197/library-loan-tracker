require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/library-loan-tracker';

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Global DB connection status tracking
app.locals.isDbConnected = false;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully to:', MONGO_URI);
    app.locals.isDbConnected = true;
  })
  .catch((err) => {
    console.warn('⚠️  MongoDB Connection Warning:', err.message);
    console.warn('   Running in offline/preview mode. Database features will show placeholder UI until MongoDB is available.');
    app.locals.isDbConnected = false;
  });

// Mount Routes
const indexRoutes = require('./routes/index');
const booksRoutes = require('./routes/books');
const loansRoutes = require('./routes/loans');
const analyticsRoutes = require('./routes/analytics');

app.use('/', indexRoutes);
app.use('/books', booksRoutes);
app.use('/loans', loansRoutes);
app.use('/analytics', analyticsRoutes);

// 404 Page Handler
app.use((req, res) => {
  res.status(404).render('dashboard', {
    pageTitle: 'Page Not Found',
    activeTab: '',
    isDbConnected: app.locals.isDbConnected,
    totalBooks: 0,
    activeLoans: 0,
    overdueLoans: 0,
    error: '404 - The requested page could not be found.'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Library Loan Tracker server running on http://localhost:${PORT}`);
});
