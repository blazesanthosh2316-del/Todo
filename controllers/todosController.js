const Todo = require('../models/Todo');
const fail = require('../utils/fail')


// GET /todos — only mine
async function getTodos(req, res, next) {
  const todos = await Todo.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(todos);
}

// POST /todos — mine from birth
async function createTodo(req, res, next) {
  const todo = await Todo.create({
    title: req.body.title,
    userId: req.user.id,              // 👈 the owner comes from the TOKEN
  });
  res.status(201).json(todo);
}

// GET /todos/:id
async function getTodo(req, res, next) {
  const todo = await Todo.findOne({ _id: req.params.id, userId: req.user.id });
  if (!todo) return next(fail(404, 'Todo not found'));
  res.json(todo);
}

// PUT /todos/:id
async function updateTodo(req, res, next) {
  const changes = {};
  if (req.body.title !== undefined) changes.title = req.body.title;
  if (req.body.done !== undefined) changes.done = req.body.done;

  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },     // 👈 must be MY todo
    changes,
    { new: true, runValidators: true }
  );

  if (!todo) return next(fail(404, 'Todo not found'));
  res.json(todo);
}

// DELETE /todos/:id
async function deleteTodo(req, res, next) {
  const todo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!todo) return next(fail(404, 'Todo not found'));
  res.json({ message: 'Todo deleted', deleted: todo });
}




module.exports= {getTodos,createTodo,getTodo,deleteTodo,updateTodo}