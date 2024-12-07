const express = require('express');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const router = express.Router();

//fetch user
router.post('/', async (req, res) => {
    console.log("/resetPass");
    try {
        const email = req.body.email.toLowerCase();
        const user = await User.findOne({ email });
        if (user) {
            sendVerificationEmail(user);
            res.json('Check your email');
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
        console.log('Error fetching user:', error);
    }
});

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
    const code = crypto.randomBytes(32).toString('hex');
    user.resetCode = code;
    await user.save();
    const ResetUrl = `http://localhost:3000/reset-password-active/?token=${token}&code=${code}`;
    console.log(ResetUrl);

    const mailOptions = {
        from: process.env.MAIL_USER,  // Zoho email address
        to: user.email,
        subject: 'Email Reset Password',
        text: `Click the following link to verify your email: ${ResetUrl}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${user.email}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// Email verification endpoint
router.post('/RP', async (req, res) => {
    console.log("/resetPass/RP");
    const {token, password, confirmPassword, code } = req.body;

    try {

        const decoded = jwt.verify(token, 'secret-key');
        const user = await User.findById(decoded.userId);

        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }
        if(user.resetCode !== code) {
            console.log('code not found');
            return res.status(400).send('Invalid code');
        }
        // Mark email as verified
        if (password !== confirmPassword) return res.status(400).send('Passwords do not match');
        user.password = password;
        user.resetCode = null;    
        await user.save();
        res.status(200).json({ message: 'Email successfully verified. You can now log in.' });
        console.log('Password reset successful');
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token' });
        console.error('Error verifying email:', error);
    }
});

module.exports = router;