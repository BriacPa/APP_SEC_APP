const express = require('express');
const User = require('../models/user');
const Article = require('../models/article');
const Comment = require('../models/comment');
const verifyJWT = require('../middleware/verifyJWT');
const mongoose = require('mongoose');

const router = express.Router();

router.post('/addArticle', verifyJWT, async (req, res) => {
    console.log("/addArticle");

    try {
        let { title, body, categories } = req.body;
        if (!title) return res.status(400).send('Title is required');
        if (!body) return res.status(400).send('Body is required');

        // Assuming you want to check the role of the user
        const allowedRoles = ['author', 'admin', 'moderator'];
        const response = await User.findById(req.user.id);
        const role = response.role;

        // Access user data from req.user
        if (!allowedRoles.includes(role)) {
            console.log('User role:', role);
            return res.status(403).send('You do not have permission to add an article');
        }

        if (!categories) categories = [];   
        
        // Create a new article using the user ID from req.user
        const article = new Article({ title, body, author: req.user.id, categories });
        await article.save();
        
        res.status(201).send('Article added successfully!');
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
});


router.get('/allArticles', async (req, res) => {
    console.log("/allArticles");
    try {
        const articles = await Article.find().populate('author', 'username');
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/article', async (req, res) => {
    console.log("/article");
    const { title } = req.query ;
    console.log(title);
    if (!title) return res.status(400).send('Title is required');
    try {
        const article = await Article.findOne({ title }).populate('author', 'username');
        if (!article) return res.status(404).send('Article not found');
        res.json(article);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/comment', verifyJWT, async (req, res) => {
    console.log("/comment");
    try {
        let { articleId, comment} = req.body;
        const authorId = req.user.id;
        console.log(articleId, comment, authorId);
        if (!articleId) return res.status(400).send('Article ID is required');
        if (!comment) return res.status(400).send('Comment is required');
        let newComment;
        if (!authorId) {
            newComment = new Comment({ article: articleId, body: comment });
        } else {
            newComment = new Comment({ article: articleId, body: comment, author: authorId });
        }
        await newComment.save();
        res.status(201).send('Comment added successfully!');
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/comments', async (req, res) => {
    console.log("/comments");
    const { articleId } = req.query;
    console.log(req.query, articleId);
    if (!articleId) {
        console.log("Article ID is required");
        return res.status(400).send('Article ID is required');
    }
    if (!mongoose.Types.ObjectId.isValid(articleId)) {
        console.log("Invalid article ID");
        return res.status(400).send('Invalid article ID');
    }
    try {
        const comments = await Comment.find({ article : articleId }).populate('author', 'username');
        if (comments.length === 0) return res.status(404).send('No comments found for this article');
        res.json(comments);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;