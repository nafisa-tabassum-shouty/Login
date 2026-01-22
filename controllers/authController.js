const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).send('User already exists');
        }

        // Create user
        const user = await User.create({
            fullName,
            email,
            password
        });

        if (user) {
            req.session.userId = user._id;
            res.redirect('/dashboard');
        } else {
            res.status(400).send('Invalid user data');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Login user
// @route   POST /login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).send('Invalid credentials');
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).send('Invalid credentials');
        }

        // Login successful
        req.session.userId = user._id;
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Forgot Password
// @route   POST /forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Set OTP and Expiry (10 minutes)
        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        const message = `Your password reset code is: ${otp}. It will expire in 10 minutes.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset OTP',
                message
            });

            res.status(200).json({ success: true, data: 'Email sent', email: user.email });
        } catch (err) {
            console.error(err);
            user.resetPasswordOTP = undefined;
            user.resetPasswordOTPExpire = undefined;
            await user.save();

            res.status(500).send('Email could not be sent');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Verify OTP
// @route   POST /verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordOTPExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send('Invalid or expired OTP');
        }

        res.status(200).json({ success: true, data: 'OTP verified', email, otp });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Reset Password
// @route   POST /reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        const user = await User.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordOTPExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send('Invalid or expired OTP');
        }

        // Set new password
        user.password = password;
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, data: 'Password updated successfully' });
    } catch (err) {
        console.error('RESET PASSWORD ERROR:', err);
        res.status(500).send('Server Error: ' + err.message);
    }
};
