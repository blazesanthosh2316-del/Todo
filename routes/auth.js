const express = require('express');
const protect = require('../middleware/protect');
const { signup,login,me } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login',login)
router.get('/me', protect, me);

module.exports = router;
