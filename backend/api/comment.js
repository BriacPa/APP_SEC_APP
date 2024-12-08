const Comment = require('../models/comment');
const router = require('express').Router();

router.delete('/del/:id', async (req, res) => {
    console.log('/comment/:id-(delete)');
    const { id } = req.params;
    try {
        const comment = await Comment.findById(id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        await comment.deleteOne();
        res.status(200).json({ message: 'Comment successfully deleted' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Failed to delete comment' });
    }
});

module.exports = router;