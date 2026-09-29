// The guard: only requests with a valid token get through.

const jwt = require('jsonwebtoken');
const fail = require('../utils/fail');

function protect(req, res, next) {
  const header = req.headers.authorization;        // "Bearer eyJhbGci..."

  // 1. is a token attached?
  if (!header || !header.startsWith('Bearer ')) {
    return next(fail(401, 'No token, please log in'));
  }

  const token = header.split(' ')[1];              // the part after "Bearer "

  try {
    // 2. is it genuine and not expired?
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 3. remember who it is — every later route can read this
    req.user = { id: payload.id };

    next();                                        // let them through
  } catch (err) {
    return next(fail(401, 'Invalid or expired token'));
  }
}

module.exports = protect;
