const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyJWT = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]; // You can check both cookies and authorization header
    
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        isEmailVerifiedV = User.findById(decoded.id);
        if (!isEmailVerifiedV) return res.status(403).json({ message: 'Email not verified' });
        req.user = decoded; // Attach user information to the request
        next(); // Proceed to the next middleware or route
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = verifyJWT;
