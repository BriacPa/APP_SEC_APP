const Categorie = require('../models/categorie');
const Article = require('../models/article');
const User = require('../models/user');
const VerifyJWT = require('../middleware/verifyJWT');

const router = require('express').Router();

router.get('/', async (req, res) => {
    try {
        const categories = await Categorie.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/del/:id', VerifyJWT, async (req, res) => {
    if (!req.params.id) return res.status(400).send('ID is required');
    const user = await User.findById(req.user.id);
    if (!['admin'].includes(user.role)) return res.status(403).send('You do not have permission to delete a category');
    try {
        await Categorie.findByIdAndDelete(req.params.id);
        await Article.updateMany({ categories: req.params.id }, { $pull: { categories: req.params.id } });
        res.json({ message: 'Category successfully deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/add', VerifyJWT, async (req, res) => {
    if (!req.body.name) return res.status(400).send('Name is required');
    const user = await User.findById(req.user.id);
    if (!['admin'].includes(user.role)) return res.status(403).send('You do not have permission to delete a category');
    try {
        await Categorie.create({ name: req.body.name });
        res.json({ message: 'Category successfully added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
