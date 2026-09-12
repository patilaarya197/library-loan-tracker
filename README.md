# 📚 Library Loan Tracker

A modern, full-featured **Node.js & Express** web application with **EJS** view templating, **Bootstrap 5** CDN styling enhanced with custom dark glassmorphism CSS, and **MongoDB / Mongoose** data modeling.

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-blue.svg)](https://expressjs.com/)
[![EJS](https://img.shields.io/badge/EJS-3.1-orange.svg)](https://ejs.co/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple.svg)](https://getbootstrap.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-8.3-red.svg)](https://mongoosejs.com/)

---

## 🌟 Key Features

- 📊 **Dashboard Overview**: Metric cards showing **Total Books**, **Active Loans**, and **Overdue Loans** (>14 days old).
- 📚 **Book Inventory (CRUD)**: List books, search by title/author, filter by category, add new books, edit details, and delete entries safely.
- 📑 **Loan Management**: Issue book checkouts to members, track active vs. returned loans, and process book returns.
- 📈 **MongoDB Aggregation Analytics**: Three visual aggregation reporting tables:
  1. **Top 5 Most-Borrowed Books** (grouping, sorting, limiting, and `$lookup` joins).
  2. **Currently Overdue Loans** (`returnDate` null and `borrowDate` > 14 days ago).
  3. **Books Never Borrowed** (`$lookup` join with empty loan arrays).
- 🎨 **Modern Dark Glassmorphism UI**: High-contrast, responsive design featuring Bootstrap 5, Bootstrap Icons, Google Fonts (Outfit & Inter), and custom styling.
- ⚡ **Dual Data Layer (Online & Offline Support)**: Connects to MongoDB via Mongoose when online, with transparent fallback data management for instant preview support.

---

## 📁 Directory Structure

```text
library-loan-tracker/
├── .env                  # Environment configuration (PORT, MONGO_URI)
├── .gitignore            # Git ignore configuration
├── package.json          # Dependencies & npm scripts
├── server.js             # Express server entry point & Mongoose connection
├── seed.js               # Database seed script for books & loans
├── models/               # Mongoose Data Models
│   ├── Book.js           # Book Schema (title, author, category, totalCopies)
│   └── Loan.js           # Loan Schema (bookId, memberName, borrowDate, returnDate)
├── routes/               # Express Controllers
│   ├── index.js          # Dashboard route (/)
│   ├── books.js          # Book management (/books)
│   ├── loans.js          # Loan tracking (/loans)
│   └── analytics.js      # Aggregation reports (/analytics)
├── utils/                # Utilities & Data Layer
│   └── dataStore.js      # Data provider for Mongoose & offline preview fallback
├── views/                # EJS Templates & Partials
│   ├── partials/
│   │   ├── header.ejs    # Navbar layout & head assets
│   │   └── footer.ejs    # Shared footer & scripts
│   ├── dashboard.ejs     # Dashboard overview view
│   ├── analytics.ejs     # Analytics aggregation reports view
│   ├── books/
│   │   ├── index.ejs     # Book catalog & inline creation form
│   │   └── edit.ejs      # Edit book view
│   └── loans/
│       └── index.ejs     # Active loans log & return actions
└── public/               # Static Assets
    ├── css/
    │   └── style.css     # Custom dark mode glassmorphic styling
    └── js/
        └── main.js       # Client-side micro-interactions
```

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose ODM
- **View Engine**: EJS (Embedded JavaScript Templates)
- **Frontend / Styling**: Vanilla CSS, Bootstrap 5 CDN, Bootstrap Icons CDN, Google Fonts

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (Local `mongod` service or MongoDB Atlas URI)

### 2. Clone Repository
```bash
git clone https://github.com/patilaarya197/library-loan-tracker.git
cd library-loan-tracker
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Setup
Create a `.env` file in the project root (or update existing):
```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/library-loan-tracker
```

### 5. Seed Database (Optional)
To populate 15 sample books and 20 loan records (including active and overdue loans):
```bash
npm run seed
```

### 6. Run Application
```bash
# Start in production mode
npm start

# Or start in development mode with auto-reload
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

---

## 🛣️ API & Web Routes Summary

| Method | Route | Description |
| :--- | :--- | :--- |
| **GET** | `/` | Dashboard with Total Books, Active Loans, and Overdue Loans cards |
| **GET** | `/books` | List books catalog with search, category filter, and add form |
| **POST** | `/books` | Create a new book entry |
| **GET** | `/books/:id/edit` | Form to edit book details |
| **POST** | `/books/:id/edit` | Save updated book details |
| **GET** | `/books/:id/delete` | Delete a book record |
| **GET** | `/loans` | List active loans (`returnDate: null`) with checkout form |
| **POST** | `/loans` | Issue a new loan to a member |
| **POST** | `/loans/:id/return` | Mark a loan as returned (`returnDate: Date.now()`) |
| **GET** | `/analytics` | View the 3 MongoDB aggregation pipeline report tables |

---

## 🗄️ Database Schemas

### `Book` Schema
```js
{
  title: String,        // Required
  author: String,       // Required
  category: String,     // Fiction, Technology, Science, History, etc.
  totalCopies: Number,  // Total physical copies
  availableCopies: Number // Available copies for loan
}
```

### `Loan` Schema
```js
{
  bookId: { type: ObjectId, ref: 'Book' }, // Reference to Book
  memberName: String,                      // Borrower's full name
  borrowDate: { type: Date, default: Date.now },
  returnDate: { type: Date, default: null } // null if active, Date if returned
}
```

---

## 👤 Author

Developed by **[patilaarya197](https://github.com/patilaarya197)**.
