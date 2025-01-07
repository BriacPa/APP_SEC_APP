const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            minlength: 3,
            maxlength: 120,
        },
        categories: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Categorie',
        }],
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
        rating: {
            type: Number, // Use Number type for float values
            min: 0,
            max: 5,
            default: 0,
        },
    },
    { timestamps: true } // Automatically create `createdAt` and `updatedAt`
);

module.exports = mongoose.model('Article', articleSchema);
