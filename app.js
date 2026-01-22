require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const viewRouter = require('./routes/viewRoutes');
const authRouter = require('./routes/authRoutes');


const session = require('express-session');
const passport = require('passport');

// Passport Config
require('./config/passport')(passport);

// Connect to Database
connectDB();

const app = express();

// Sessions
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'secret',
        resave: false,
        saveUninitialized: false
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    if (req.user || req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});
app.use('/', viewRouter);
app.use('/', authRouter);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
