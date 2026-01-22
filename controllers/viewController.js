const Post = require('../models/Post');

exports.getLoginForm = (req, res) => {
    res.render('login', { title: 'Login' });
};

exports.getForgotPasswordForm = (req, res) => {
    res.render('forgetpass', { title: 'Forgot Password' });
};

exports.getRegistrationForm = (req, res) => {
    res.render('registration', { title: 'Register' });
};

exports.getResetPasswordForm = (req, res) => {
    res.render('resetpass', { title: 'Reset Password' });
};

exports.getVerifyOTPForm = (req, res) => {
    res.render('verifyotp', { title: 'Verify OTP' });
};

exports.getPrivacyPolicy = (req, res) => {
    res.render('privacy', { title: 'Privacy Policy' });
};

exports.getTermsOfService = (req, res) => {
    res.render('terms', { title: 'Terms of Service' });
};

exports.getDashboard = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'fullName profilePicture')
            .sort({ createdAt: -1 });

        res.render('dashboard', {
            title: 'Dashboard',
            posts: posts || []
        });
    } catch (err) {
        console.error('Dashboard Error:', err);
        res.status(500).send('Server Error');
    }
};
