const Notification = require('../models/Notification');
const User = require('../models/User');

exports.getSidebarNotifications = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : req.session.userId;

        const notifications = await Notification.find({ user_id: userId })
            .populate('sender_id', 'fullName profile_picture username')
            .sort({ created_at: -1 })
            .limit(10); // sidebar limit

        const unreadCount = await Notification.countDocuments({
            user_id: userId,
            read: false
        });

        res.json({
            success: true,
            notifications,
            unreadCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : req.session.userId;

        await Notification.updateMany(
            { user_id: userId, read: false },
            { read: true }
        );

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
};
