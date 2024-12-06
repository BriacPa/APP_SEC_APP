const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * User schema definition for MongoDB using Mongoose.
 * 
 * This schema defines the structure of the User document with the following fields:
 * 
 * @property {String} username - The username of the user. It is required, unique, and must be between 3 and 20 characters long.
 * @property {String} email - The email address of the user. It is required, unique, and must match a basic email regex pattern.
 * @property {String} password - The password of the user. It is required, must be at least 6 characters long, and must match a regex pattern that enforces at least one digit, one lowercase letter, one uppercase letter, and a minimum length of 8 characters.
 * 
 * The schema also includes timestamps to automatically manage `createdAt` and `updatedAt` properties.
 */
const userSchema = new mongoose.Schema(
    {
        username: { 
            type: String, 
            required: true, 
            unique: true, 
            minlength: 3, 
            maxlength: 20 
        },
        email: { 
            type: String, 
            required: true, 
            unique: true, 
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Basic email regex
        },
        password: { 
            type: String, 
            required: true, 
            minlength: 6,
            match: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/ // Password regex
        },
        role: { 
            type: String, 
            default: 'user', 
            enum: [
                'user',
                'author', 
                'admin', 
        ] },
        
        isEmailVerified: { 
            type: Boolean, 
            default: false 
        }
    },
    { timestamps: true }
);



// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare hashed password
userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);