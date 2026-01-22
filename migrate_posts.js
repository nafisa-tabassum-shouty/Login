const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = 'mongodb://localhost:27017/loginDB';

async function migrate() {
    try {
        await mongoose.connect(mongoURI);
        const db = mongoose.connection.db;
        const collection = db.collection('posts');
        const posts = await collection.find({}).toArray();

        console.log(`Found ${posts.length} posts. Starting migration...`);

        for (const post of posts) {
            const update = {};
            const unset = {};

            // Normalize user/user_id
            if (post.user && !post.user_id) {
                update.user_id = post.user;
                unset.user = "";
            }

            // Normalize fields
            if (post.contentText && !post.content_text) {
                update.content_text = post.contentText;
                unset.contentText = "";
            }
            if (post.contentImage && !post.content_image) {
                update.content_image = post.contentImage;
                unset.contentImage = "";
            }
            if (post.contentGif && !post.content_gif) {
                update.content_gif = post.contentGif;
                unset.contentGif = "";
            }
            if (post.contentCalendar && !post.content_calendar) {
                update.content_calendar = post.contentCalendar;
                unset.contentCalendar = "";
            }

            // Normalize timestamps
            if (post.createdAt && !post.created_at) {
                update.created_at = post.createdAt;
                unset.createdAt = "";
            }
            if (post.updatedAt && !post.updated_at) {
                update.updated_at = post.updatedAt;
                unset.updatedAt = "";
            }

            if (Object.keys(update).length > 0) {
                const result = await collection.updateOne(
                    { _id: post._id },
                    { $set: update, $unset: unset }
                );
                console.log(`Updated post ${post._id}: ${result.modifiedCount} modified.`);
            }
        }

        console.log('Migration complete.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

migrate();
