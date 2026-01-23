const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

const isAuthenticated = (req, res, next) => {
    if (req.user || req.session.userId) return next();
    return res.status(401).json({ success: false });
};

router.get('/notifications/sidebar', isAuthenticated, notificationController.getSidebarNotifications);
router.post('/notifications/mark-all-read', isAuthenticated, notificationController.markAllAsRead);

module.exports = router;
