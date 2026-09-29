const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,          // no two users with the same email 🔒
    lowercase: true,       // Ravi@X.com → ravi@x.com
    trim: true,
  },
    password: {
    type: String,
    required: true,
    minLength: 6,
    select: false,        // 👈 never comes back in queries
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
