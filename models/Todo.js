const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,       // must be there
    trim: true,           // removes spaces automatically
    maxLength: 200,
  },
  done: {
    type: Boolean,
    default: false,       // new todos start unfinished
  },
    userId: {                                    // 👈 ADD THIS BLOCK
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,       // adds createdAt and updatedAt for free 🕒
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;
