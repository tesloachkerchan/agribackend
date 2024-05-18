const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: [true],
        default: "farmer"
    },
    photo: {
        type: String,
        required: [true, "Please add a photo"],
        default: "https://i.ibb.co/4pDNDk1/avatar.png",
    },
    license: {
        type: String,
    },
    contactDetails: {
        phone: {
            type: String,
            default: "N/A"
        },
        address: {
            type: String,
            default: "N/A"
        }
    },
    market: {
        type: String,
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "inactive"
    }
}, { timestamps: true });

const Farmer = mongoose.model('Farmer', farmerSchema);

module.exports = Farmer;
