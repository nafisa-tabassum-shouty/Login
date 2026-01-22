const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Prevent duplicate bookmarks
bookmarkSchema.index({ user_id: 1, post_id: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
