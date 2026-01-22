const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Post = require('./models/Post');
const Reaction = require('./models/Reaction');
const Comment = require('./models/Comment');
const Notification = require('./models/Notification');
const Follower = require('./models/Follower');
const Bookmark = require('./models/Bookmark');
const Message = require('./models/Message');

dotenv.config();

const verifyModels = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Create a dummy user
        const user = await User.create({
            fullName: 'Test User',
            email: `test_${Date.now()}@example.com`,
            password: 'password123',
            username: `testuser_${Date.now()}`
        });
        console.log('User created:', user._id);

        // 2. Create a post
        const post = await Post.create({
            user: user._id,
            contentText: 'This is a test post'
        });
        console.log('Post created:', post._id);

        // 3. Create a reaction
        const reaction = await Reaction.create({
            post: post._id,
            user: user._id,
            reactionType: 'love'
        });
        console.log('Reaction created:', reaction._id);

        // 4. Create a comment
        const comment = await Comment.create({
            post: post._id,
            user: user._id,
            commentText: 'This is a test comment'
        });
        console.log('Comment created:', comment._id);

        // 5. Create a notification
        const notification = await Notification.create({
            user: user._id,
            type: 'comment',
            contentId: comment._id,
            onModel: 'Comment'
        });
        console.log('Notification created:', notification._id);

        // 6. Create a follower relationship
        const follower = await Follower.create({
            user: user._id,
            followerUser: user._id // Following self for test
        });
        console.log('Follower created:', follower._id);

        // 7. Create a bookmark
        const bookmark = await Bookmark.create({
            user: user._id,
            post: post._id
        });
        console.log('Bookmark created:', bookmark._id);

        // 8. Create a message
        const message = await Message.create({
            sender: user._id,
            receiver: user._id,
            content: 'Hello self'
        });
        console.log('Message created:', message._id);

        console.log('All models verified successfully!');

        // Cleanup
        await User.findByIdAndDelete(user._id);
        await Post.findByIdAndDelete(post._id);
        await Reaction.findByIdAndDelete(reaction._id);
        await Comment.findByIdAndDelete(comment._id);
        await Notification.findByIdAndDelete(notification._id);
        await Follower.findByIdAndDelete(follower._id);
        await Bookmark.findByIdAndDelete(bookmark._id);
        await Message.findByIdAndDelete(message._id);
        console.log('Cleanup complete');

        process.exit(0);
    } catch (err) {
        console.error('Verification failed:', err);
        process.exit(1);
    }
};

verifyModels();
