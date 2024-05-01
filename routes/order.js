// Import necessary modules
const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Farmer = require('../models/farmerModel');

// Route for getting orders by farmer ID
router.get('/farmer/:farmerId', async (req, res) => {
    try {
        const farmerId = req.params.farmerId;
        const orders = await Order.find({ 'products.farmerId': farmerId })
        res.status(200).json({ orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/singleOrder/:orderId', async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findOne({ _id: orderId });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Route for getting orders by buyer ID
router.get('/buyer/:buyerId', async (req, res) => {
    try {
        const buyerId = req.params.buyerId;
        const orders = await Order.find({ buyerId }).populate('products.productId').populate('transportationCompanyId');
        res.status(200).json({ orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for getting orders by transportation company ID
router.get('/transportation/:transportationId', async (req, res) => {
    try {
        const transportationId = req.params.transportationId;
        const orders = await Order.find({ transportationCompanyId: transportationId });
        res.status(200).json({ orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

// Route for creating a new order
router.post('/', async (req, res) => {
    try {
        // Extract data from the request body
        const { buyerId, products } = req.body;

        // Create an array to hold product details
        const productsWithDetails = [];

        // Calculate total price for each product
        let overallTotal = 0;

        for (const { productId, quantity } of products) {
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            // Calculate total price for the product
            const totalPrice = quantity * product.price;
            overallTotal += totalPrice;

            // Push product details to the array
            productsWithDetails.push({
                productId,
                quantity,
                totalPrice,
                farmerId: product.farmerId // Extracting farmerId from the product
            });

            // Update product quantities
            await Product.findByIdAndUpdate(productId, {
                $inc: { availableQuantity: -quantity }
            });
        }

        // Get the farmer ID from the first product (assuming all products belong to the same farmer)
        const farmerId = productsWithDetails[0].farmerId;

        // Create a new order with overall total and farmerId
        const order = new Order({
            buyerId,
            products: productsWithDetails,
            overallTotal,
            farmerId
        });

        // Save the order to the database
        await order.save();

        // Push orderId to the orders array of the respective farmer
        await Farmer.findByIdAndUpdate(farmerId, {
            $push: { orders: order._id }
        });

        // Send a success response
        res.status(201).json({ message: 'Order placed successfully', order });
    } catch (error) {
        // If there's an error, send an error response
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Route to update order status
router.put('/status/:orderId/:farmerId', async (req, res) => {
    const orderId = req.params.orderId;
    const farmerId = req.params.farmerId;
    const newStatus = req.body.status;

    try {
        // Find the order by ID
        const order = await Order.findById(orderId);

        // Check if the order exists
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if the order belongs to the logged-in farmer
        if (order.products.some(product => product.farmerId.toString() !== farmerId.toString())) {
            return res.status(403).json({ error: 'Unauthorized: This order does not belong to you' });
        }

        // Update the order status
        order.orderStatus = newStatus;
        await order.save();

        res.json({ message: 'Order status updated successfully', order });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Export the router
module.exports = router;
