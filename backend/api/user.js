const express = require('express');
const User = require('../models/user');
const verifyJWT = require('../middleware/verifyJWT');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const router = express.Router();

//fetch user
router.get('/', verifyJWT, async (req, res) => {
    console.log("/user");
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST, // smtp.zoho.eu
    port: process.env.MAIL_PORT, // 465
    secure: true, // true for 465 port (SSL)
    auth: {
        user: process.env.MAIL_USER, // your Zoho email address
        pass: process.env.MAIL_PASS, // your Zoho app-specific password
    }
});

router.post('/change-email', verifyJWT, async (req, res) => {
    console.log("/change-email");
    try {
        const mail = req.body.email.toLowerCase();
        if (!mail) return res.status(400).json({ error: 'Email is required' });
        if (mail === req.user.email) return res.status(400).json({ error: 'Email is the same' });
        const existingUser = await User.findOne({ email: mail });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        newUser = await User.findById(req.user.id);
        newUser.email = mail;
        sendVerificationEmail(newUser);

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to change email' });
    }
}
);

router.get('/verify-email/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const {userId, email} = jwt.verify(token, 'secret-key');
        console.log(userId, email);
        if (!userId) return res.status(400).json({ message: 'Invalid token' });        
        if (!email) return res.status(400).json({ message: 'Invalid token' });
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.email == email) return res.status(400).json({ message: 'Email already in' });
        user.email = email;
        await user.save();
        res.status(200).json({ message: 'Email successfully verified. You can now log in.' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token' });
    }
});

const sendVerificationEmail = async (user) => {
    const token = jwt.sign({ userId: user._id, email:user.email }, 'secret-key', { expiresIn: '1h' });

    const verificationUrl = `http://localhost:5000/api/user/verify-email/${token}`;
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

router.post('/change-password', verifyJWT, async (req, res) => {
    console.log("/change-password");
    try {
        const { password, confirmPassword } = req.body;
        if (!password || !confirmPassword) return res.status(400).json({ error: 'Password and confirm password are required' });
        if (password !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.password = password;
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to change password' });
    }
});
module.exports = router;