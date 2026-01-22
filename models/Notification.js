const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'follow', 'mention'],
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
