const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
            default: "buyer",
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
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    }
},
    { timestamps: true }
);

const Buyer = mongoose.model('Buyer', buyerSchema);

module.exports = Buyer;
