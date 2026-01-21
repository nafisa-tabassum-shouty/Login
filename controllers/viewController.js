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
