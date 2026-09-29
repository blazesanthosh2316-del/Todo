const bcrypt = require('bcrypt');
const User = require('../models/User');
const fail = require('../utils/fail');
const jwt = require('jsonwebtoken')

// POST /auth/signup
async function signup(req, res, next) {
  const { name, email, password } = req.body;

  // 1. all 3 fields required
  if (!name || !email || !password) {
    return next(fail(400, 'Name, email and password are required'));
  }

  // 2. is the email already used?
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return next(fail(409, 'Email already registered'));
  }

  // 3. hash the password 🔒
  const hashed = await bcrypt.hash(password, 10);

  // 4. save the user
  const user = await User.create({ name, email, password: hashed });

  // 5. reply WITHOUT the password
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
  });
}

async function login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(fail(400, 'Email and password are required'));
  }

  // 1. find the user — password is select:false, so ask for it 🔓
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    return next(fail(401, 'Invalid email or password'));
  }

  // 2. compare the typed password with the stored hash
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(fail(401, 'Invalid email or password'));
  }

  // 3. make the ticket 🎟️
  const token = jwt.sign(
    { id: user._id },                    // what goes inside
    process.env.JWT_SECRET,              // your secret 🔐
    { expiresIn: '7d' }                  // valid for 7 days
  );

  // 4. send it back
  res.json({
    token,
    user: { _id: user._id, name: user.name, email: user.email },
  });
}

// GET /auth/me — who am I?
async function me(req, res, next) {
  const user = await User.findById(req.user.id);      // 👈 from the token!

  if (!user) {
    return next(fail(404, 'User not found'));
  }

  res.json(user);
}

module.exports = { signup, login, me };
