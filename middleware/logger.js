// Prints every request, then passes it on.

function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}

module.exports = logger;
