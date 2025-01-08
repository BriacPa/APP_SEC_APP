const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./api/auth');
const userRoutes = require('./api/user');
const articleRoutes = require('./api/article');
const resetPassRoutes = require('./api/resetPass');
const cookieParser = require('cookie-parser');
const commentRoutes = require('./api/comment');
const rateRoutes = require('./api/rating');
const categorie = require('./api/categorie');

dotenv.config();

const app = express();

// Add cookie-parser middleware
app.use(cookieParser());

const corsOptions = {
    origin: 'https://app-sec-app-client.vercel.app', // Replace with your frontend's URL
    secure,
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/resetPass', resetPassRoutes);
app.use('/api/article', articleRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/rating', rateRoutes);
app.use('/api/categorie', categorie);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch(err => console.error('MongoDB connection error:', err));

module.exports = app;