const mongoose = require('mongoose');

const categorieSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
    },
);


module.exports = mongoose.model('Categorie', categorieSchema);
