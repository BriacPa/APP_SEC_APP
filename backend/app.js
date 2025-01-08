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

// Define 'secure' for cookies based on the environment
// Use cookie-parser middleware to parse cookies (no secret)
app.use(cookieParser()); // No need for COOKIE_SECRET if not signing cookies

// CORS configuration
const corsOptions = {
    origin: 'https://app-sec-app-client.vercel.app', // Replace with your frontend's URL
    credentials: true, // Allow cookies and credentials to be sent with requests
};

// CORS middleware to handle requests and preflight
app.use(cors(corsOptions));

// Handle preflight (OPTIONS) requests
app.options('*', cors(corsOptions)); // CORS preflight requests

// Middleware to log incoming requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Body parser setup
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

// Global error handler
app.use((err, req, res, next) => {
    if (err) {
        console.error('Error:', err);
        res.status(500).send(err);
    } else {
        next();
    }
});

module.exports = app;
