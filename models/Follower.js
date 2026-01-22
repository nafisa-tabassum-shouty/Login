const mongoose = require('mongoose');

const followerSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    follower_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Prevent user from following themselves or duplicate follows
followerSchema.index({ user_id: 1, follower_user_id: 1 }, { unique: true });

module.exports = mongoose.model('Follower', followerSchema);
