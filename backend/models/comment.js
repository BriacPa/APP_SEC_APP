const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
    {
        body: {
            type: String,
            required: true,
            minlength: 1, // Ensure the content isn't too short
        },
        author: {
            type: mongoose.Schema.Types.ObjectId, // Reference to the User model
            ref: 'User',
        },
        article: {
            type: mongoose.Schema.Types.ObjectId, // Reference to the Article model
            ref: 'Article',
            required: true,
        },
     }, { timestamps: true } // Automatically create `createdAt` and `updatedAt`
);

module.exports = mongoose.model('Comment', articleSchema);
