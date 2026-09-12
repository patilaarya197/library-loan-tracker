require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');
const Loan = require('./models/Loan');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/library-loan-tracker';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to database.');

    // Clear existing data
    console.log('Clearing Book and Loan collections...');
    await Book.deleteMany({});
    await Loan.deleteMany({});

    // Target Books Dataset
    const sampleBooksData = [
      { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Technology', totalCopies: 1, availableCopies: 0 },
      { title: 'Refactoring', author: 'Martin Fowler', category: 'Technology', totalCopies: 3, availableCopies: 2 },
      { title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction', totalCopies: 4, availableCopies: 4 },
      { title: '1984', author: 'George Orwell', category: 'Fiction', totalCopies: 5, availableCopies: 4 },
      { title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas', category: 'Technology', totalCopies: 3, availableCopies: 2 },
      { title: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Science', totalCopies: 4, availableCopies: 4 },
      { title: 'clean code', author: 'Robert C. Martin', category: 'Technology', totalCopies: 2, availableCopies: 1 },
      { title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History', totalCopies: 5, availableCopies: 5 }
    ];

    console.log('Inserting books...');
    const insertedBooks = await Book.insertMany(sampleBooksData);
    console.log(`Inserted ${insertedBooks.length} books.`);

    const findBook = (title) => insertedBooks.find(b => b.title.toLowerCase() === title.toLowerCase());

    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;

    // Exact loans specified by user
    const sampleLoansData = [
      // 1. Introduction to Algorithms -> Aarya Patil -> leave active (only 1 copy total — 0 available)
      {
        bookId: findBook('Introduction to Algorithms')._id,
        memberName: 'Aarya Patil',
        borrowDate: new Date(now.getTime() - 2 * dayMs),
        returnDate: null
      },
      // 2. Refactoring -> Ravi Sharma -> leave active
      {
        bookId: findBook('Refactoring')._id,
        memberName: 'Ravi Sharma',
        borrowDate: new Date(now.getTime() - 1 * dayMs),
        returnDate: null
      },
      // 3. To Kill a Mockingbird -> Meera Nair -> mark Returned right after
      {
        bookId: findBook('To Kill a Mockingbird')._id,
        memberName: 'Meera Nair',
        borrowDate: new Date(now.getTime() - 7 * dayMs),
        returnDate: new Date(now.getTime() - 1 * dayMs)
      },
      // 4. 1984 -> Karan Mehta -> leave active & overdue (> 14 days ago, e.g. 20 days ago)
      {
        bookId: findBook('1984')._id,
        memberName: 'Karan Mehta',
        borrowDate: new Date(now.getTime() - 20 * dayMs),
        returnDate: null
      },
      // 5. The Pragmatic Programmer -> Sofia Rossi -> leave active
      {
        bookId: findBook('The Pragmatic Programmer')._id,
        memberName: 'Sofia Rossi',
        borrowDate: new Date(now.getTime() - 3 * dayMs),
        returnDate: null
      },
      // 6. A Brief History of Time -> Divya Kulkarni -> mark Returned right after
      {
        bookId: findBook('A Brief History of Time')._id,
        memberName: 'Divya Kulkarni',
        borrowDate: new Date(now.getTime() - 5 * dayMs),
        returnDate: new Date(now.getTime() - 2 * dayMs)
      },
      // 7. clean code (lowercase entry) -> Arjun Verma -> leave active
      {
        bookId: findBook('clean code')._id,
        memberName: 'Arjun Verma',
        borrowDate: new Date(now.getTime() - 4 * dayMs),
        returnDate: null
      }
    ];

    console.log('Inserting specified loan records...');
    const insertedLoans = await Loan.insertMany(sampleLoansData);
    console.log(`Inserted ${insertedLoans.length} loans.`);

    console.log('✅ Seed process completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

seedDatabase();
