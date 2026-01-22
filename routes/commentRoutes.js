const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
    if (req.user || req.session.userId) {
        return next();
    }
    res.status(401).send('Please log in');
};

router.post('/posts/:post_id/comments', isAuthenticated, commentController.createComment);
router.get('/posts/:post_id/comments', isAuthenticated, commentController.getComments);
router.post('/comments/:id/react', isAuthenticated, commentController.toggleReaction);
router.delete('/comments/:id', isAuthenticated, commentController.deleteComment);

module.exports = router;
