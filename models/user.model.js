const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    required: true,
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    minlenth: [3, 'Usernname must be 3 characters long']
  },
  email: {
    required: true,
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    minlenth: [13, 'Email must be 13 characters long']
  },
  password: {
    required: true,
    type: String,
    trim: true,
    lowercase: true,
    minlenth: [5, 'Password must be 5 characters long']
  }
})

const userModel = mongoose.model('user', userSchema)

module.exports = userModel;
