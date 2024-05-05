const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const Farmer = require('../models/farmerModel');


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
router.post('/:farmerId', async (req, res) => {
    try {
        const farmerId = req.params.farmerId;
        // Create a new product
        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            availableQuantity: req.body.availableQuantity,
            farmerId: farmerId // Assuming authenticated farmer's ID is stored in req.user._id
        });

        // Save the product
        const savedProduct = await product.save();

        // Update farmer's products array
        await Farmer.findByIdAndUpdate(req.params.farmerId, { $push: { products: savedProduct._id } });

        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
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

// Delete Product Route
// Delete Product Route
router.delete('/:farmerId/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const farmerId = req.params.farmerId;

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
