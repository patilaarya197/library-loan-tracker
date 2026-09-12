const express = require('express');
const router = express.Router();
const dataStore = require('../utils/dataStore');

// GET /books - List all books with a form to add a new book
router.get('/', async (req, res) => {
  try {
    const isDbConnected = req.app.locals.isDbConnected !== false;
    const { search, category } = req.query;

    const books = await dataStore.getAllBooks(isDbConnected, { search, category });
    const categories = ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Arts', 'General'];

    res.render('books/index', {
      pageTitle: 'Book Inventory',
      activeTab: 'books',
      isDbConnected,
      books,
      categories,
      search: search || '',
      category: category || 'All',
      message: req.query.msg || null,
      error: req.query.error || null
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.render('books/index', {
      pageTitle: 'Book Inventory',
      activeTab: 'books',
      isDbConnected: false,
      books: [],
      categories: ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Arts', 'General'],
      search: '',
      category: 'All',
      error: 'Failed to load books repository.'
    });
  }
});

// POST /books - Create a book
router.post('/', async (req, res) => {
  try {
    const isDbConnected = req.app.locals.isDbConnected !== false;
    const { title, author, category, totalCopies } = req.body;

    if (!title || !author) {
      return res.redirect('/books?error=Title+and+Author+are+required');
    }

    await dataStore.createBook(isDbConnected, { title, author, category, totalCopies });
    res.redirect('/books?msg=Book+successfully+added');
  } catch (error) {
    console.error('Error creating book:', error);
    res.redirect(`/books?error=${encodeURIComponent(error.message || 'Failed to create book.')}`);
  }
});

// GET /books/:id/edit - Form to edit a book
router.get('/:id/edit', async (req, res) => {
  try {
    const isDbConnected = req.app.locals.isDbConnected !== false;
    const book = await dataStore.getBookById(isDbConnected, req.params.id);
    
    if (!book) {
      return res.redirect('/books?error=Book+not+found');
    }
    const categories = ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Arts', 'General'];
    
    res.render('books/edit', {
      pageTitle: `Edit ${book.title}`,
      activeTab: 'books',
      isDbConnected,
      book,
      categories
    });
  } catch (error) {
    console.error('Error fetching book for edit:', error);
    res.redirect('/books?error=Could+not+fetch+book+details');
  }
});

// POST /books/:id/edit - Update a book
router.post('/:id/edit', async (req, res) => {
  try {
    const isDbConnected = req.app.locals.isDbConnected !== false;
    const { title, author, category, totalCopies } = req.body;

    await dataStore.updateBook(isDbConnected, req.params.id, { title, author, category, totalCopies });
    res.redirect('/books?msg=Book+updated+successfully');
  } catch (error) {
    console.error('Error updating book:', error);
    res.redirect(`/books?error=${encodeURIComponent(error.message || 'Failed to update book.')}`);
  }
});

// Helper function to handle book deletion
async function deleteBookHandler(req, res) {
  try {
    const isDbConnected = req.app.locals.isDbConnected !== false;
    await dataStore.deleteBook(isDbConnected, req.params.id);
    res.redirect('/books?msg=Book+deleted+successfully');
  } catch (error) {
    console.error('Error deleting book:', error);
    res.redirect(`/books?error=${encodeURIComponent(error.message || 'Failed to delete book')}`);
  }
}

// GET /books/:id/delete - Delete a book via GET link
router.get('/:id/delete', deleteBookHandler);

// POST /books/:id/delete - Delete a book via POST form submission
router.post('/:id/delete', deleteBookHandler);

module.exports = router;
