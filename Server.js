const express = require('express');
const cors = require('cors');
const session = require('express-session');
const db = require('./Config/db');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
  origin: ['https://velanmartadmin.deecodes.io', 'https://velanapp.deecodes.io'], // allow both origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));


// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('uploads directory created');
}

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(uploadDir));

app.use(
  session({
    secret: process.env.ACCESS_SECRET_TOKEN,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);

(async () => {
    await db.sync();
    console.log("Tables created successfully");
})();

// Root route
app.get('/', (req, res) => {
    res.send('Welcome');
  });
// Post route
app.post('/', (req, res) => {
  res.send('Post request submitted');
});

//Admin Route
const adminRoutes = require('./routes/adminRoutes');
app.use('/api', adminRoutes);

//User Route
const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

//Category Route
const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api', categoryRoutes);

//Driver Details Route
const driverDetailsRoutes = require('./routes/driverDetailsRoutes');
app.use('/api', driverDetailsRoutes);

//Products Route
const productsRoutes = require('./routes/productsRoutes');
app.use('/api', productsRoutes);

//Customer Profile Route
const customerProfileRoutes = require('./routes/customerProfileRoutes');
app.use('/api', customerProfileRoutes);

//Orders Route
const ordersRoutes = require('./routes/ordersRoutes');
app.use('/api', ordersRoutes);

//Order Items Route
const orderItemsRoutes = require('./routes/orderItemsRoutes');
app.use('/api', orderItemsRoutes);

//Vendor Route
const vendorRoutes = require('./routes/vendorRoutes');
app.use('/api', vendorRoutes);

//Farmer Route
const farmerRoutes = require('./routes/farmerRoutes');
app.use('/api', farmerRoutes);

//Invoice Route
const invoiceRoutes = require('./routes/invoiceRoutes');
app.use('/api', invoiceRoutes);

//Vendor Submission Route
const vendorSubmissionRoutes = require('./routes/vendorSubmissionRoutes');
app.use('/api', vendorSubmissionRoutes);

//Procurement Route
const procurementRoutes = require('./routes/procurementRoutes');
app.use('/api', procurementRoutes);

//Inventory Route
const inventoryRoutes = require('./routes/inventoryRoutes');
app.use('/api', inventoryRoutes);

//Settings Route
const settingsRoutes = require('./routes/settingsRoutes');
app.use('/api', settingsRoutes);

//Add To Cart Route
const addToCartRoutes = require('./routes/addToCartRoutes');
app.use('/api', addToCartRoutes);

//Delivery Route
const deliveryRoutes = require('./routes/deliveryRoutes');
app.use('/api', deliveryRoutes);

//Notification Route
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api', notificationRoutes);
// Listen on the port from the .env file
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
