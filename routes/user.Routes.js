const express = require('express');
const { body, validationResult } = require('express-validator');
const userModel = require('../models/user.model.js');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const router = express.Router();

// Function to hash passwords using SHA-256
const hashPassword = (password, salt) => {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
};

// Register Page
router.get('/register', (req, res) => {
  res.render('register');
});

// Register Route
router.post(
  '/register',
  [
    body('email').trim().isEmail().withMessage('Invalid email format'),
    body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Invalid data'
      });
    }

    const { email, username, password } = req.body;
    try {
      const existingUser = await userModel.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ message: 'Email or Username already registered' });
      }

      // Generate a random salt
      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = hashPassword(password.trim(), salt);

      const newUser = await userModel.create({
        email,
        username,
        password: `${salt}:${hashedPassword}` // Store salt and hash together
      });

      res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Login Page
router.get('/login', (req, res) => {
  res.render('login');
});

// Login Route
router.post('/login',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username or Email must be at least 3 characters long'),
    body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Invalid data'
      });
    }

    const { username, password } = req.body;
    try {
      console.log("Login Attempt - Username:", username);

      const user = await userModel.findOne({
        $or: [{ username: username }, { email: username }]
      });

      console.log("User found:", user);

      if (!user) {
        return res.status(400).json({ message: 'Username or password is incorrect' });
      }

      // Extract salt and stored hash
      const [salt, storedHash] = user.password.split(':');
      const inputHash = hashPassword(password.trim(), salt);
      if (inputHash !== storedHash) {
        return res.status(400).json({ message: 'Username or password is incorrect' });
      }

      // Ensure JWT secret is set
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is missing in environment variables.");
        return res.status(500).json({ message: 'Server configuration error' });
      }

      // Generate JWT Token
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.cookie('token', token)
      res.send('Looged In')
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
