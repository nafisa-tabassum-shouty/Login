const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contentText: {
        type: String
    },
    contentImage: {
        type: String
    },
    contentGif: {
        type: String
    },
    contentVideo: {
        type: String
    },
    contentCalendar: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', PostSchema);
