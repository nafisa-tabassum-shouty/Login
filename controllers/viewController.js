const multer = require('multer');
const path = require('path');

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

exports.getMessages = async (req, res) => {
    if (!req.user && !req.session.userId) {
        return res.redirect('/login');
    }
    try {
        const user = await User.findById(req.user ? req.user._id : req.session.userId);
        res.render('message', { title: 'Messages', user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Set up storage for profile pictures and cover photos
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const prefix = file.fieldname === 'cover_photo' ? 'cover-' : 'profile-';
        cb(null, prefix + Date.now() + path.extname(file.originalname));
    }
});

const uploadProfile = multer({
    storage: profileStorage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb('Error: Images only!');
    }
}).fields([
    { name: 'profile_picture', maxCount: 1 },
    { name: 'cover_photo', maxCount: 1 }
]);

exports.updateProfile = (req, res) => {
    const isMultipart = req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data');

    const handleUpdate = async () => {
        try {
            const userId = req.user ? req.user._id : req.session.userId;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            console.log('Processing update for user:', userId);
            console.log('Incoming body:', req.body);

            const { fullName, username, bio, workPosition, workCompany, education, currentCity, hometown } = req.body;
            const updateData = {};

            // Basic Info
            if (fullName) updateData.fullName = fullName;
            if (username) updateData.username = username;

            // Profile Details
            if (bio !== undefined) updateData.bio = bio;
            if (workPosition !== undefined) updateData.workPosition = workPosition;
            if (workCompany !== undefined) updateData.workCompany = workCompany;
            if (education !== undefined) updateData.education = education;
            if (currentCity !== undefined) updateData.currentCity = currentCity;
            if (hometown !== undefined) updateData.hometown = hometown;

            // Handle Files
            if (req.files) {
                if (req.files.profile_picture) updateData.profile_picture = req.files.profile_picture[0].filename;
                if (req.files.cover_photo) updateData.cover_photo = req.files.cover_photo[0].filename;
            }

            console.log('Final update data:', updateData);

            const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
                new: true,
                runValidators: false
            });

            if (!updatedUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Create automated posts for image updates
            if (req.files) {
                if (req.files.profile_picture) {
                    await Post.create({
                        user_id: userId,
                        content_text: 'Updated profile picture',
                        content_image: req.files.profile_picture[0].filename
                    });
                }
                if (req.files.cover_photo) {
                    await Post.create({
                        user_id: userId,
                        content_text: 'Updated cover photo',
                        content_image: req.files.cover_photo[0].filename
                    });
                }
            }

            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.json({ success: true, user: updatedUser });
            }

            res.redirect('/profile');
        } catch (err) {
            console.error('Update Profile Error:', err);
            res.status(500).json({ success: false, message: 'Server Error: ' + err.message });
        }
    };

    if (isMultipart) {
        uploadProfile(req, res, (err) => {
            if (err) {
                console.error('Multer error:', err);
                return res.status(400).json({ success: false, message: err.message || err });
            }
            handleUpdate();
        });
    } else {
        handleUpdate();
    }
};

exports.getSettings = async (req, res) => {
    if (!req.user && !req.session.userId) {
        return res.redirect('/login');
    }
    try {
        const user = await User.findById(req.user ? req.user._id : req.session.userId);
        res.render('settings', { title: 'Settings', user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
