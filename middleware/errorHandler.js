// The last app.use in server.js. Four arguments = error handler.

function errorHandler(err, req, res, next) {
  console.error('💥', err.message);

  // bad id format → not found
  if (err.name === 'CastError') {
    return res.status(404).json({ error: 'Not found' });
  }

  // schema validation failed → bad request
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }
  const status = err.status || 500;
  const message = err.status ? err.message : 'Something went wrong';

  res.status(status).json({ error: message });
}

// Runs when no route matched.
function notFound(req, res) {
  res.status(404).json({ error: 'Route not found', path: req.url });
}

module.exports = { errorHandler, notFound };
