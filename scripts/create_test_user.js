const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const createTestUser = async () => {
    await connectDB();

    const email = 'test_agent@example.com';
    const password = 'password123';

    try {
        // Check if exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('Test user already exists.');
            // Update password just in case
            user.password = password;
            await user.save();
            console.log('Test user password updated.');
        } else {
            user = await User.create({
                fullName: 'Test Agent',
                email,
                password,
                username: 'test_agent'
            });
            console.log('Test user created.');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createTestUser();
