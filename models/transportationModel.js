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
        phone: String,
        address: String
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
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }]
},
    { timestamps: true }
);

const TransportationCompany = mongoose.model('TransportationCompany', transportationCompanySchema);

module.exports = TransportationCompany;
