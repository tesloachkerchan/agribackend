const express = require('express');
const router = express.Router();
const TransportationCompany = require('../models/transportationModel');

// Route to get all transportation companies
router.get('/', async (req, res) => {
    try {
        // Fetch all transportation companies from the database
        const companies = await TransportationCompany.find();

        res.json(companies);
    } catch (error) {
        console.error('Error fetching transportation companies:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
