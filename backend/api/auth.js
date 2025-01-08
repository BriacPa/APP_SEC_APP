const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
require('dotenv').config();

// Define the secure flag based on the environment
const secure = process.env.NODE_ENV === 'production'; // Ensures secure cookies are used in production

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
    connectionTimeout: 10000,
});

// Send the verification email
const sendVerificationEmail = async (user) => {
    const token = jwt.sign({ userId: user._id }, 'secret-key', { expiresIn: '1h' });

    const verificationUrl = `https://app-sec-app-server-18blk3li4-briacs-projects-8dadbe9b.vercel.app/verification/${token}`;

    const htmlContent = `
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .btn-primary {
                        background-color: #00628e;
                        border: 1px solid #00628e;
                        padding: 12px 30px;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 16px;
                        display: inline-block;
                    }
                    .btn-primary:hover {
                        background-color: #0056b3;
                        border-color: #0056b3;
                        color: white;
                    }
                    .card {
                        border-radius: 10px;
                        border: 1px solid #ddd;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    .card-header {
                        background-color: #f8f9fa;
                        padding: 15px;
                        text-align: center;
                        font-weight: bold;
                        border-top-left-radius: 10px;
                        border-top-right-radius: 10px;
                    }
                    .card-body {
                        padding: 20px;
                    }
                    .footer {
                        font-size: 12px;
                        text-align: center;
                        padding: 20px;
                        color: #777;
                    }
                    .confirmation-line {
                        margin: 20px 0;
                        border-top: 2px solid #ddd;
                    }
                </style>
            </head>
            <body style="background-color: #f4f4f4; padding: 30px;">
                <div class="container">
                    <div class="card">
                        <div class="card-header">
                            Email Confirmation
                        </div>
                        <div class="card-body">
                            <p>Dear ${user.username},</p>
                            <p>Please click the link below to verify your email address:</p>
                            
                            <div class="confirmation-line"></div>
                            
                            <p>
                                <a href="${verificationUrl}" class="btn-primary">Verify Email</a>
                            </p>
                            
                            <p>If you were not at the origin of this request, please ignore this email.</p>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Best regards,<br/>Your App Team</p>
                    </div>
                </div>
            </body>
        </html>
    `;

    const mailOptions = {
        from: process.env.MAIL_USER,
        to: user.email,
        subject: 'Email Verification',
        html: htmlContent,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${user.email}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// Register a new user and send the verification email
router.post('/register', async (req, res) => {
    console.log("/register");
    try {
        let { username, email, password, confirmPassword } = req.body;
        email = email.toLowerCase();
        const user = new User({ username, email, password });
        if (password !== confirmPassword) return res.status(400).send('Passwords do not match');
        await user.save();
        await sendVerificationEmail(user);
        res.status(201).send('User registered successfully!');
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Verify email address using the token
router.get('/verify-email/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, 'secret-key');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isEmailVerified = true;
        await user.save();

        res.status(200).json({ message: 'Email successfully verified. You can now log in.' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token' });
    }
});

// Login and set a secure, HTTP-only cookie
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
            httpOnly: true,         // Prevent JavaScript access to the cookie
            secure,                 // Set the cookie as secure (only over HTTPS)
            sameSite: 'None',       // Allow cross-origin requests
            maxAge: 3600000,        // Cookie expires in 1 hour
            partitioned: true,      // Partition the cookie (reduces tracking)
        });

        res.json('Login successful!');
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Logout and clear the token cookie
router.post('/logout', (req, res) => {
    console.log("/logout");
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure,                // Clear the cookie securely (only over HTTPS)
            sameSite: 'None',      // Allow cross-origin requests
            partitioned: true,     // Partition the cookie for privacy
        });
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Fetch the authenticated user
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

// Check if the user is authenticated
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
