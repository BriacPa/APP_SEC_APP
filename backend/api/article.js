const express = require('express');
const User = require('../models/user');
const Article = require('../models/article');
const Comment = require('../models/comment');
const Rates = require('../models/rates');
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
        console.log(title, body, categories);
        
        // Create a new article using the user ID from req.user
        const article = new Article({ title, categories, body, author: req.user.id });
        await article.save();
        console.log('Article added successfully:', article);
        
        res.status(201).send('Article added successfully!');
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
});


router.get('/allArticles', async (req, res) => {
    console.log("/allArticles");
    try {
        const articles = await Article.find().populate('author', 'username').populate('categories', 'name');
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/article', async (req, res) => {
    console.log("/article");
    const { title } = req.query;
    console.log(title);
    if (!title) return res.status(400).send('Title is required');
    
    try {
        // Populate both author and categories fields correctly
        const article = await Article.findOne({ title })
            .populate('author', 'username') // Populate the author with just the username
            .populate('categories', 'name'); // Populate categories with the name field
        
        if (!article) return res.status(404).send('Article not found');
        
        // Send back the populated article
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
        let newComment = new Comment({ article: articleId, body: comment, author: authorId });
        await newComment.save();
        res.status(201).send('Comment added successfully!');
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/commentNO', async (req, res) => {
    console.log("/commentNO");
    try {
        let { articleId, comment} = req.body;
        console.log(articleId, comment);
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
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/Rate', verifyJWT, async (req, res) => {
    console.log("/Rate");

    try {
        const { articleId, rate } = req.body; // Ensure the field is `rate`, not `rating`
        const authorId = req.user.id;

        if (!articleId) return res.status(400).send('Article ID is required');
        if (rate === undefined) return res.status(400).send('Rate is required'); // Check if rate exists
        if (rate < 1 || rate > 5) return res.status(400).send('Rate must be between 1 and 5'); // Validate range

        // Find the article to ensure it exists
        const currentArticle = await Article.findById(articleId);
        if (!currentArticle) return res.status(404).send('Article not found');

        // Create a new rate document
        if(await Rates.findOne({ article: articleId, author: authorId })) {
            const newRate = await Rates.findOne({ article: articleId, author: authorId });
            newRate.rate = rate;
            await newRate.save();
        }else{
            const newRate = new Rates({ article: articleId, rate, author: authorId });
            await newRate.save();
        }
        
        
        // Fetch all ratings for this article
        const currentRates = await Rates.find({ article: articleId });

        // Calculate the new average rating
        const totalRates = currentRates.reduce((acc, r) => acc + r.rate, 0);
        const averageRate = totalRates / currentRates.length;

        // Update the article's rating
        currentArticle.rating = Math.round(averageRate);
        await currentArticle.save();    

        res.status(201).send('Rate added successfully!');
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/del/:id', verifyJWT, async (req, res) => {
    console.log('/del/:id');

    try {
        const { id } = req.params; // Extract the article ID from route parameters
        const userID = req.user.id; // Get the user ID from the JWT token

        // Fetch the user to check their role
        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const role = user.role; // Extract the user's role

        // Fetch the article by ID
        const article = await Article.findById(id);
        if (!article) return res.status(404).json({ message: 'Article not found' });

        // Check if the user is authorized to delete the article
        if (article.author.toString() !== userID && role !== 'admin' && role !== 'moderator') {
            return res.status(403).json({ message: 'You do not have permission to delete this article' });
        }

        // Call the function to delete related comments and ratings
        await DeleteComsAndRates(id);

        // Delete the article
        await article.deleteOne();

        res.status(200).json({ message: 'Article successfully deleted' });
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ message: 'Failed to delete article' });
    }
});


const DeleteComsAndRates = async (articleId) => {
    try {
        await Comment.deleteMany({ article: articleId });
        await Rates.deleteMany({ article: articleId });

    }
    catch (error) {
        console.error('Error deleting comments and rates:', error);
    }
}

router.get('/ArticlesAuthor' , verifyJWT, async (req, res) => {
    console.log('/ArticlesAuthor');
    try {
        const articles = await Article.find({ author: req.user.id });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
);

router.get('/ArticlesAuthorQw' , async (req, res) => {
    console.log('/ArticlesAuthor(query)');
    console.log(req.query.id);
    if (!req.query.id) return res.status(400).send('ID is required');
    try {
        const articles = await Article.find({ author: req.query.id });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/allCategories', async (req, res) => {
    console.log('/allCategories');
    try {
        const categories = await Article.distinct('categories');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;