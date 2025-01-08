const express = require('express');
const User = require('../models/User');
const Article = require('../models/article');
const Comment = require('../models/comment');
const Rates = require('../models/rates');
const verifyJWT = require('../middleware/verifyJWT');
const mongoose = require('mongoose');

const router = express.Router();

router.post('/addArticle', verifyJWT, async (req, res) => {
    try {
        let { title, body, categories } = req.body;
        if (!title) return res.status(400).send('Title is required');
        if (!body) return res.status(400).send('Body is required');

        const allowedRoles = ['author', 'admin', 'moderator'];
        const response = await User.findById(req.user.id);
        const role = response.role;

        if (!allowedRoles.includes(role)) {
            return res.status(403).send('You do not have permission to add an article');
        }

        if (!categories) categories = [];
        
        const article = new Article({ title, categories, body, author: req.user.id });
        await article.save();
        
        res.status(201).send('Article added successfully!');
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/allArticles', async (req, res) => {
    try {
        const articles = await Article.find().populate('author', 'username').populate('categories', 'name');
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/article', async (req, res) => {
    const { title } = req.query;
    if (!title) return res.status(400).send('Title is required');
    
    try {
        const article = await Article.findOne({ title })
            .populate('author', 'username')
            .populate('categories', 'name');
        
        if (!article) return res.status(404).send('Article not found');
        
        res.json(article);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/comment', verifyJWT, async (req, res) => {
    try {
        let { articleId, comment } = req.body;
        const authorId = req.user.id;
        if (!articleId) return res.status(400).send('Article ID is required');
        if (!comment) return res.status(400).send('Comment is required');
        let newComment = new Comment({ article: articleId, body: comment, author: authorId });
        await newComment.save();
        res.status(201).send('Comment added successfully!');
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/commentNO', async (req, res) => {
    try {
        let { articleId, comment } = req.body;
        if (!articleId) return res.status(400).send('Article ID is required');
        if (!comment) return res.status(400).send('Comment is required');
        let newComment = new Comment({ article: articleId, body: comment });
        await newComment.save();
        res.status(201).send('Comment added successfully!');
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/comments', async (req, res) => {
    const { articleId } = req.query;
    if (!articleId) return res.status(400).send('Article ID is required');
    if (!mongoose.Types.ObjectId.isValid(articleId)) return res.status(400).send('Invalid article ID');
    try {
        const comments = await Comment.find({ article: articleId }).populate('author', 'username');
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/Rate', verifyJWT, async (req, res) => {
    try {
        const { articleId, rate } = req.body;
        const authorId = req.user.id;

        if (!articleId) return res.status(400).send('Article ID is required');
        if (rate === undefined) return res.status(400).send('Rate is required');
        if (rate < 1 || rate > 5) return res.status(400).send('Rate must be between 1 and 5');

        const currentArticle = await Article.findById(articleId);
        if (!currentArticle) return res.status(404).send('Article not found');

        if (await Rates.findOne({ article: articleId, author: authorId })) {
            const newRate = await Rates.findOne({ article: articleId, author: authorId });
            newRate.rate = rate;
            await newRate.save();
        } else {
            const newRate = new Rates({ article: articleId, rate, author: authorId });
            await newRate.save();
        }
        
        const currentRates = await Rates.find({ article: articleId });
        const totalRates = currentRates.reduce((acc, r) => acc + r.rate, 0);
        const averageRate = totalRates / currentRates.length;

        currentArticle.rating = Math.round(averageRate);
        await currentArticle.save();    

        res.status(201).send('Rate added successfully!');
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/del/:id', verifyJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const userID = req.user.id;

        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const role = user.role;
        const article = await Article.findById(id);
        if (!article) return res.status(404).json({ message: 'Article not found' });

        if (article.author.toString() !== userID && role !== 'admin' && role !== 'moderator') {
            return res.status(403).json({ message: 'You do not have permission to delete this article' });
        }

        await DeleteComsAndRates(id);
        await article.deleteOne();

        res.status(200).json({ message: 'Article successfully deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete article' });
    }
});

const DeleteComsAndRates = async (articleId) => {
    try {
        await Comment.deleteMany({ article: articleId });
        await Rates.deleteMany({ article: articleId });
    } catch (error) {
        console.error('Error deleting comments and rates:', error);
    }
}

router.get('/ArticlesAuthor', verifyJWT, async (req, res) => {
    try {
        const articles = await Article.find({ author: req.user.id });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/ArticlesAuthorQw', async (req, res) => {
    if (!req.query.id) return res.status(400).send('ID is required');
    try {
        const articles = await Article.find({ author: req.query.id });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/allCategories', async (req, res) => {
    try {
        const categories = await Article.distinct('categories');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
