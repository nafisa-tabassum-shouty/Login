

exports.getLoginForm = (req, res) => {
    if (req.user || req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render('login', { title: 'Login' });
};

exports.getForgotPasswordForm = (req, res) => {
    res.render('forgetpass', { title: 'Forgot Password' });
};

exports.getRegistrationForm = (req, res) => {
    if (req.user || req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render('registration', { title: 'Register' });
};

exports.getResetPasswordForm = (req, res) => {
    res.render('resetpass', { title: 'Reset Password' });
};

exports.getVerifyOTPForm = (req, res) => {
    res.render('verifyotp', { title: 'Verify OTP' });
};

exports.getPrivacyPolicy = (req, res) => {
    res.render('privacy', { title: 'Privacy Policy' });
};

exports.getTermsOfService = (req, res) => {
    res.render('terms', { title: 'Terms of Service' });
};


const User = require('../models/User');
const Post = require('../models/Post');


exports.getUserProfile = async (req, res) => {
    if (!req.user && !req.session.userId) {
        return res.redirect('/login');
    }
    try {
        const user = await User.findById(req.user ? req.user._id : req.session.userId);
        if (!user) return res.redirect('/login');
        const Reaction = require('../models/Reaction');
        const Comment = require('../models/Comment');
        // Fetch only this user's posts
        const postsRaw = await Post.find({ user_id: user._id, $or: [{ is_scheduled: { $ne: true } }, { scheduled_at: { $lte: new Date() } }] })
            .populate('user_id', 'fullName profile_picture username')
            .sort({ created_at: -1 });
        const posts = await Promise.all(postsRaw.map(async (post) => {
            const reactions = await Reaction.find({ post_id: post._id });
            const userReactionDoc = await Reaction.findOne({ post_id: post._id, user_id: user._id });
            const commentCount = await Comment.countDocuments({ post_id: post._id });
            const reactionBreakdown = reactions.reduce((acc, curr) => {
                acc[curr.reaction_type] = (acc[curr.reaction_type] || 0) + 1;
                return acc;
            }, {});
            return {
                ...post.toObject(),
                reactionCount: reactions.length,
                commentCount,
                reactionBreakdown,
                userReaction: userReactionDoc ? userReactionDoc.reaction_type : null
            };
        }));
        res.render('userprofile', { title: 'User Profile', user, posts });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user ? req.user._id : req.session.userId);
        if (!user) {
            return res.redirect('/login');
        }

        const Reaction = require('../models/Reaction');
        const Comment = require('../models/Comment');

        const postsRaw = await Post.find({
            $or: [
                { is_scheduled: { $ne: true } },
                { scheduled_at: { $lte: new Date() } }
            ]
        })
            .populate('user_id', 'fullName profile_picture username')
            .sort({ created_at: -1 });

        // Augment posts with reaction data
        const posts = await Promise.all(postsRaw.map(async (post) => {
            const reactions = await Reaction.find({ post_id: post._id });
            const userReactionDoc = await Reaction.findOne({ post_id: post._id, user_id: user._id });
            const commentCount = await Comment.countDocuments({ post_id: post._id });

            const reactionBreakdown = reactions.reduce((acc, curr) => {
                acc[curr.reaction_type] = (acc[curr.reaction_type] || 0) + 1;
                return acc;
            }, {});

            return {
                ...post.toObject(),
                reactionCount: reactions.length,
                commentCount,
                reactionBreakdown,
                userReaction: userReactionDoc ? userReactionDoc.reaction_type : null
            };
        }));

        const userPostCount = await Post.countDocuments({ user_id: user._id });

        res.render('dashboard', { title: 'Dashboard', user, posts, userPostCount });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getEditProfileForm = async (req, res) => {
    if (!req.user && !req.session.userId) {
        return res.redirect('/login');
    }
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user ? req.user._id : req.session.userId);
        if (!user) return res.redirect('/login');
        res.render('editprofile', { title: 'Edit Profile', user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getNotifications = async (req, res) => {
    if (!req.user && !req.session.userId) {
        return res.redirect('/login');
    }
    try {
        const Notification = require('../models/Notification');
        const user = await User.findById(req.user ? req.user._id : req.session.userId);
        const notifications = await Notification.find({ user_id: user._id })
            .populate('sender_id', 'fullName profile_picture username')
            .sort({ created_at: -1 });

        // Mark all as read when viewed? (Optional, but common)
        // await Notification.updateMany({ user_id: user._id, read: false }, { read: true });

        res.render('notifications', { title: 'Notifications', user, notifications });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
