const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool instance for PostgreSQL connection
// This is completely separate from the MongoDB connection in db.js
const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

// Test the connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Error acquiring client for PostgreSQL', err.stack);
    }
    console.log(`✅ PostgreSQL Connected Successfully to database: ${process.env.PG_DATABASE}`);
    release();
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool // Exporting pool directly in case needed
};
