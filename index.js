const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const { authenticated, users } = require('./router/auth_users.js');
const { general } = require('./router/general.js');

const app = express();

app.use(express.json());

// Configure express-session middleware for session management
app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Custom middleware for user authentication
app.use("/customer/auth/*", function auth(req, res, next) {
  const token = req.headers.authorization; // Extract token from request headers
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" }); // If token is not present, return 401 Unauthorized
  }
  try {
    const decoded = jwt.verify(token, "secret"); // Verify JWT token
    req.user = decoded.user; // Attach decoded user information to request object
    next(); // Call next middleware
  } catch (error) {
    res.status(403).json({ message: "Invalid token" }); // If token is invalid, return 403 Forbidden
  }
});


// Define routes for authentication and general book-related tasks
const PORT = 5000;
app.use("/customer", authenticated);
app.use("/", general);

// Start the server
app.listen(PORT, () => console.log("Server is running on port " + PORT));
