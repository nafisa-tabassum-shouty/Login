const { Client } = require('pg');
require('dotenv').config();

const dbName = 'market_analysis';

async function setup() {
    const client = new Client({
        user: process.env.PG_USER,
        host: process.env.PG_HOST,
        database: dbName,
        password: process.env.PG_PASSWORD,
        port: process.env.PG_PORT,
    });

    try {
        console.log(`🔌 Connecting to '${dbName}' database...`);
        await client.connect();

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS text (
                text_id SERIAL PRIMARY KEY,
                content TEXT NOT NULL
            );
        `;

        await client.query(createTableQuery);
        console.log('✅ table "text" created/verified with columns: text_id, content.');

        await client.end();
    } catch (err) {
        console.error('❌ Error updating database:', err);
        try { await client.end(); } catch (e) { }
        process.exit(1);
    }
}

setup();
