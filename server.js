require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const logger = require('./middleware/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const todosRoutes = require('./routes/todos');


const app = express();
app.use(cors()); 
app.use(helmet());                       // safe headers 🪖

// general limit: 100 requests per 15 min per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' },
}));

// stricter limit just for login: 5 tries per 15 min 🚦
app.use('/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, try again in 15 minutes' },
}));

app.use(express.json());
app.use(morgan('dev'));          // method, status, time

app.use('/auth', authRoutes);
app.use('/todos', todosRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
  } catch (err) {
    console.log('❌ Database connection failed:', err.message);
    process.exit(1);
  }
}

start();
