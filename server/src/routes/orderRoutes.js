const express = require('express');
const router = express.Router();
const axios = require('axios'); // Required for TextBee
const Otp = require('../models/Otp');
const Order = require('../models/Order');
const Snack = require('../models/Snack');

// 1. Send OTP (User Side)
router.post('/otp/send', async (req, res) => {
    const { phone } = req.body;
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString(); 

    // Upsert OTP
    await Otp.findOneAndUpdate(
        { phone },
        { otp: generatedOtp, createdAt: Date.now() },
        { upsert: true, new: true }
    );

    // TextBee SMS
    try {
        const apiKey = process.env.TEXTBEE_API_KEY;
        const deviceId = process.env.TEXTBEE_DEVICE_ID;
        const formattedPhone = phone.length === 10 ? `+91${phone}` : phone;

        await axios.post(
            `https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/send-sms`, 
            {
                recipients: [formattedPhone],
                message: `Your Divyam Snacks verification code is ${generatedOtp}. Valid for 5 mins.`
            }, 
            { headers: { 'x-api-key': apiKey } }
        );
        res.json({ message: 'OTP Sent via SMS' });
    } catch (error) {
        console.error("❌ TextBee OTP Failed:", error.message);
        console.log(`>>> FALLBACK MOCK OTP: ${generatedOtp} <<<`);
        res.json({ message: 'OTP Sent (Fallback)' });
    }
});

// 2. Verify & Place Order (User Side)
router.post('/place', async (req, res) => {
    const { customerName, customerPhone, otp, items } = req.body;

    const validOtp = await Otp.findOne({ phone: customerPhone, otp });
    if (!validOtp) return res.status(400).json({ error: "Invalid OTP" });

    try {
        let totalAmount = 0;
        const orderItems = [];

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
        await Otp.deleteOne({ _id: validOtp._id });

        res.status(201).json({ message: "Order Confirmed!", orderId: newOrder._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. GET all orders (Admin)
router.get('/admin/all', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. UPDATE Status & Send SMS (Admin)
router.put('/:id/status', async (req, res) => {
    const { status } = req.body; // 'Confirmed' or 'Rejected'
    
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            { status: status }, 
            { new: true }
        );

        if (!order) return res.status(404).json({ message: "Order not found" });
        
        // --- SEND SMS NOTIFICATION ---
        try {
            const apiKey = process.env.TEXTBEE_API_KEY;
            const deviceId = process.env.TEXTBEE_DEVICE_ID;
            const phone = order.customerPhone.length === 10 ? `+91${order.customerPhone}` : order.customerPhone;
            
            let message = "";
            if (status === 'Confirmed') {
                message = `Hi ${order.customerName}, your Order #${order._id.toString().slice(-4)} is CONFIRMED! We are preparing it now.`;
            } else if (status === 'Rejected') {
                message = `Hi ${order.customerName}, sorry, your Order #${order._id.toString().slice(-4)} was REJECTED. Please contact the store.`;
            }

            if (message) {
                await axios.post(
                    `https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/send-sms`, 
                    {
                        recipients: [phone],
                        message: message
                    }, 
                    { headers: { 'x-api-key': apiKey } }
                );
                console.log(`✅ Status SMS Sent to ${phone}`);
            }
        } catch (smsError) {
            console.error("❌ Failed to send Status SMS:", smsError.message);
        }
        
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 5. DELETE Order (Admin)
router.delete('/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: "Order Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;