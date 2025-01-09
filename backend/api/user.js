const express = require('express');
const User = require('../models/User');
const Comment = require('../models/comment');
const Article = require('../models/article');
const Rates = require('../models/rates');
const verifyJWT = require('../middleware/verifyJWT');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
    process.exit(1);
}

const router = express.Router();

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
    dnsTimeout: 10000,
});

router.get('/', verifyJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

router.post('/change-email', verifyJWT, async (req, res) => {
    try {
        const mail = req.body.email.toLowerCase();
        if (!mail) return res.status(400).json({ error: 'Email is required' });
        if (mail === req.user.email) return res.status(400).json({ error: 'Email is the same' });

        const existingUser = await User.findOne({ email: mail });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.email = mail;
        await user.save();

        sendVerificationEmail(user);

        res.json({ message: 'Email updated. Verification email sent.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to change email' });
    }
});

router.get('/verify-email/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const { userId, email } = jwt.verify(token, process.env.JWT_SECRET);
        if (!userId || !email) return res.status(400).json({ message: 'Invalid token' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.email === email) return res.status(400).json({ message: 'Email already verified' });

        user.email = email;
        await user.save();

        res.status(200).json({ message: 'Email successfully verified.' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token' });
    }
});

const sendVerificationEmail = async (user) => {
    const token = jwt.sign({ userId: user._id }, 'secret-key', { expiresIn: '1h' });

    const verificationUrl = `https://app-sec-app-server-18blk3li4-briacs-projects-8dadbe9b.vercel.app/verification/${token}`;

    const htmlContent = `
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .btn-primary { background-color: #00628e; border: 1px solid #00628e; padding: 12px 30px; color: white; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block; }
                    .btn-primary:hover { background-color: #0056b3; border-color: #0056b3; color: white; }
                    .card { border-radius: 10px; border: 1px solid #ddd; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
                    .card-header { background-color: #f8f9fa; padding: 15px; text-align: center; font-weight: bold; border-top-left-radius: 10px; border-top-right-radius: 10px; }
                    .card-body { padding: 20px; }
                    .footer { font-size: 12px; text-align: center; padding: 20px; color: #777; }
                    .confirmation-line { margin: 20px 0; border-top: 2px solid #ddd; }
                </style>
            </head>
            <body style="background-color: #f4f4f4; padding: 30px;">
                <div class="container">
                    <div class="card">
                        <div class="card-header">Email Confirmation</div>
                        <div class="card-body">
                            <p>Dear ${user.username},</p>
                            <p>Please click the link below to verify your email address:</p>
                            <div class="confirmation-line"></div>
                            <p><a href="${verificationUrl}" class="btn-primary">Verify Email</a></p>
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

router.post('/change-password', verifyJWT, async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;
        if (!password || !confirmPassword) return res.status(400).json({ error: 'Password and confirm password are required' });
        if (password !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.password = password;
        await user.save();

        res.json({ message: 'Password successfully updated.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to change password' });
    }
});

router.post('/delete-account-req', verifyJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        sendDeleteAccountEmail(user);

        res.json({ message: 'Delete account email sent.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process delete account request.' });
    }
});

const sendDeleteAccountEmail = async (user) => {
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const deleteAccountUrl = `https://app-sec-app-server-18blk3li4-briacs-projects-8dadbe9b.vercel.app/verification-del/${token}`;

    const htmlContent = `
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .btn-primary { background-color: #e41515; border: 1px solid #e41515; padding: 12px 30px; color: white; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block; }
                    .btn-primary:hover { background-color: #e41515; border-color: white; color: white; }
                    .card { border-radius: 10px; border: 1px solid #ddd; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
                    .card-header { background-color: #f8f9fa; padding: 15px; text-align: center; font-weight: bold; border-top-left-radius: 10px; border-top-right-radius: 10px; }
                    .card-body { padding: 20px; }
                    .footer { font-size: 12px; text-align: center; padding: 20px; color: #777; }
                    .confirmation-line { margin: 20px 0; border-top: 2px solid #ddd; }
                </style>
            </head>
            <body style="background-color: #f4f4f4; padding: 30px;">
                <div class="container">
                    <div class="card">
                        <div class="card-header">Account Deletion</div>
                        <div class="card-body">
                            <p>Dear ${user.username},</p>
                            <p>We are sorry to hear you wish to leave us. Please click on the link below to delete your account:</p>
                            <div class="confirmation-line"></div>
                            <p><a href="${deleteAccountUrl}" class="btn-primary">Delete</a></p>
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
        subject: 'Account Deletion',
        html: htmlContent,
    };

    try {
        console.log('Sending deletion email to', user.email);
        await transporter.sendMail(mailOptions);
        console.log(`Deletion email sent to ${user.email}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

router.delete('/del/:id', verifyJWT, async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    const role = user.role;
    try {
        const userToDelete = await User.findById(id);
        if (!userToDelete) return res.status(404).json({ message: 'User not found' });
        if (!(role === 'admin' || (role === 'moderator' && (userToDelete.role === 'author' || userToDelete.role === 'user')))) return res.status(403).json({ message: 'You do not have permission to delete this user' });
        await userToDelete.deleteOne();
        if (Comment.find({ author: id })) {
            await Comment.updateMany({ author: id }, { $unset: { author: "" } });
        }
        if (Article.find({ author: id })) {
            const articles = await Article.find({ author: id });
            for (const article of articles) {
                await Comment.deleteMany({ article: article._id });
            }
            await Article.deleteMany({ author: id });
        }
        if (Rates.find({ author: id })) {
            const ratedArticles = await Rates.distinct('article', { author: id });
            await Rates.deleteMany({ author: id });
            for (const articleId of ratedArticles) {
                await updateArticleRate(articleId);
            }
        }
        res.status(200).json({ message: 'User successfully deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

router.get('/delete-account/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const { userId } = jwt.verify(token, process.env.JWT_SECRET);
        if (!userId) return res.status(400).json({ message: 'Invalid token' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.deleteOne();
        if (Comment.find({ author: userId })) {
            await Comment.updateMany({ author: userId }, { $unset: { author: "" } });
        }
        if (Article.find({ author: userId })) {
            const articles = await Article.find({ author: userId });
            for (const article of articles) {
                await Comment.deleteMany({ article: article._id });
            }
            await Article.deleteMany({ author: userId });
        }
        if (Rates.find({ author: userId })) {
            const ratedArticles = await Rates.distinct('article', { author: userId });
            await Rates.deleteMany({ author: userId });
            for (const articleId of ratedArticles) {
                await updateArticleRate(articleId);
            }
        }

        res.status(200).json({ message: 'Account successfully deleted.' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token' });
    }
});

const updateArticleRate = async (articleId) => {
    const article = await Article.findById(articleId);
    if (!article) return;
    const rates = await Rates.find({ article: articleId });
    if (!rates) return;
    let totalRate = 0;
    for (const rate of rates) {
        totalRate += rate.rate;
    }
    if (totalRate === 0) {
        article.rating = 0;
    } else {
        const avgRate = totalRate / rates.length;
        article.rating = Math.round(avgRate);
    }
    await article.save();
};

router.get('/comments', verifyJWT, async (req, res) => {
    try {
        const comments = await Comment.find({ author: req.user.id }).populate('article', 'title');
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

router.get('/all-users', verifyJWT, async (req, res) => {
    const user = await User.findById(req.user.id);
    const role = user.role;
    if (role !== 'admin' && role !== 'moderator') return res.status(403).json({ error: 'Unauthorized' });
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.get('/specific-user', verifyJWT, async (req, res) => {
    const { userId } = req.query;
    try {
        if (!userId) return res.status(400).json({ error: 'User ID is required' });
        const manager = await User.findById(req.user.id);
        if (!manager) return res.status(404).json({ error: 'Manager not found' });
        const user = await User.findById(userId).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (!(manager.role === 'admin' || (manager.role === 'moderator' && (user.role === 'user' || user.role === 'author')))) return res.status(403).json({ error: 'Unauthorized' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

router.post('/change-role', verifyJWT, async (req, res) => {
    const { userId, role } = req.body;
    if (!userId || !role) return res.status(400).json({ error: 'User ID and role are required' });
    try {
        const manager = await User.findById(req.user.id);
        if (!manager) return res.status(404).json({ error: 'Manager not found' });
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (!(manager.role === 'admin' || (manager.role === 'moderator' && (user.role === 'user' || user.role === 'author')))) return res.status(403).json({ error: 'Unauthorized' });
        user.role = role;
        await user.save();
        res.json({ message: 'User role updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

module.exports = router;
