const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
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
            default: "admin",
        },
    photo: {
            type: String,
            required: [true, "Please add a photo"],
            default: "https://i.ibb.co/4pDNDk1/avatar.png",
        },
    contactDetails: {
        phone: String,
        address: String
    }
},
    { timestamps: true }
);

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
