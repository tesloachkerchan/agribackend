const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors');
const AuthRoute = require('./routes/authentication')
const productRoute = require('./routes/product')
const orderRoute = require('./routes/order')
const reviewRoute = require('./routes/review')

 dotenv.config();
 const app = express();
const port = process.env.PORT || 8000;

//middle ware
app.use(cors());
app.use(express.json());
app.use('/api/v1/auth',AuthRoute)
app.use('/api/v1/products', productRoute);
app.use('/api/v1/order', orderRoute);
app.use('/api/v1/review', reviewRoute);
// database connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('MongoDB connected!');
   
  })
  .catch((err) => console.log(err));

//server
 app.listen(port,()=>{
    console.log('server is now running on port',port)
 });