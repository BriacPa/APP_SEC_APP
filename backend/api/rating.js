const Rates = require('../models/rates');
const router = require('express').Router();
const verifyJWT = require('../middleware/verifyJWT');
const Article = require('../models/article');
const User = require('../models/user');

router.delete('/del/:id', verifyJWT, async (req, res) => {
    console.log('/rating/:id-(delete)');
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    const role = user.role;
    const userID = req.user.id;
    try {
        const rating = await Rates.findById(id);
        if (!rating) return res.status(404).json({ message: 'rating not found' });
        const articleId = rating.article;
        if (role !== 'admin' && role !== 'moderator' && userID !== String(rating.author)) {
            return res.status(403).json({ message: 'You do not have permission to delete this rating' });
        }
        await rating.deleteOne();
        updateArticleRate(articleId);
        res.status(200).json({ message: 'rating successfully deleted' });
    } catch (error) {
        console.error('Error deleting rating:', error);
        res.status(500).json({ message: 'Failed to delete rating' });
    }
});

router.get('/', verifyJWT, async (req, res) => {
    console.log('/rating');
    try {
        const ratings = await Rates.find({ author: req.user.id }).populate('article', 'title');
        res.json(ratings);
    } catch (error) {
        res.status(500).json({ error: error.message });
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

router.get('/RatingsAuthorQw', verifyJWT, async (req, res) => {
    console.log('/RatingsAuthorQw');
    try {
        const userId = req.query.id;
        const ratings = await Rates.find({ author: userId }).populate('article', 'title');
        res.json(ratings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;