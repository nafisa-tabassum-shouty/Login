const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Ensure user is logged in (Simple middleware)
const protect = (req, res, next) => {
    if (req.user || req.session.userId) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Not authorized' });
    }
};

router.post('/', protect, postController.createPost);

module.exports = router;
