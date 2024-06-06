const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const sendMail = require('./sendMail')
const fs = require('fs');
const path = require('path')
const Product = require('../models/productModel');
const Farmer = require('../models/farmerModel');
const upload = multer({ dest: 'uploads/' });


// Get all products with filtering and search
router.get('/', async (req, res) => {
  try {
    const { name, date, search } = req.query;

    let query = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      query = { $or: [{ name: regex }, { description: regex }] };
    } else {
      if (name) {
        query.name = { $regex: new RegExp(name, 'i') };
      }
      if (date) {
        query.createdAt = { $gte: new Date(date) };
      }
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//get farmer product 
router.get('/:farmerId', async (req, res) => {
  try {
    const farmerId = req.params.farmerId; // Get the farmer ID from the route parameters

    // Fetch products associated with the specified farmer
    const products = await Product.find({ farmerId }).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//get single product 
router.get('/singleProduct/:productId', async (req, res) => {
  try {
    const productId = req.params.productId; // Get the product ID from the route parameters

    // Fetch the product by its ID
    const product = await Product.findOne({ _id: productId });

    // Check if the product was found
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If the product was found, return it in the response
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add Product Route
// Add Product Route
router.post('/:farmerId', upload.single('image'), async function (req, res, next) {
    try {
        const farmerId = req.params.farmerId;
        const farmer = await Farmer.findOne({ _id: farmerId, status: 'active' });
        if (!farmer) {
            return res.status(403).json({ message: 'You are not authorized to add products. Please contact the admin to activate your account.' });
        }
        const farmerName = farmer.name;

        // Check if file was uploaded successfully
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Upload image to imgBB
        const fileData = fs.readFileSync(req.file.path);
        const base64Data = fileData.toString('base64');

        const formData = new FormData();
        formData.append('image', base64Data);
        const IMGKEY = process.env.IMG_KEY;

        const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
            params: {
                key: IMGKEY,
            },
        });

        const imageUrl = response.data.data.url;

        // Create a new product
        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            availableQuantity: req.body.availableQuantity,
            image: imageUrl,
            farmerId: farmerId,
            productOwner: farmerName
        });

        // Save the product
        const savedProduct = await product.save();
        console.log(savedProduct)

        // Update farmer's products array
        await Farmer.findByIdAndUpdate(req.params.farmerId, { $push: { products: savedProduct._id } });

        res.status(201).json(savedProduct);
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: error.message });
        console.log(error.message);
    }
});



// Update Product Route
router.put('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        
        // Check if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update product details
        product.name = req.body.name;
        product.description = req.body.description;
        product.price = req.body.price;
        product.availableQuantity = req.body.availableQuantity;

        // Save the updated product
        const updatedProduct = await product.save();

        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete Product by admin Route
router.delete('/deleteproduct/admin/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    // Find the product and populate the owner details
    const product = await Product.findById(productId).populate('productOwner');
    const farmerId = product.farmerId;
    const farmer = await Farmer.findById(farmerId)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Send email to the owner
    await sendMail({
      email: farmer.email,
      subject: 'Product Deletion Notification',
      message: `Hello ${product.productOwner},\n\nYour product "${product.name}" has been deleted by the admin for the following reason:\n\n it does not meet our rule\n\nBest regards,\nYour Company Name`,
    });

    // Delete the product
    await product.remove();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully and email sent to the owner',
    });
  } catch (error) {
    console.error('Error deleting product or sending email:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the product or sending the email',
    });
  }
});
// Delete Product by farmer Route
router.delete('/:farmerId/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const farmerId = req.params.farmerId;
        const farmer = await Farmer.findOne({ _id: farmerId, status: 'active' });
        if (!farmer) {
            return res.status(403).json({ message: 'You are not authorized to delete products. Please contact the admin to activate your account.' });
        }

        // Delete the product
        await Product.findByIdAndDelete(productId);

        // Remove product ID from farmer's products array
        await Farmer.findByIdAndUpdate(farmerId, { $pull: { products: productId } });

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
