const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content_text: {
        type: String,
        trim: true
    },
    content_image: {
        type: String
    },
    content_gif: {
        type: String
    },
    content_video: {
        type: String
    },
    content_calendar: {
        type: Date
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Post', postSchema);
