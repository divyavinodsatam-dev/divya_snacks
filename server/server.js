// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const path = require('path'); // Import Path

// Route Imports
const snackRoutes = require('./src/routes/snackRoutes');
const orderRoutes = require('./src/routes/orderRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// 1. MAKE UPLOADS FOLDER STATIC (Access images via http://IP:5000/uploads/filename.jpg)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/snacks', snackRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));