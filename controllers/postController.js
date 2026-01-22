const Post = require('../models/Post');
const multer = require('multer');
const path = require('path');

// Set up storage for images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    }
}).single('content_image');

// @desc    Create a new post
// @route   POST /posts
// @access  Private
exports.createPost = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).send(err);
        }

        try {
            const { content_text, content_gif, poll_options, poll_duration, scheduled_at, is_scheduled } = req.body;
            const user_id = req.user ? req.user._id : req.session.userId;

            if (!user_id) {
                return res.status(401).send('Unauthorized');
            }

            const scheduled = is_scheduled === 'true';
            const scheduledAtDate = scheduled_at ? new Date(scheduled_at) : null;

            let poll = undefined;
            if (poll_options && Array.isArray(poll_options)) {
                const validOptions = poll_options.filter(opt => opt.trim() !== '');
                if (validOptions.length >= 2) {
                    const expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate() + parseInt(poll_duration || 1));
                    poll = {
                        options: validOptions.map(opt => ({ text: opt, votes: [] })),
                        expires_at: expiresAt
                    };
                }
            }

            const newPost = new Post({
                user_id,
                content_text,
                content_image: req.file ? req.file.filename : undefined,
                content_gif: content_gif || undefined,
                poll,
                is_scheduled: !!(scheduled && scheduledAtDate),
                scheduled_at: (scheduled && scheduledAtDate) ? scheduledAtDate : null
            });

            await newPost.save();
            res.redirect('/dashboard');
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });
};

// @desc    Get all posts for feed
// @route   GET /posts
// @access  Private
exports.getPosts = async (req, res) => {
    try {
        const user_id = req.user ? req.user._id : req.session.userId;
        const posts = await Post.find({
            user_id,
            $or: [
                { is_scheduled: { $ne: true } },
                { scheduled_at: { $lte: new Date() } }
            ]
        })
            .populate('user_id', 'fullName profile_picture username')
            .sort({ created_at: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
// @desc    Vote in a poll
// @route   POST /posts/:id/vote
// @access  Private
exports.votePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { optionId } = req.body;
        const user_id = req.user ? req.user._id : req.session.userId;

        if (!user_id) {
            return res.status(401).send('Unauthorized');
        }

        const post = await Post.findById(id);
        if (!post || !post.poll) {
            return res.status(404).send('Poll not found');
        }

        // Check if expired
        if (post.poll.expires_at && new Date(post.poll.expires_at) < new Date()) {
            return res.status(400).send('Poll has expired');
        }

        // Check if already voted
        const hasVoted = post.poll.options.some(opt =>
            opt.votes && opt.votes.some(v => v.toString() === user_id.toString())
        );

        if (hasVoted) {
            return res.status(400).send('Already voted');
        }

        // Find option and add vote
        const option = post.poll.options.id(optionId);
        if (!option) {
            return res.status(404).send('Option not found');
        }

        option.votes.push(user_id);
        await post.save();

        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
const Reaction = require('../models/Reaction');
const Notification = require('../models/Notification');
const User = require('../models/User'); // Required for fullName
const mongoose = require('mongoose');

// @desc    Toggle reaction (add/update/remove)
// @route   POST /posts/:id/react
// @access  Private
exports.toggleReaction = async (req, res) => {
    try {
        const { id: post_id } = req.params;
        const { reaction_type } = req.body;
        const user_id = req.user ? req.user._id : req.session.userId;

        if (!user_id) {
            return res.status(401).send('Unauthorized');
        }

        // Check if user already has a reaction for this post
        const existingReaction = await Reaction.findOne({ post_id, user_id });

        if (existingReaction) {
            if (existingReaction.reaction_type === reaction_type) {
                // If same reaction, remove it
                await Reaction.deleteOne({ _id: existingReaction._id });
            } else {
                // If different reaction, update it
                existingReaction.reaction_type = reaction_type;
                await existingReaction.save();
            }
        } else {
            // New reaction
            const newReaction = new Reaction({
                post_id,
                user_id,
                reaction_type
            });
            await newReaction.save();

            // Notification for Reaction on Post
            try {
                console.log('--- Post Reaction Notification Started ---');
                const post = await Post.findById(post_id);
                const sender = await User.findById(user_id);
                if (post) {
                    console.log('Post owner:', post.user_id.toString());
                    console.log('Current user:', user_id.toString());
                    if (post.user_id.toString() !== user_id.toString()) {
                        const notif = await Notification.create({
                            user_id: post.user_id,
                            sender_id: user_id,
                            type: 'like',
                            message: `${sender.fullName} reacted to your post`,
                            content_id: post_id,
                            on_model: 'Post'
                        });
                        console.log('Post Reaction Notification Created:', notif._id);
                    } else {
                        console.log('Self-reaction detected, skipping notification');
                    }
                } else {
                    console.log('Post not found for notification logic');
                }
            } catch (notifErr) {
                console.error('Post Reaction Notification Error Detail:', notifErr);
            }
        }

        // Get updated counts
        const reactions = await Reaction.find({ post_id });
        const reactionCount = reactions.length;
        const reactionBreakdown = reactions.reduce((acc, curr) => {
            acc[curr.reaction_type] = (acc[curr.reaction_type] || 0) + 1;
            return acc;
        }, {});

        res.json({
            success: true,
            reactionCount,
            reactionBreakdown,
            userReaction: (await Reaction.findOne({ post_id, user_id }))?.reaction_type || null
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
