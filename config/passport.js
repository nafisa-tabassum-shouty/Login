const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function (passport) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL
            },
            async (accessToken, refreshToken, profile, done) => {
                const newUser = {
                    googleId: profile.id,
                    fullName: profile.displayName,
                    email: profile.emails[0].value
                };

                console.log('Google Profile:', profile);

                try {
                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        return done(null, user);
                    } else {
                        // Check if user exists with the same email
                        user = await User.findOne({ email: profile.emails[0].value });
                        if (user) {
                            user.googleId = profile.id;
                            await user.save();
                            return done(null, user);
                        } else {
                            user = await User.create(newUser);
                            return done(null, user);
                        }
                    }
                } catch (err) {
                    console.error('Passport Google Strategy Error:', err);
                    return done(err, null);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};
