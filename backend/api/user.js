const express = require('express');
const User = require('../models/user');
const Comment = require('../models/comment');
const Article = require('../models/article');
const Rates = require('../models/rates');
const verifyJWT = require('../middleware/verifyJWT');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Ensure environment variables are loaded
require('dotenv').config();
if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
    process.exit(1);
}

const router = express.Router();

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// Fetch user details
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

// Change email and send verification email
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
    const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    const verificationUrl = `http://localhost:5000/api/user/verify-email/${token}`;
    console.log(verificationUrl);

    const mailOptions = {
        from: process.env.MAIL_USER,
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

// Change password
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

        res.json({ message: 'Password successfully updated.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Request account deletion
router.post('/delete-account-req', verifyJWT, async (req, res) => {
    console.log("/delete-account-req");
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
    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    const deleteAccountUrl = `http://localhost:5000/api/user/delete-account/${token}`;
    console.log(deleteAccountUrl);

    const mailOptions = {
        from: process.env.MAIL_USER,
        to: user.email,
        subject: 'Account Deletion',
        text: `Click the following link to delete your account: ${deleteAccountUrl}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Delete account email sent to ${user.email}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// Handle account deletion
router.get('/delete-account/:token', async (req, res) => {
    console.log("/delete-account");
    const { token } = req.params;

    try {
        const { userId } = jwt.verify(token, process.env.JWT_SECRET);
        if (!userId) return res.status(400).json({ message: 'Invalid token' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.deleteOne();
        if (Comment.find({author: userId})) {
            await Comment.updateMany({ author: userId }, { $unset: { author: "" } });
        }
        if (Article.find({author: userId})) {
            const articles = await Article.find({ author: userId });
            for (const article of articles) {
            await Comment.deleteMany({ article: article._id });
            }
            await Article.deleteMany({ author: userId });
        }
        if (Rates.find({author: userId})) {
            const ratedArticles = await Rates.distinct('article', { author: userId });
            await Rates.deleteMany({ author: userId });
            console.log(ratedArticles);
            for (const articleId of ratedArticles) {
                await updateArticleRate(articleId);
            }

        }

        res.status(200).json({ message: 'Account successfully deleted.' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token' });
        console.error('Error deleting account:', error);
    }
});

const updateArticleRate = async (articleId) => {
    console.log("...updateArticleRate");
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
        await article.save();
        console.log(`Article ${articleId} rate updated to 0`);
    }
    else{
        const avgRate = totalRate / rates.length;
        article.rating = avgRate;
        await article.save();
        console.log(`Article ${articleId} rate updated to ${avgRate}`);
    }

}

router.get('/comments', verifyJWT, async (req, res) => {
    console.log("/comments");
    try {
        const comments = await Comment.find({ author: req.user.id }).populate('article', 'title');
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

router.get('/all-users', verifyJWT, async (req, res) => {
    console.log("/all-users");
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
    console.log("/specific-user");
    const { userId } = req.query
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
}
);

router.post('/change-role', verifyJWT, async (req, res) => {
    console.log("/change-role");
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
}
);
    

module.exports = router;
