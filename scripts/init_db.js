const { Client } = require('pg');
require('dotenv').config();

const dbName = 'market_analysis';

async function setup() {
    console.log('🔄 Initializing Database Setup...');

    // 1. Create Database if strictly necessary
    // We connect to 'postgres' (default system DB) to perform administrative tasks like creating a new DB.
    const client = new Client({
        user: process.env.PG_USER,
        host: process.env.PG_HOST,
        database: 'postgres',
        password: process.env.PG_PASSWORD,
        port: process.env.PG_PORT,
    });

    try {
        await client.connect();

        // Check if DB exists
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname='${dbName}'`);
        if (res.rowCount === 0) {
            console.log(`✨ Database '${dbName}' does not exist. Creating...`);
            // Standard Postgres doesn't allow parameterized queries for identifiers like DB names in CREATE DATABASE
            // But we trust dbName as it's hardcoded to 'market_analysis' above.
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`✅ Database '${dbName}' created.`);
        } else {
            console.log(`ℹ️  Database '${dbName}' already exists.`);
        }
        await client.end();

    } catch (err) {
        console.error('⚠️  Warning during DB creation check (might already exist or permission error):', err.message);
        try { await client.end(); } catch (e) { }
    }

    // 2. Connect to the target database and create tables
    const pool = new Client({
        user: process.env.PG_USER,
        host: process.env.PG_HOST,
        database: dbName,
        password: process.env.PG_PASSWORD,
        port: process.env.PG_PORT,
    });

    const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS marketing_campaigns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        start_date DATE,
        end_date DATE,
        budget DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'planned',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS campaign_metrics (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER REFERENCES marketing_campaigns(id),
        metric_date DATE DEFAULT CURRENT_DATE,
        impressions INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        conversions INTEGER DEFAULT 0,
        spend DECIMAL(10, 2) DEFAULT 0.00
    );

    -- Insert sample data if empty
    INSERT INTO marketing_campaigns (name, start_date, end_date, budget, status)
    SELECT 'Spring Sale 2026', '2026-03-01', '2026-03-31', 5000.00, 'active'
    WHERE NOT EXISTS (SELECT 1 FROM marketing_campaigns WHERE name = 'Spring Sale 2026');
    `;

    try {
        console.log(`🔌 Connecting to '${dbName}' database to setup schema...`);
        await pool.connect();
        await pool.query('SELECT NOW()');
        console.log('✅ Connected to target database.');

        console.log('🛠 Creating/Verifying tables...');
        await pool.query(createTablesQuery);
        console.log('✅ Tables ready.');

        await pool.end();
        console.log('🎉 Setup Complete.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error initializing schema:', err);
        process.exit(1);
    }
}

setup();
