const Comment = require('../models/comment');
const User = require('../models/user');
const { Router } = require('express');
const router = Router();
const verifyJWT = require('../middleware/verifyJWT');

router.delete('/del/:id', verifyJWT, async (req, res) => {
    try {
        console.log('/comment/:id-(delete)');
        
        const { id } = req.params; // Extract comment ID from route parameter
        const userID = req.user.id; // User ID from verified JWT
        const user = await User.findById(userID); // Fetch user details
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        const role = user.role; // User role
        const comment = await Comment.findById(id); // Fetch comment by ID
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        // Check permissions
        console.log(comment.author, userID);
        if (role !== 'admin' && role !== 'moderator' && userID !== String(comment.author)) {
            return res.status(403).json({ message: 'You do not have permission to delete this comment' });
        }

        // Delete comment
        await comment.deleteOne();
        res.status(200).json({ message: 'Comment successfully deleted' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Failed to delete comment' });
    }
});


module.exports = router;