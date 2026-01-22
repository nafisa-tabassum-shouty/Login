const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Ensure user is authenticated middleware (simple check)
const isAuthenticated = (req, res, next) => {
    if (req.user || req.session.userId) {
        return next();
    }
    res.status(401).send('Please log in');
};

router.post('/posts', isAuthenticated, postController.createPost);
router.get('/posts', isAuthenticated, postController.getPosts);
router.post('/posts/:id/vote', isAuthenticated, postController.votePost);
router.post('/posts/:id/react', isAuthenticated, postController.toggleReaction);

module.exports = router;
