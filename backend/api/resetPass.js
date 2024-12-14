const express = require('express');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const router = express.Router();

router.post('/', async (req, res) => {
    console.log("/resetPass");
    try {
        const email = req.body.email.toLowerCase();
        const user = await User.findOne({ email });
        if (user) {
            sendResetPassword(user);
            res.json('Check your email');
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
        console.log('Error fetching user:', error);
    }
});

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    }
});

const sendResetPassword = async (user) => {
    const token = jwt.sign({ userId: user._id }, 'secret-key', { expiresIn: '1h' });
    const code = crypto.randomBytes(32).toString('hex');
    user.resetCode = code;
    await user.save();
    const ResetUrl = `http://localhost:3000/reset-password-active/?token=${token}&code=${code}`;
    console.log(ResetUrl);

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
                            Password Reset
                        </div>
                        <div class="card-body">
                            <p>Dear ${user.username},</p>
                            <p>Please click the link below to change your password:</p>
                            
                            <div class="confirmation-line"></div>
                            
                            <p>
                                <a href="${ResetUrl}" class="btn-primary">Verify Email</a>
                            </p>
                            
                            <p>If you were not at the orgin of this request, please ignore this email.</p>
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
        subject: 'Pasword Reset',
        html: htmlContent,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${user.email}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

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
