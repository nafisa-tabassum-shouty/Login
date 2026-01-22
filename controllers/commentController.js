const Comment = require('../models/Comment');
const Reaction = require('../models/Reaction');
const mongoose = require('mongoose');

// @desc    Add a comment or reply
// @route   POST /posts/:post_id/comments
// @access  Private
exports.createComment = async (req, res) => {
    try {
        const { post_id } = req.params;
        const { comment_text, parent_comment_id, reply_to_user_id } = req.body;
        const user_id = req.user ? req.user._id : req.session.userId;

        console.log('--- Create Comment Debug ---');
        console.log('Post ID:', post_id);
        console.log('User ID:', user_id);
        console.log('Text:', comment_text);

        if (!user_id) return res.status(401).send('Unauthorized');
        if (!comment_text || comment_text.trim() === '') {
            return res.status(400).send('Comment text is required');
        }

        const newComment = new Comment({
            post_id,
            user_id,
            comment_text,
            parent_comment_id: parent_comment_id || null,
            reply_to_user_id: reply_to_user_id || null
        });

        await newComment.save();
        console.log('Comment saved successfully to DB:', newComment._id);

        // Populate for immediate UI update
        const populatedComment = await Comment.findById(newComment._id)
            .populate('user_id', 'fullName profile_picture username')
            .populate('reply_to_user_id', 'username');

        res.status(201).json({
            success: true,
            comment: {
                ...populatedComment.toObject(),
                reactionCount: 0,
                reactionBreakdown: {},
                userReaction: null,
                replies: []
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Get comments for a post
// @route   GET /posts/:post_id/comments
// @access  Private
exports.getComments = async (req, res) => {
    try {
        const { post_id } = req.params;
        const user_id = req.user ? req.user._id : req.session.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        // Fetch top-level comments
        const comments = await Comment.find({ post_id, parent_comment_id: null })
            .populate('user_id', 'fullName profile_picture username')
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);

        const totalComments = await Comment.countDocuments({ post_id, parent_comment_id: null });

        // For each comment, fetch replies and reaction data
        const augmentedComments = await Promise.all(comments.map(async (comment) => {
            // Get replies
            const replies = await Comment.find({ parent_comment_id: comment._id })
                .populate('user_id', 'fullName profile_picture username')
                .populate('reply_to_user_id', 'username')
                .sort({ created_at: 1 });

            // Get reaction data for comment
            const commentData = await exports.getReactionData(comment._id, user_id);

            // Get reaction data for each reply
            const augmentedReplies = await Promise.all(replies.map(async (reply) => {
                const replyData = await exports.getReactionData(reply._id, user_id);
                return { ...reply.toObject(), ...replyData };
            }));

            return {
                ...comment.toObject(),
                ...commentData,
                replies: augmentedReplies
            };
        }));

        res.json({
            success: true,
            comments: augmentedComments,
            hasMore: totalComments > skip + limit
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Helper to get reaction counts and breakdown
exports.getReactionData = async (comment_id, user_id) => {
    const reactions = await Reaction.find({ comment_id });
    const reactionCount = reactions.length;
    const reactionBreakdown = reactions.reduce((acc, curr) => {
        acc[curr.reaction_type] = (acc[curr.reaction_type] || 0) + 1;
        return acc;
    }, {});
    const userReactionDoc = await Reaction.findOne({ comment_id, user_id });

    return {
        reactionCount,
        reactionBreakdown,
        userReaction: userReactionDoc ? userReactionDoc.reaction_type : null
    };
};

// @desc    Toggle reaction on a comment
// @route   POST /comments/:id/react
// @access  Private
exports.toggleReaction = async (req, res) => {
    try {
        const { id: comment_id } = req.params;
        const { reaction_type } = req.body;
        const user_id = req.user ? req.user._id : req.session.userId;

        if (!user_id) return res.status(401).send('Unauthorized');

        const existingReaction = await Reaction.findOne({ comment_id, user_id });

        if (existingReaction) {
            if (existingReaction.reaction_type === reaction_type) {
                await Reaction.deleteOne({ _id: existingReaction._id });
            } else {
                existingReaction.reaction_type = reaction_type;
                await existingReaction.save();
            }
        } else {
            const newReaction = new Reaction({
                comment_id,
                user_id,
                reaction_type
            });
            await newReaction.save();
        }

        const data = await exports.getReactionData(comment_id, user_id);
        res.json({ success: true, ...data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a comment
// @route   DELETE /comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user ? req.user._id : req.session.userId;

        const comment = await Comment.findById(id);
        if (!comment) return res.status(404).send('Comment not found');

        // Check ownership
        if (comment.user_id.toString() !== user_id.toString()) {
            return res.status(403).send('Not authorized to delete this comment');
        }

        // Also delete replies if it's a top-level comment
        if (!comment.parent_comment_id) {
            await Comment.deleteMany({ parent_comment_id: comment._id });
        }

        // Delete reactions associated with this comment (and potentially replies)
        await Reaction.deleteMany({ comment_id: id });

        await Comment.deleteOne({ _id: id });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
