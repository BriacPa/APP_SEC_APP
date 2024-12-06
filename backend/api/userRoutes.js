const express = require('express');
const verifyJWT = require('../middleware/verifyJWT');
const express = require('express');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

//fetch user
router.get('/user', verifyJWT, async (req, res) => {
    console.log("/user");
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

module.exports = router;