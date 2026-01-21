require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const viewRouter = require('./routes/viewRoutes');
const authRouter = require('./routes/authRoutes');
const app = express();

// Connect to Database
connectDB();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => res.redirect('/login'));
app.use('/', viewRouter);
app.use('/', authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
