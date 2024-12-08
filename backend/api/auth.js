const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
require('dotenv').config();

// Create a transporter object using Zoho's SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST, // smtp.zoho.eu
    port: process.env.MAIL_PORT, // 465
    secure: true, // true for 465 port (SSL)
    auth: {
        user: process.env.MAIL_USER, // your Zoho email address
        pass: process.env.MAIL_PASS, // your Zoho app-specific password
    }
});

// Send verification email after registration
const sendVerificationEmail = async (user) => {
    const token = jwt.sign({ userId: user._id }, 'secret-key', { expiresIn: '1h' });

    const verificationUrl = `http://localhost:5000/api/auth/verify-email/${token}`;
    console.log(verificationUrl);

    const mailOptions = {
        from: process.env.MAIL_USER,  // Zoho email address
        to: user.email,
        subject: 'Email Verification',
        text: `Click the following link to verify your email: ${verificationUrl}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${user.email}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// Register endpoint
router.post('/register', async (req, res) => {
    console.log("/register");
    try {
        let { username, email, password, confirmPassword } = req.body;
        email = email.toLowerCase();
        const user = new User({ username, email, password });
        if (password !== confirmPassword) return res.status(400).send('Passwords do not match');
        await user.save();
        await sendVerificationEmail(user); // Send email after user is saved
        res.status(201).send('User registered successfully!');
    } catch (error) {
        res.status(400).json({ error: error.message });
        
    }
});

// Email verification endpoint
router.get('/verify-email/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, 'secret-key');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Mark email as verified
        user.isEmailVerified = true;
        await user.save();

        res.status(200).json({ message: 'Email successfully verified. You can now log in.' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token' });
    }
});


// Login
router.post('/login', async (req, res) => {
    console.log("/login");
    try {
        let { email, password } = req.body;
        email = email.toLowerCase();
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) return res.status(401).send('Invalid email or password');
        if (!user.isEmailVerified) return res.status(401).send('Email not verified');

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true, // Prevents client-side JS from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict', // Helps prevent CSRF attacks
            maxAge: 3600000, // 1 hour
        });
        res.json('Login successful!');
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//logout
router.post('/logout', (req, res) => {
    console.log("/logout");
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//fetch user
router.get('/user', verifyJWT, async (req, res) => {
    console.log("/user");
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Route to check if the user is authenticated
router.get('/isAuthenticated', verifyJWT, (req, res) => {
    console.log("/isAuthenticated");
    try {
        res.json({
            isAuthenticated: true,
        });
    } catch (error) {
        res.json({
            isAuthenticated: false,
        });
    }
});

module.exports = router;