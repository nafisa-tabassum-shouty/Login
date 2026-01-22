

exports.getLoginForm = (req, res) => {
    if (req.user || req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render('login', { title: 'Login' });
};

exports.getForgotPasswordForm = (req, res) => {
    res.render('forgetpass', { title: 'Forgot Password' });
};

exports.getRegistrationForm = (req, res) => {
    if (req.user || req.session.userId) {
        return res.redirect('/dashboard');
    }
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


const User = require('../models/User');

exports.getDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user ? req.user._id : req.session.userId);
        if (!user) {
            return res.redirect('/login');
        }
        res.render('dashboard', { title: 'Dashboard', user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
