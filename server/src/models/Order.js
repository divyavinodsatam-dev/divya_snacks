const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    items: [{
        snackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Snack' },
        snackName: { type: String },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Delivered'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);