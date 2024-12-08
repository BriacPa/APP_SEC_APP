const mongoose = require('mongoose');

const ratesSchema = new mongoose.Schema(
    {
        rate: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        article: {
            type: mongoose.Schema.Types.ObjectId, // Reference to the Article model
            ref: 'Article',
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId, // Reference to the User model
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true } // Automatically create `createdAt` and `updatedAt`
);

ratesSchema.index({ article: 1, author: 1 }, { unique: true });

module.exports = mongoose.model('Rates', ratesSchema);
