const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phone: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, index: { expires: 300 } } // 5 Minutes TTL
});

module.exports = mongoose.model('Otp', otpSchema);