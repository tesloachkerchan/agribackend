// Import necessary modules
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Farmer = require('./../models/farmerModel'); // Assuming you have a Farmer model defined
const Buyer = require('../models/buyerModel'); // Import Buyer model
const TransportationCompany = require('../models/transportationModel'); 

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { role, name, email, password, confirmPassword, ...otherFields } = req.body;

    // Check if password matches confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    switch (role) {
      case 'buyer':
        user = await Buyer.findOne({ email });
        if (user) {
          return res.status(400).json({ message: 'Buyer already exists' });
        }
        // Additional checks or validations specific to buyer registration can be added here
        user = await Buyer.create({ name, email, password: hashedPassword, ...otherFields });
        break;
      case 'farmer':
        user = await Farmer.findOne({ email });
        if (user) {
          return res.status(400).json({ message: 'Farmer already exists' });
        }
        // Additional checks or validations specific to farmer registration can be added here
        user = await Farmer.create({ name, email, password: hashedPassword, ...otherFields });
        break;
      case 'transportation':
        user = await TransportationCompany.findOne({ email });
        if (user) {
          return res.status(400).json({ message: 'Transportation Company already exists' });
        }
        // Additional checks or validations specific to transportation company registration can be added here
        user = await TransportationCompany.create({ name, email, password: hashedPassword, ...otherFields });
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user;

    // Check in Buyer collection
    user = await Buyer.findOne({ email });
    if (!user) {
      // Check in Farmer collection
      user = await Farmer.findOne({ email });
      if (!user) {
        // Check in TransportationCompany collection
        user = await TransportationCompany.findOne({ email });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
      }
      }

    // Check if password is valid
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
