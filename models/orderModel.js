const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Buyer',
        required: true
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Farmer',
            required: true
        },
        farmerName: {
            type: String
        },
        quantity: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        },
        productName: {
            type: String
        },
        ProductPrice:{
            type:Number
        },
    }],
    buyerContactDetails: {
        phone: String,
        address: String
    },
    farmerContactDetails: {
        phone: String,
        address: String
    },
    overallTotal: {
        type: Number, // Add overall total field to the schema
        required: true
    },
    transportationCompanyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TransportationCompany'
    },
    orderStatus: {
        type: String,
        enum: ['pending','processing', 'shipping', 'delivered'],
        default: 'pending'
    },
    transportationDetails: {
        estimatedDeliveryDate: Date,
        shippingDate: Date,
        DeliveryDate: Date,
    }
},
{ timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
