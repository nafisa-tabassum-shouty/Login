const Post = require('../models/Post');

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
    try {
        const { contentText, contentImage, contentGif, contentVideo, contentCalendar } = req.body;

        // Simple validation
        // Simple validation: must have text, image, or gif
        if (!contentText && !contentImage && !contentGif) {
            return res.status(400).json({ success: false, message: 'Please add some content to your post' });
        }

        // Get user from session (assuming middleware sets req.user or we use req.session.userId)
        const userId = req.user ? req.user._id : req.session.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const post = await Post.create({
            user: userId,
            contentText,
            contentImage,
            contentGif,
            contentVideo,
            contentCalendar
        });

        res.status(201).json({
            success: true,
            data: post
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
