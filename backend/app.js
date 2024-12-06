const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./api/auth');
const userRoutes = require('./api/user');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();

// Add cookie-parser middleware
app.use(cookieParser());

const corsOptions = {
    origin: 'http://localhost:3000', // Replace with your frontend's URL
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/app/user', userRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch(err => console.error('MongoDB connection error:', err));

module.exports = app;