const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            minlength: 3,
            maxlength: 50,
        },
        body: {
            type: String,
            required: true,
            minlength: 25, // Ensure the content isn't too short
        },
        author: {
            type: mongoose.Schema.Types.ObjectId, // Reference to the User model
            ref: 'User',
            required: true,
        },
        categories: {
            type: [String], // Array of categories for categorization
            default: [],
        },
        rating: {
            average: {
                type: Number,
                min: 0,
                max: 5,
                default: 0, // Default average rating
            },
            count: {
                type: Number,
                default: 0, // Number of ratings given
            },
        },
    },
    { timestamps: true } // Automatically create `createdAt` and `updatedAt`
);

module.exports = mongoose.model('Article', articleSchema);
