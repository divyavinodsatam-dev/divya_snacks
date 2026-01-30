const mongoose = require('mongoose');

const snackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    images: [{ type: String }], // CHANGED: Array of strings
    category: { type: String, default: 'Snacks' },
    isAvailable: { type: Boolean, default: true },
    stock: { type: Number, default: 0 }, 
});

module.exports = mongoose.model('Snack', snackSchema);