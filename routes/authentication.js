// Import necessary modules
const express = require('express');
const axios = require('axios')
const multer = require('multer');
const fs = require('fs');
const path = require('path')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Farmer = require('../models/farmerModel'); // Assuming you have a Farmer model defined
const Buyer = require('../models/buyerModel'); // Import Buyer model
const TransportationCompany = require('../models/transportationModel'); 
const Admin = require('../models/adminModel')
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/admin/register', async (req, res) => {
  try {
    const { role, name, email, password, confirmPassword, ...otherFields } = req.body;

    // Check if password matches confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await Admin.findOne({ email });
    if (user) {
          return res.status(400).json({ message: 'Admin already exists' });
    }
    user = await Admin.create({ name, email, password: hashedPassword, ...otherFields });
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/buyer/register', async (req, res) => {
  try {
    const { role, name, email, password, confirmPassword, ...otherFields } = req.body;

    // Check if password matches confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await Buyer.findOne({ email });
    if (user) {
          return res.status(400).json({ message: 'Admin already exists' });
    }
    user = await Buyer.create({ name, email, password: hashedPassword, ...otherFields });
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/register', upload.fields([{ name: 'license', maxCount: 1 }, { name: 'profilePicture', maxCount: 1 }]), async (req, res) => {
  try {
    const { role, name, email, password, confirmPassword, phone, address, ...otherFields } = req.body;

    // Check if password matches confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if files were uploaded successfully
    if (!req.files.license || !req.files.profilePicture) {
      return res.status(400).json({ message: 'Files not uploaded successfully' });
    }

    // Upload license and profile picture to imgbb
    const uploadToImgbb = async (file) => {
      const fileData = fs.readFileSync(file.path);
      const base64Data = fileData.toString('base64');
      const formData = new FormData();
      formData.append('image', base64Data);
      const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
        params: {
          key: process.env.IMG_KEY,
        },
      });
      return response.data.data.url;
    };

    const licenseUrl = await uploadToImgbb(req.files.license[0]);
    const profilePictureUrl = await uploadToImgbb(req.files.profilePicture[0]);

    let user;
    switch (role) {
      case 'farmer':
        user = await Farmer.findOne({ email });
        if (user) {
          return res.status(400).json({ message: 'Farmer already exists' });
        }
        user = await Farmer.create({ name, email, password: hashedPassword, license: licenseUrl, photo: profilePictureUrl, contactDetails: { phone, address }, ...otherFields });
        break;
      case 'transportation':
        user = await TransportationCompany.findOne({ email });
        if (user) {
          return res.status(400).json({ message: 'Transportation Company already exists' });
        }
        user = await TransportationCompany.create({ name, email, password: hashedPassword, license: licenseUrl, photo: profilePictureUrl, contactDetails: { phone, address }, ...otherFields });
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (req.files.license) fs.unlinkSync(req.files.license[0].path);
    if (req.files.profilePicture) fs.unlinkSync(req.files.profilePicture[0].path);
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
           user = await Admin.findOne({ email });
          if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
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
