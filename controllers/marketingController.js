const db = require('../config/postgresDb');
const User = require('../models/User'); // Mongoose Model
const fs = require('fs');
const path = require('path');

exports.getMarketingInsights = async (req, res) => {
    // 1. Authentication / Identity Check (Uses MongoDB)
    if (!req.user && !req.session.userId) {
        return res.redirect('/login');
    }

    try {
        const user = await User.findById(req.user ? req.user._id : req.session.userId);
        if (!user) return res.redirect('/login');

        // 2. Data Retrieval (Uses PostgreSQL)
        // Only executes if user is authenticated via MongoDB

        // Example query to verify connection
        const result = await db.query('SELECT NOW()');

        res.render('marketingInsights', {
            title: 'Marketing Insights',
            user: user, // Passed from MongoDB
            pgTime: result.rows[0].now, // Passed from PostgreSQL
            path: '/marketing-insights'
        });
    } catch (err) {
        console.error(err);
        // Fallback or error handling
        // We still need to render the page if possible, or error out
        // If we failed to find user (mongo error), we catch here too.
        // But if DB error (postgres), we might still want to show page with error.

        // Let's try to pass the user if we have it, otherwise null (which might break view if not careful)
        // But the try block has the user fetch at top.
        // Simpler error handling:
        res.render('marketingInsights', {
            title: 'Marketing Insights',
            user: req.user || null, // fallback
            error: 'Could not connect to Marketing Database (PostgreSQL).',
            pgTime: null,
            path: '/marketing-insights'
        });
    }
};

exports.saveSnippet = async (req, res) => {
    console.log('📝 saveSnippet called');
    if (!req.user && !req.session.userId) {
        console.log('❌ Unauthorized access attempt to saveSnippet');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { content } = req.body;
    console.log('📦 Content received:', content);

    if (!content) return res.status(400).json({ error: 'Content is required' });

    try {
        // Updated to use table 'text'
        const query = 'INSERT INTO text (content) VALUES ($1) RETURNING *';
        console.log('🚀 Executing Query:', query);

        const result = await db.query(query, [content]);
        console.log('✅ Query Result:', result.rows[0]);

        res.json({ success: true, snippet: result.rows[0] });
    } catch (err) {
        console.error('❌ Database error in saveSnippet:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

exports.getLatestSnippet = async (req, res) => {
    if (!req.user && !req.session.userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        // Updated to use table 'text' and order by 'text_id'
        const query = 'SELECT content, text_id FROM text ORDER BY text_id DESC LIMIT 1';
        const result = await db.query(query);

        if (result.rows.length > 0) {
            res.json({ success: true, snippet: result.rows[0] });
        } else {
            res.json({ success: false, message: 'No snippets found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};
const axios = require('axios');
const cheerio = require('cheerio');

exports.scrapWebsite = async (req, res) => {
    if (!req.user && !req.session.userId) return res.status(401).json({ error: 'Unauthorized' });

    const { source } = req.body;
    let url = '';

    // Map source keys to URLs
    switch (source) {
        case 'daraz': url = 'https://www.daraz.com.bd'; break;
        case 'bikroy': url = 'https://bikroy.com'; break;
        case 'rayans': url = 'https://www.ryanscomputers.com'; break;
        case 'pathao': url = 'https://pathao.com'; break;
        case 'shopno': url = 'https://www.shwapno.com'; break;
        default: return res.status(400).json({ error: 'Invalid source' });
    }

    try {
        console.log(`🕷 Scraping ${url}...`);

        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });

        const $ = cheerio.load(response.data);

        // Remove scripts, styles, and other non-content elements
        $('script').remove();
        $('style').remove();
        $('noscript').remove();
        $('iframe').remove();

        // Extract clean text
        const rawText = $('body').text().replace(/\s+/g, ' ').trim();

        // Simple Analysis: Top 5 words (longer than 3 chars)
        const words = rawText.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
        const freqMap = {};
        words.forEach(w => freqMap[w] = (freqMap[w] || 0) + 1);
        const topWords = Object.entries(freqMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

        const analysisSummary = {
            wordCount: words.length,
            topKeywords: topWords,
            title: $('title').text().trim()
        };

        // Store in PostgreSQL
        const insertQuery = `
            INSERT INTO scraped_data (source, url, scraped_content, analysis_summary)
            VALUES ($1, $2, $3, $4)
            RETURNING id, analysis_summary
        `;

        const result = await db.query(insertQuery, [source, url, rawText.substring(0, 50000), JSON.stringify(analysisSummary)]); // Limit content size just in case

        console.log(`✅ Scraped and stored data for ${source}`);
        res.json({ success: true, data: result.rows[0] });

    } catch (err) {
        console.error(`❌ Error scraping ${source}:`, err.message);
        res.status(500).json({ error: 'Failed to scrape website', details: err.message });
    }
};

exports.getScrapedData = async (req, res) => {
    if (!req.user && !req.session.userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const filePath = path.join(__dirname, '../../DarazScraper/daraz_data.json');

        if (!fs.existsSync(filePath)) {
            return res.json({ success: true, data: [] }); // Return empty if file doesn't exist yet
        }

        const rawData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(rawData);

        res.json({ success: true, data });
    } catch (err) {
        console.error('❌ Error reading scraped data:', err.message);
        res.status(500).json({ error: 'Failed to read scraped data' });
    }
};
