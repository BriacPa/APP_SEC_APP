const Categorie = require('../models/categorie');
const Article = require('../models/article');

const router = require('express').Router();

router.get('/', async (req, res) => {
    console.log("/categorie");
    try {
        const categories = await Categorie.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/del/:id', async (req, res) => {
    console.log("/categorie/del");
    if (!req.params.id) return res.status(400).send('ID is required');
    try {
        await Categorie.findByIdAndDelete(req.params.id);
        await Article.updateMany({ categories: req.params.id }, { $pull: { categories: req.params.id } });
        res.json({ message: 'Category successfully deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/add', async (req, res) => {
    console.log("/categorie/add");
    if (!req.body.name) return res.status(400).send('Name is required');
    try {
        await Categorie.create({ name: req.body.name });
        res.json({ message: 'Category successfully added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

