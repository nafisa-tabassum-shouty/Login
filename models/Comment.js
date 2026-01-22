const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    commentText: {
        type: String,
        required: [true, 'Please add some text content']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Comment', CommentSchema);
