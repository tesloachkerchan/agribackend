const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors');
const path = require('path')
const AuthRoute = require('./routes/authentication')
const productRoute = require('./routes/product')
const orderRoute = require('./routes/order')
const reviewRoute = require('./routes/review')
const companyRoute = require('./routes/company')
const userRoute = require('./routes/user')
const blogRoute = require('./routes/blog')

 dotenv.config();
 const app = express();
const port = process.env.PORT || 8000;

//middle ware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use('/api/v1/auth',AuthRoute)
app.use('/api/v1/products', productRoute);
app.use('/api/v1/order', orderRoute);
app.use('/api/v1/review', reviewRoute);
app.use('/api/v1/company', companyRoute)
app.use('/api/v1/user',userRoute)
app.use('/api/v1/blog',blogRoute)
// database connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('MongoDB connected!');
   
  })
  .catch((err) => console.log(err));
  // Payment route 
const CHAPA_AUTH_KEY = process.env.CHAPA_AUTH_KEY; // Ensure this is set in your .env file 
 
app.post('/accept-payment', async (req, res) => { 
  const { amount, currency, email, first_name, phone_number, tx_ref } = req.body; 
 
  try { 
    const header = { 
      headers: { 
        Authorization: `Bearer ${CHAPA_AUTH_KEY}`, 
        'Content-Type': 'application/json', 
      }, 
    }; 
 
    const body = { 
      amount, 
      currency, 
      email, 
      first_name, 
      phone_number, 
      tx_ref, 
      return_url: 'http://localhost:3001/payment-success', // Update to your actual return URL 
    }; 
 
    const response = await axios.post('https://api.chapa.co/v1/transaction/initialize', body, header); 
 
    res.status(200).json(response.data); 
  } catch (error) { 
    if (error.response) { 
      console.error('Error response:', error.response.data); 
      res.status(error.response.status).json({ 
        message: error.response.data, 
      }); 
    } else { 
      console.error('Error message:', error.message); 
      res.status(500).json({ 
        message: 'Internal server error', 
      }); 
    } 
  } 
})

//server
 app.listen(port,()=>{
    console.log('server is now running on port',port)
 });