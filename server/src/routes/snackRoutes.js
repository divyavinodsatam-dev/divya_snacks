const express = require('express');
const router = express.Router();
const Snack = require('../models/Snack');
const Category = require('../models/Category');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- FILE UPLOAD CONFIGURATION ---
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, 'snack-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- CATEGORY ROUTES ---

router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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

router.delete('/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SNACK ROUTES ---

// GET All Snacks
router.get('/', async (req, res) => {
    try {
        const snacks = await Snack.find();
        res.json(snacks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST (Add New Snack)
router.post('/', upload.array('images', 5), async (req, res) => {
    try {
        // 1. Extract 'stock' and 'isAvailable' properly
        const { name, price, description, category, stock, isAvailable } = req.body;
        
        const imagePaths = req.files.map(file => `/uploads/${file.filename}`);

        const snack = new Snack({ 
            name, 
            price, 
            description, 
            category,
            stock: Number(stock) || 10,         
            isAvailable: isAvailable || true,
            images: imagePaths 
        });

        const newSnack = await snack.save();
        res.status(201).json(newSnack);
    } catch (err) {
        console.error(err); // Log error for debugging
        res.status(400).json({ message: err.message });
    }
});

// PUT (Update Snack)
// router.put('/:id', upload.array('images', 5), async (req, res) => {
//     try {
//         // 1. EXTRACT 'stock' HERE (This was likely missing causing your error)
//         const { name, price, description, category, stock, isAvailable } = req.body;
        
//         let updateData = { 
//             name, 
//             price, 
//             description, 
//             category,
//             stock: Number(stock),          
//             isAvailable
//         };

//         // Only update images if new ones were uploaded
//         if (req.files && req.files.length > 0) {
//             const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
//             updateData.images = imagePaths;
//         }

//         const updatedSnack = await Snack.findByIdAndUpdate(req.params.id, updateData, { new: true });
//         res.json(updatedSnack);
//     } catch (err) {
//         console.error(err);
//         res.status(400).json({ message: err.message });
//     }
// });
// PUT (Update Snack)
router.put('/:id', upload.array('images', 5), async (req, res) => {
    try {
        const { name, price, description, category, stock, isAvailable } = req.body;
        
        // 1. Initialize update object
        let updateData = {};

        // 2. Only add fields if they are provided (prevent NaN errors)
        if (name) updateData.name = name;
        if (price) updateData.price = Number(price);
        if (description) updateData.description = description;
        if (category) updateData.category = category;
        
        // Check if stock is provided (it could be 0, so check for undefined)
        if (stock !== undefined && stock !== '') {
            updateData.stock = Number(stock);
        }

        // Handle boolean carefully
        if (isAvailable !== undefined) {
            updateData.isAvailable = isAvailable === 'true' || isAvailable === true;
        }

        // 3. Handle Images
        if (req.files && req.files.length > 0) {
            const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
            updateData.images = imagePaths;
        }

        const updatedSnack = await Snack.findByIdAndUpdate(req.params.id, updateData, { new: true });
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