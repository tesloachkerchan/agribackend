// Import necessary modules
const express = require('express');
const mongoose = require('mongoose')
const router = express.Router();
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Farmer = require('../models/farmerModel');
const Buyer = require('../models/buyerModel')
const Company = require('../models/transportationModel')

// Route for getting orders by farmer ID
router.get('/farmer/:farmerId', async (req, res) => {
    try {
        const farmerId = req.params.farmerId;
        const orders = await Order.find({ 'products.farmerId': farmerId }).sort({ createdAt: -1 });
        res.status(200).json({orders});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Route for getting order counts by farmer ID
router.get('/farmer/:farmerId/order-counts', async (req, res) => {
    try {
        const farmerId = req.params.farmerId;

        // Aggregate pipeline to calculate counts
        const pipeline = [
            { 
                $match: {
                    'products.farmerId': new mongoose.Types.ObjectId(farmerId)
                }
            },
            { 
                $group: { 
                    _id: '$orderStatus', 
                    count: { $sum: 1 } 
                } 
            }
        ];

        const counts = await Order.aggregate(pipeline);

        let pendingCount = 0;
        let shippingCount = 0;
        let deliveredCount = 0;
        let processingCount = 0;

        // Extract counts from aggregation result
        counts.forEach(statusCount => {
            if (statusCount._id === 'pending') {
                pendingCount = statusCount.count;
            } else if (statusCount._id === 'shipping') {
                shippingCount = statusCount.count;
            } else if (statusCount._id === 'delivered') {
                deliveredCount = statusCount.count;
            } else if (statusCount._id === 'processing') {
                processingCount = statusCount.count;
            }
        });

        res.status(200).json({ pendingCount, shippingCount, deliveredCount, processingCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Route for getting total orders by farmer ID
router.get('/total/farmer/:farmerId', async (req, res) => {
    try {
        const farmerId = req.params.farmerId;
        const orders = await Order.find({ 'products.farmerId': farmerId })
        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Route for getting total money earned by a farmer
router.get('/earnings/farmer/:farmerId', async (req, res) => {
    try {
        const farmerId = req.params.farmerId;

        // Find all orders associated with the farmer ID
        const orders = await Order.find({ 'products.farmerId': farmerId });

        // Calculate total earnings
        let totalEarnings = 0;
        orders.forEach(order => {
            totalEarnings += order.overallTotal;
        });


        res.status(200).json(totalEarnings.toFixed(2));
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
        const orders = await Order.find({ buyerId }).populate('products.productId').populate('transportationCompanyId').sort({ createdAt: -1 });
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
        const orders = await Order.find({ transportationCompanyId: transportationId }).sort({ createdAt: -1 });
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
        //find buyer info
        const buyer = await Buyer.findById(buyerId)
        let farmer;

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
            //find farmer info
            farmer = await Farmer.findById(product.farmerId)


            //Push product details to the array
            productsWithDetails.push({
                productName:product.name,
                productId,
                ProductPrice:product.price,
                quantity,
                totalPrice,
                farmerId: product.farmerId ,// Extracting farmerId from the product
                farmerName: farmer.name,
            });
    

            // Update product quantities
            await Product.findByIdAndUpdate(productId, {
                $inc: { availableQuantity: -quantity }
            });
        }

        // Get the farmer ID from the first product (assuming all products belong to the same farmer)
        const farmerId = productsWithDetails[0].farmerId;
        const farmerName = productsWithDetails[0].farmerName;
        const farmerContact = farmer.contactDetails;

        // Create a new order with overall total and farmerId
        const order = new Order({
            buyerId,
            products: productsWithDetails,
            overallTotal,
            farmerId,
            buyerContactDetails: buyer.contactDetails,
            farmerName,
            farmerContactDetails:farmerContact
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
router.put('/status/:orderId/:farmerId/:companyId', async (req, res) => {
    const orderId = req.params.orderId;
    const farmerId = req.params.farmerId;
    const companyId = req.params.companyId;
    const newStatus = req.body.status;
    const estimatedDeliveryDate = req.body.shippingDate;

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

        // Update the order status, company ID, and estimated delivery date
        order.orderStatus = newStatus;
        order.transportationCompanyId = companyId;

        // Check if transportationDetails is initialized
        if (!order.transportationDetails) {
            order.transportationDetails = {};
        }

        // Update the estimatedDeliveryDate
        order.transportationDetails.estimatedDeliveryDate = estimatedDeliveryDate;

        await order.save();

        // Push the order ID to the transportation company's orders array
        const transportationCompany = await Company.findById(companyId);
        if (!transportationCompany) {
            return res.status(404).json({ error: 'Transportation company not found' });
        }
        transportationCompany.orders.push(orderId);
        await transportationCompany.save();

        res.json({ message: 'Order status updated successfully', order });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Route to update order status by transportation company
router.put('/status/transportation/:orderId', async (req, res) => {
    const orderId = req.params.orderId;
    const ShippingDate = req.body.shippingDate;
    const newStatus = 'shipping'; // Set the status to "shipping" for transportation company

    try {
        // Find the order by ID
        const order = await Order.findById(orderId);

        // Check if the order exists
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update the order status to "shipping"
        order.orderStatus = newStatus;
        // Check if transportationDetails is initialized
        if (!order.transportationDetails) {
            order.transportationDetails = {};
        }

        // Update the estimatedDeliveryDate
        order.transportationDetails.shippingDate = ShippingDate;

        // Save the order
        await order.save();

        res.json({ message: 'Order status updated to shipping successfully', order });
    } catch (error) {
        console.error('Error updating order status to shipping:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to update order status by farmer (to "delivered")
router.put('/delivery/:orderId/:farmerId', async (req, res) => {
    const orderId = req.params.orderId;
    const farmerId = req.params.farmerId;
    const newStatus = 'delivered'; // Set the status to "delivered" for farmer

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

        // Check if the order status is "shipping"
        if (order.orderStatus !== 'shipping') {
            return res.status(400).json({ error: 'Invalid operation: Order status must be "shipping" to update to "delivered"' });
        }

        // Update the order status to "delivered"
        order.orderStatus = newStatus;

        // Update the delivery date to the current date
        order.transportationDetails.DeliveryDate = new Date();

        // Save the order
        await order.save();

        res.json({ message: 'Order status updated to delivered successfully', order });
    } catch (error) {
        console.error('Error updating order status to delivered:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});






// Export the router
module.exports = router;
