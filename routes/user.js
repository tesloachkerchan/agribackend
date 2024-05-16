const express = require('express');
const router = express.Router();
const Farmer = require('../models/farmerModel')
const Buyer =require('../models/buyerModel')
const Company = require('../models/transportationModel')
//get all farmer
router.get('/farmer', async (req, res) => {
    try {
        
        const farmers = await Farmer.find()
        res.status(200).json({farmers});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//get single farmer
router.get('/farmer/:farmerId', async (req, res) => {
    try {
        const farmerId = req.params.farmerId
        const farmer = await Farmer.find({ _id: farmerId })
        res.json(farmer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//get all buyer
router.get('/buyer', async (req, res) => {
    try {
        
        const buyers = await Buyer.find()
        res.status(200).json({buyers});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//get single buyer
router.get('/buyer/:buyerId', async (req, res) => {
    try {
        const buyerId = req.params.buyerId
        const buyer = await Buyer.find({_id:buyerId})
        res.status(200).json(buyer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//get all company
router.get('/company', async (req, res) => {
    try {
        
        const companys = await Company.find()
        res.status(200).json({companys});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//get single buyer
router.get('/company/:companyId', async (req, res) => {
    try {
        const companyId = req.params.companyId
        const company = await Company.find({_id:companyId})
        res.status(200).json(company);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Activate or deactivate farmer account
router.put('/farmer/:farmerId/status', async (req, res) => {
    try {
        const { farmerId } = req.params;
        const { status } = req.body;

        // Update the status of the farmer account
        await Farmer.findByIdAndUpdate(farmerId, { status }, { new: true });

        res.status(200).json({ message: 'Farmer account status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Activate or deactivate buyer account
router.put('/buyer/:buyerId/status', async (req, res) => {
    try {
        const { buyerId } = req.params;
        const { status } = req.body;

        // Update the status of the buyer account
        await Buyer.findByIdAndUpdate(buyerId, { status }, { new: true });

        res.status(200).json({ message: 'Buyer account status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Activate or deactivate company account
router.put('/company/:companyId/status', async (req, res) => {
    try {
        const { companyId } = req.params;
        const { status } = req.body;

        // Update the status of the company account
        await Company.findByIdAndUpdate(companyId, { status }, { new: true });

        res.status(200).json({ message: 'Company account status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;