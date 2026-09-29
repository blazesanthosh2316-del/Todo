const express = require('express');
const protect = require('../middleware/protect');

const {
  getTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
} = require('../controllers/todosController');

const router = express.Router();
router.get('/', protect, getTodos);
router.get('/:id', protect, getTodo);
router.post('/', protect, createTodo);
router.put('/:id', protect, updateTodo);
router.delete('/:id', protect, deleteTodo);

module.exports = router