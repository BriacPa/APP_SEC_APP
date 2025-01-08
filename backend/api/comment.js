const Comment = require('../models/comment');
const User = require('../models/User');
const { Router } = require('express');
const router = Router();
const verifyJWT = require('../middleware/verifyJWT');

router.delete('/del', verifyJWT, async (req, res) => {
    try {        
        const { id } = req.query;
        const userID = req.user.id;
        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const role = user.role;
        const comment = await Comment.findById(id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        if (role !== 'admin' && role !== 'moderator' && userID !== String(comment.author)) {
            return res.status(403).json({ message: 'You do not have permission to delete this comment' });
        }

        await comment.deleteOne();
        res.status(200).json({ message: 'Comment successfully deleted' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Failed to delete comment' });
    }
});

router.get('/CommentsAuthorQW', verifyJWT, async (req, res) => {
    try {
        const userId = req.query.id;
        const comments = await Comment.find({ author: userId }).populate('article', 'title');
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
