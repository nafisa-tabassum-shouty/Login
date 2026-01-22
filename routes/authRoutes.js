const express = require('express');
const { register, login, forgotPassword, verifyOTP, resetPassword, logout } = require('../controllers/authController');
const router = express.Router();
const passport = require('passport');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.get('/logout', logout);

// @desc    Auth with Google
// @route   GET /auth/google
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        console.log('Google Auth Success, redirecting to dashboard...');
        // Set session variables from passport user
        req.session.userId = req.user._id;
        req.session.userName = req.user.fullName;
        res.redirect('/dashboard');
    }
);

module.exports = router;
