const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        description: 'The recipient of the notification'
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        description: 'The user who triggered the notification'
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'reply', 'follow', 'mention'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    content_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'on_model'
    },
    on_model: {
        type: String,
        required: true,
        enum: ['Post', 'Comment', 'User']
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Notification', notificationSchema);
