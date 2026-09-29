// Makes an error that carries its own status code.
// Use it with next(): return next(fail(404, 'User not found'));

function fail(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = fail;
