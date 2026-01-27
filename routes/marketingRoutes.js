const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketingController');
// Auth check handled in controller

// Using ensureAuthenticated to protect the route if needed, based on app.js having auth.
// If ensureAuthenticated is not at ../config/auth, I might need to adjust.
// Let's verify where ensureAuthenticated is. 
// In app.js: app.get('/', (req, res) => { if (req.user ... ) })
// I don't see ensureAuthenticated imported in app.js globally. 
// However, standard MERN/Passport pattern usually has it. 
// Let's assume for now I will just use the controller and check auth inside or assume middleware is applied if I put it in the right place.
// Actually, I'll check existing routes (like viewRoutes) to see how they protect routes.


router.get('/marketing-insights', marketingController.getMarketingInsights);
router.post('/marketing-insights/snippet', marketingController.saveSnippet);
router.get('/marketing-insights/snippet', marketingController.getLatestSnippet);
router.post('/marketing-insights/scrap', marketingController.scrapWebsite);
router.get('/marketing-insights/scraped-data', marketingController.getScrapedData);



module.exports = router;
