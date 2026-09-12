const Book = require('../models/Book');
const Loan = require('../models/Loan');

// Initial seed books including the user's specific catalog requirements
const initialBooks = [
  { _id: 'mem_book_1', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Technology', totalCopies: 1, availableCopies: 0, createdAt: new Date() },
  { _id: 'mem_book_2', title: 'Refactoring', author: 'Martin Fowler', category: 'Technology', totalCopies: 3, availableCopies: 2, createdAt: new Date() },
  { _id: 'mem_book_3', title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction', totalCopies: 4, availableCopies: 4, createdAt: new Date() },
  { _id: 'mem_book_4', title: '1984', author: 'George Orwell', category: 'Fiction', totalCopies: 5, availableCopies: 4, createdAt: new Date() },
  { _id: 'mem_book_5', title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas', category: 'Technology', totalCopies: 3, availableCopies: 2, createdAt: new Date() },
  { _id: 'mem_book_6', title: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Science', totalCopies: 4, availableCopies: 4, createdAt: new Date() },
  { _id: 'mem_book_7', title: 'clean code', author: 'Robert C. Martin', category: 'Technology', totalCopies: 2, availableCopies: 1, createdAt: new Date() },
  { _id: 'mem_book_8', title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History', totalCopies: 5, availableCopies: 5, createdAt: new Date() }
];

const now = Date.now();
const dayMs = 24 * 60 * 60 * 1000;

// Initial seed loans corresponding exactly to the user's prompt specifications
const initialLoans = [
  // 1. Introduction to Algorithms -> Aarya Patil -> leave active (only 1 copy total - 0 available left)
  {
    _id: 'mem_loan_1',
    bookId: { _id: 'mem_book_1', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen' },
    memberName: 'Aarya Patil',
    borrowDate: new Date(now - 2 * dayMs),
    returnDate: null,
    createdAt: new Date(now - 2 * dayMs)
  },
  // 2. Refactoring -> Ravi Sharma -> leave active
  {
    _id: 'mem_loan_2',
    bookId: { _id: 'mem_book_2', title: 'Refactoring', author: 'Martin Fowler' },
    memberName: 'Ravi Sharma',
    borrowDate: new Date(now - 1 * dayMs),
    returnDate: null,
    createdAt: new Date(now - 1 * dayMs)
  },
  // 3. To Kill a Mockingbird -> Meera Nair -> mark Returned right after
  {
    _id: 'mem_loan_3',
    bookId: { _id: 'mem_book_3', title: 'To Kill a Mockingbird', author: 'Harper Lee' },
    memberName: 'Meera Nair',
    borrowDate: new Date(now - 7 * dayMs),
    returnDate: new Date(now - 1 * dayMs),
    createdAt: new Date(now - 7 * dayMs)
  },
  // 4. 1984 -> Karan Mehta -> leave active & overdue (> 14 days ago, 20 days)
  {
    _id: 'mem_loan_4',
    bookId: { _id: 'mem_book_4', title: '1984', author: 'George Orwell' },
    memberName: 'Karan Mehta',
    borrowDate: new Date(now - 20 * dayMs),
    returnDate: null,
    createdAt: new Date(now - 20 * dayMs)
  },
  // 5. The Pragmatic Programmer -> Sofia Rossi -> leave active
  {
    _id: 'mem_loan_5',
    bookId: { _id: 'mem_book_5', title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas' },
    memberName: 'Sofia Rossi',
    borrowDate: new Date(now - 3 * dayMs),
    returnDate: null,
    createdAt: new Date(now - 3 * dayMs)
  },
  // 6. A Brief History of Time -> Divya Kulkarni -> mark Returned right after
  {
    _id: 'mem_loan_6',
    bookId: { _id: 'mem_book_6', title: 'A Brief History of Time', author: 'Stephen Hawking' },
    memberName: 'Divya Kulkarni',
    borrowDate: new Date(now - 5 * dayMs),
    returnDate: new Date(now - 2 * dayMs),
    createdAt: new Date(now - 5 * dayMs)
  },
  // 7. clean code (lowercase entry) -> Arjun Verma -> leave active
  {
    _id: 'mem_loan_7',
    bookId: { _id: 'mem_book_7', title: 'clean code', author: 'Robert C. Martin' },
    memberName: 'Arjun Verma',
    borrowDate: new Date(now - 4 * dayMs),
    returnDate: null,
    createdAt: new Date(now - 4 * dayMs)
  }
];

let inMemoryBooks = [...initialBooks];
let inMemoryLoans = [...initialLoans];

const dataStore = {
  // Books Operations
  async getAllBooks(isDbConnected, filters = {}) {
    if (isDbConnected) {
      try {
        let query = {};
        if (filters.search) {
          query.$or = [
            { title: { $regex: filters.search, $options: 'i' } },
            { author: { $regex: filters.search, $options: 'i' } }
          ];
        }
        if (filters.category && filters.category !== 'All') {
          query.category = filters.category;
        }
        return await Book.find(query).sort({ title: 1 }).lean();
      } catch (err) {
        console.warn('DB read fallback to memory for books:', err.message);
      }
    }

    let results = [...inMemoryBooks];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      results = results.filter(b => b.title.toLowerCase().includes(s) || b.author.toLowerCase().includes(s));
    }
    if (filters.category && filters.category !== 'All') {
      results = results.filter(b => b.category === filters.category);
    }
    return results;
  },

  async createBook(isDbConnected, bookData) {
    const copies = parseInt(bookData.totalCopies) || 1;
    if (isDbConnected) {
      try {
        const newBook = new Book({
          title: bookData.title,
          author: bookData.author,
          category: bookData.category || 'General',
          totalCopies: copies,
          availableCopies: copies
        });
        return await newBook.save();
      } catch (err) {
        console.warn('DB create failed, using memory store:', err.message);
      }
    }

    const newMemBook = {
      _id: 'mem_book_' + Date.now(),
      title: bookData.title,
      author: bookData.author,
      category: bookData.category || 'General',
      totalCopies: copies,
      availableCopies: copies,
      createdAt: new Date()
    };
    inMemoryBooks.unshift(newMemBook);
    return newMemBook;
  },

  async getBookById(isDbConnected, id) {
    if (isDbConnected) {
      try {
        return await Book.findById(id);
      } catch (err) {
        console.warn('DB getBookById failed, trying memory:', err.message);
      }
    }
    return inMemoryBooks.find(b => b._id.toString() === id.toString()) || null;
  },

  async updateBook(isDbConnected, id, bookData) {
    const newTotal = parseInt(bookData.totalCopies) || 1;
    if (isDbConnected) {
      try {
        const book = await Book.findById(id);
        if (book) {
          const currentAvailable = book.availableCopies !== undefined ? book.availableCopies : book.totalCopies;
          const borrowedCount = Math.max(0, book.totalCopies - currentAvailable);

          book.title = bookData.title;
          book.author = bookData.author;
          book.category = bookData.category;
          book.totalCopies = newTotal;
          book.availableCopies = Math.max(0, newTotal - borrowedCount);
          return await book.save();
        }
      } catch (err) {
        console.warn('DB update failed, using memory:', err.message);
      }
    }

    const idx = inMemoryBooks.findIndex(b => b._id.toString() === id.toString());
    if (idx !== -1) {
      const b = inMemoryBooks[idx];
      const borrowedCount = Math.max(0, b.totalCopies - b.availableCopies);
      inMemoryBooks[idx] = {
        ...b,
        title: bookData.title,
        author: bookData.author,
        category: bookData.category,
        totalCopies: newTotal,
        availableCopies: Math.max(0, newTotal - borrowedCount)
      };
      return inMemoryBooks[idx];
    }
    return null;
  },

  async deleteBook(isDbConnected, id) {
    if (isDbConnected) {
      try {
        const activeLoans = await Loan.countDocuments({ bookId: id, returnDate: null });
        if (activeLoans > 0) {
          throw new Error(`Cannot delete book with ${activeLoans} active loan(s).`);
        }
        return await Book.findByIdAndDelete(id);
      } catch (err) {
        if (err.message.includes('Cannot delete')) throw err;
        console.warn('DB delete failed, using memory:', err.message);
      }
    }

    const hasActiveLoans = inMemoryLoans.some(l => l.bookId && l.bookId._id.toString() === id.toString() && !l.returnDate);
    if (hasActiveLoans) {
      throw new Error('Cannot delete book with active loans.');
    }

    inMemoryBooks = inMemoryBooks.filter(b => b._id.toString() !== id.toString());
    return true;
  },

  // Loans Operations
  async getAllLoans(isDbConnected, filterType = 'all', search = '') {
    let loans = [];
    if (isDbConnected) {
      try {
        let query = {};
        if (filterType === 'active') query.returnDate = null;
        if (filterType === 'returned') query.returnDate = { $ne: null };

        loans = await Loan.find(query).populate('bookId').sort({ createdAt: -1 }).lean();
      } catch (err) {
        console.warn('DB read loans failed, using memory:', err.message);
      }
    }

    if (!loans.length) {
      loans = [...inMemoryLoans];
      if (filterType === 'active') loans = loans.filter(l => !l.returnDate);
      if (filterType === 'returned') loans = loans.filter(l => l.returnDate);
    }

    if (search) {
      const s = search.toLowerCase();
      loans = loans.filter(l => {
        const memberMatch = l.memberName && l.memberName.toLowerCase().includes(s);
        const bookMatch = l.bookId && l.bookId.title && l.bookId.title.toLowerCase().includes(s);
        return memberMatch || bookMatch;
      });
    }

    return loans;
  },

  async createLoan(isDbConnected, bookId, memberName) {
    if (isDbConnected) {
      try {
        const book = await Book.findById(bookId);
        if (!book) throw new Error('Selected book does not exist');
        
        const available = book.availableCopies !== undefined ? book.availableCopies : book.totalCopies;
        if (available <= 0) throw new Error('Book is currently out of stock');

        const loan = new Loan({
          bookId: book._id,
          memberName,
          borrowDate: new Date(),
          returnDate: null
        });

        await loan.save();
        book.availableCopies = Math.max(0, available - 1);
        await book.save();
        return loan;
      } catch (err) {
        console.warn('DB createLoan failed, fallback to memory store:', err.message);
      }
    }

    const book = inMemoryBooks.find(b => b._id.toString() === bookId.toString());
    if (!book) throw new Error('Selected book does not exist');
    if (book.availableCopies <= 0) throw new Error('Book is currently out of stock');

    book.availableCopies -= 1;

    const newLoan = {
      _id: 'mem_loan_' + Date.now(),
      bookId: { _id: book._id, title: book.title, author: book.author },
      memberName,
      borrowDate: new Date(),
      returnDate: null,
      createdAt: new Date()
    };

    inMemoryLoans.unshift(newLoan);
    return newLoan;
  },

  async returnLoan(isDbConnected, loanId) {
    if (isDbConnected) {
      try {
        const loan = await Loan.findById(loanId);
        if (loan && !loan.returnDate) {
          loan.returnDate = new Date();
          await loan.save();

          const book = await Book.findById(loan.bookId);
          if (book) {
            book.availableCopies = Math.min(book.totalCopies, (book.availableCopies || 0) + 1);
            await book.save();
          }
          return loan;
        }
      } catch (err) {
        console.warn('DB returnLoan failed, fallback to memory:', err.message);
      }
    }

    const loan = inMemoryLoans.find(l => l._id.toString() === loanId.toString());
    if (loan && !loan.returnDate) {
      loan.returnDate = new Date();
      const book = inMemoryBooks.find(b => b._id.toString() === loan.bookId._id.toString());
      if (book) {
        book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
      }
      return loan;
    }
    return null;
  },

  async getDashboardStats(isDbConnected) {
    let totalBooks = 0;
    let activeLoans = 0;
    let overdueLoans = 0;

    if (isDbConnected) {
      try {
        totalBooks = await Book.countDocuments();
        activeLoans = await Loan.countDocuments({ returnDate: null });
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        overdueLoans = await Loan.countDocuments({ returnDate: null, borrowDate: { $lt: fourteenDaysAgo } });
        return { totalBooks, activeLoans, overdueLoans };
      } catch (err) {
        console.warn('DB getDashboardStats failed, fallback to memory:', err.message);
      }
    }

    totalBooks = inMemoryBooks.length;
    activeLoans = inMemoryLoans.filter(l => !l.returnDate).length;
    const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    overdueLoans = inMemoryLoans.filter(l => !l.returnDate && new Date(l.borrowDate).getTime() < fourteenDaysAgo).length;

    return { totalBooks, activeLoans, overdueLoans };
  }
};

module.exports = dataStore;
