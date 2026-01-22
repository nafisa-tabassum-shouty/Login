const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [function () {
            return !this.googleId;
        }, 'Please add a password'],
        minlength: 6,
        select: false
    },
    username: {
        type: String,
        unique: true,
        sparse: true // Allows null/undefined while maintaining uniqueness for values
    },
    profilePicture: {
        type: String,
        default: 'default-profile.png'
    },
    coverPhoto: {
        type: String,
        default: 'default-cover.png'
    },
    bio: {
        type: String,
        maxlength: [160, 'Bio cannot be more than 160 characters']
    },
    googleId: {
        type: String
    },
    resetPasswordOTP: String,
    resetPasswordOTPExpire: Date
}, {
    timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
