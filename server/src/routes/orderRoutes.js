const express = require('express');
const router = express.Router();
const axios = require('axios');
const Otp = require('../models/Otp');
const Order = require('../models/Order');
const Snack = require('../models/Snack');

// 1. Send OTP
router.post('/otp/send', async (req, res) => {
    const { phone } = req.body;
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString(); 

    // Save to DB
    await Otp.findOneAndUpdate(
        { phone },
        { otp: generatedOtp, createdAt: Date.now() },
        { upsert: true, new: true }
    );

    // --- TEXTBEE SENDING LOGIC ---
    try {
        const apiKey = process.env.TEXTBEE_API_KEY;
        const deviceId = process.env.TEXTBEE_DEVICE_ID;

        // TextBee requires country code (E.164 format). 
        // If your frontend sends 10 digits (9876543210), prepending +91 is safe for India.
        const formattedPhone = phone.length === 10 ? `+91${phone}` : phone;

        // Send Request to TextBee
        await axios.post(
            `https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/send-sms`, 
            {
                recipients: [formattedPhone], // Must be an array
                message: `Your Divyam Snacks verification code is ${generatedOtp}. Valid for 5 mins.`
            }, 
            {
                headers: {
                    'x-api-key': apiKey
                }
            }
        );

        console.log(`✅ SMS Sent via TextBee to ${formattedPhone}`);
        res.json({ message: 'OTP Sent via SMS' });

    } catch (error) {
        console.error("❌ TextBee Failed:", error.response?.data || error.message);
        
        // Fallback: If SMS fails (e.g., phone offline), log it so you can still test locally
        console.log(`>>> FALLBACK MOCK OTP: ${generatedOtp} <<<`);
        // We still send success to frontend so the UI doesn't break
        res.json({ message: 'OTP Sent (Fallback)' });
    }
});

// 2. Verify & Place Order
router.post('/place', async (req, res) => {
    const { customerName, customerPhone, otp, items } = req.body;

    // Verify OTP
    const validOtp = await Otp.findOne({ phone: customerPhone, otp });
    if (!validOtp) return res.status(400).json({ error: "Invalid OTP" });

    try {
        let totalAmount = 0;
        const orderItems = [];

        // Validate Prices Backend-side
        for (const item of items) {
            const snack = await Snack.findById(item.snackId);
            if (!snack) continue;
            
            const itemTotal = snack.price * item.quantity;
            totalAmount += itemTotal;
            orderItems.push({
                snackId: snack._id,
                snackName: snack.name,
                quantity: item.quantity,
                price: snack.price
            });
        }

        const newOrder = new Order({
            customerName,
            customerPhone,
            items: orderItems,
            totalAmount
        });

        await newOrder.save();
        await Otp.deleteOne({ _id: validOtp._id }); // Clear OTP

        res.status(201).json({ message: "Order Confirmed!", orderId: newOrder._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// GET all orders (Admin only)
router.get('/admin/all', async (req, res) => {
    try {
        // Sort by Created Date (Newest first)
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE Order Status (Confirm Order)
router.put('/:id/status', async (req, res) => {
    const { status } = req.body; // e.g., 'Confirmed'
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            { status: status }, 
            { new: true }
        );
        
        // MOCK SMS NOTIFICATION
        console.log(`>>> SMS SENT TO ${order.customerPhone}: Your order #${order._id} is ${status}! <<<`);
        
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;