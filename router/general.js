const express = require('express');
const books = require("./booksdb.js");
const axios = require('axios');

const public_users = express.Router();

function getBooks(){
  console.log(books);
  return books;
}

function getBooksByISBN(isbn){
  return books[parseInt(isbn)];
}

function getAuthor(author){
  return Object.values(books).filter(book => book.author === author);
}

function getTitle(title){
  return Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
}

public_users.get('/', async function (req, res) {
  try {
      // Fetch all books
      const response = await getBooks();
      res.send({"books":response});
  } catch (error) {
      console.error('Error fetching books:', error.message);
      res.status(500).json({ message: 'Failed to fetch books' });
  }
});


public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  const response = await getBooksByISBN(isbn);
  if (response) {
      res.send(books[isbn]);
  } else {
      res.status(404).json({ message: 'Book not found' });
  }
});


public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  const response = await getAuthor(author);
  if (response.length > 0) {
      res.send(response);
  } else {
      res.status(404).json({ message: 'No books found for the author' });
  }
});


// Task 4: Get book details based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  const response = await getTitle(title);
  if (response.length > 0) {
      res.send(response);
  } else {
      res.status(404).json({ message: 'No books found with the given title' });
  }
});

// Task 5: Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  try {
    const book = books[isbn];
    if (book) {
      const reviews = book.reviews;
      res.status(200).json(reviews);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add or modify a book review
public_users.post('/review/:isbn', (req, res) => {
  const { isbn }  = req.params;
  const { review } = req.body;
  const username = req.body.username; // Assuming the username is provided in the request body
  console.log(books[parseInt(isbn)]);
  // Check if the book exists
  if (!books[parseInt(isbn)]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or modify the review
  if (!books[parseInt(isbn)].reviews[username]) {
    // If the user hasn't reviewed this book before, add a new review
    books[parseInt(isbn)].reviews[username] = review;
    res.status(201).json({ message: "Review added successfully" });
  } else {
    // If the user has already reviewed this book, modify the existing review
    books[parseInt(isbn)].reviews[username] = review;
    res.status(200).json({ message: "Review modified successfully" });
  }
});

// Delete a book review
public_users.delete('/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const { username } = req.body; // Assuming the username is provided in the request body

  // Check if the book exists
  if (!books[parseInt(isbn)]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has a review for the book
  if (!books[parseInt(isbn)].reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
  }

  // Delete the review
  delete books[parseInt(isbn)].reviews[username];
  res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.general = public_users;

