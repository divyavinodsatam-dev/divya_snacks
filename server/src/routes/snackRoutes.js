const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Snack = require('../models/Snack');
const Category = require('../models/Category'); 

// --- 1. MULTER CONFIGURATION (Image Uploads) ---
const uploadDir = path.join(__dirname, '../../uploads'); 
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Images save to 'backend/uploads'
    },
    filename: function (req, file, cb) {
        // Unique filename: snack-timestamp.ext
        cb(null, 'snack-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


// ==============================
//      CATEGORY ROUTES
// ==============================

// GET All Categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADD New Category
router.post('/categories', async (req, res) => {
    try {
        const { name } = req.body;
        const newCat = new Category({ name });
        await newCat.save();
        res.json(newCat);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE Category
router.delete('/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Category Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ==============================
//        SNACK ROUTES
// ==============================

// GET All Snacks
router.get('/', async (req, res) => {
    try {
        const snacks = await Snack.find();
        res.json(snacks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST: Add New Snack (Supports Multiple Images)
router.post('/', upload.array('images', 5), async (req, res) => {
    try {
        const { name, price, description, category, stock, isAvailable } = req.body;
        
        // Handle Images
        let imagePaths = [];
        if (req.files && req.files.length > 0) {
            imagePaths = req.files.map(file => `/uploads/${file.filename}`);
        }

        const snack = new Snack({ 
            name, 
            price, 
            description, 
            category,
            stock: Number(stock) || 0,         
            isAvailable: isAvailable === 'true' || isAvailable === true,
            images: imagePaths 
        });

        const newSnack = await snack.save();
        res.status(201).json(newSnack);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT: Update Snack (Supports Multiple Images)
router.put('/:id', upload.array('images', 5), async (req, res) => {
    try {
        const { name, price, description, category, stock, isAvailable } = req.body;
        
        let updateData = {};
        
        // Update text fields if provided
        if (name) updateData.name = name;
        if (price) updateData.price = Number(price);
        if (description) updateData.description = description;
        if (category) updateData.category = category;
        if (stock !== undefined && stock !== '') updateData.stock = Number(stock);
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable === 'true';

        // Update Images ONLY if new files are uploaded
        if (req.files && req.files.length > 0) {
            const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
            updateData.images = imagePaths; // Replaces old images array
        }

        const updatedSnack = await Snack.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true } // Return updated doc
        );
        
        res.json(updatedSnack);
    } catch (err) {
        console.error("Update Error:", err);
        res.status(400).json({ message: err.message });
    }
});

// DELETE Snack
router.delete('/:id', async (req, res) => {
    try {
        await Snack.findByIdAndDelete(req.params.id);
        res.json({ message: 'Snack deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;