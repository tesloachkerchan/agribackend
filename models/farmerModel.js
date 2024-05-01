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
            default: "farmer",
            enum: ["buyer","farmer", "admin"],
        },
    photo: {
            type: String,
            required: [true, "Please add a photo"],
            default: "https://i.ibb.co/4pDNDk1/avatar.png",
        },
    contactDetails: {
        phone: String,
        address: String
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
    }]
},
    { timestamps: true }
);

const Farmer = mongoose.model('Farmer', farmerSchema);
module.exports = Farmer;
