const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const Review = require('../models/reviewModel')

router.post('/:productId', async (req, res) => {
    const productId = req.params.productId;
    const newReview = new Review({ ...req.body });

    try {
        const savedReview = await newReview.save();

        // Update the tour by pushing the new review ID
        await Product.findByIdAndUpdate(productId, {
            $push: { reviews: savedReview._id }
        });

        res.status(200).json({
            success: true,
            message: 'Review submitted successfully',
            data: savedReview
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to submit review'
        });
    }
});

module.exports = router;
