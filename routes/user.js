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
        const farmer = await Farmer.find({_id:farmerId})
        res.status(200).json({farmer});
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
        res.status(200).json({buyer});
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
        res.status(200).json({company});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;