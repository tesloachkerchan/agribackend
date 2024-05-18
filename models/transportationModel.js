const mongoose = require('mongoose');

const transportationCompanySchema = new mongoose.Schema({
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
    role: {
        type: String,
        required: [true],
        default: "transportation"
        },
    photo: {
            type: String,
            required: [true, "Please add a photo"],
            default: "https://i.ibb.co/4pDNDk1/avatar.png",
        },
    license: {
        type: String,
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    }
},
    { timestamps: true }
);

const TransportationCompany = mongoose.model('TransportationCompany', transportationCompanySchema);

module.exports = TransportationCompany;
