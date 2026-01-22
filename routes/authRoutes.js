const express = require('express');
const { register, login, forgotPassword, verifyOTP, resetPassword } = require('../controllers/authController');
const router = express.Router();
const passport = require('passport');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

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
        res.redirect('/dashboard');
    }
);

module.exports = router;
