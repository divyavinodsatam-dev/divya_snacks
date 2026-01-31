import axios from 'axios';

// Change this to your Render URL if deployed (e.g., 'https://your-app.onrender.com')
// For local development, keep it localhost
export const BASE_URL = 'https://divya-snacks.onrender.com'; 

// 2. Define the API URL (Base + /api)
export const API_BASE_URL = `${BASE_URL}/api`;

// --- SNACKS (PUBLIC) ---
export const fetchSnacks = async () => {
    try {
        const res = await axios.get(`${API_BASE_URL}/snacks`);
        return res.data;
    } catch (error) {
        console.error("Error fetching snacks", error);
        return [];
    }
};

export const fetchCategories = async () => {
    try {
        const res = await axios.get(`${API_BASE_URL}/snacks/categories`);
        return res.data;
    } catch (error) {
        console.error("Error fetching categories", error);
        return [];
    }
};

// --- SNACKS (ADMIN) ---
export const addSnackWithImages = async (formData) => {
    const res = await axios.post(`${API_BASE_URL}/snacks`, formData);
    return res.data;
};

export const updateSnackWithImages = async (id, formData) => {
    const res = await axios.put(`${API_BASE_URL}/snacks/${id}`, formData);
    return res.data;
};

export const deleteSnack = async (id) => {
    await axios.delete(`${API_BASE_URL}/snacks/${id}`);
};

// --- CATEGORIES (ADMIN) ---
export const addCategory = async (name) => {
    const res = await axios.post(`${API_BASE_URL}/snacks/categories`, { name });
    return res.data;
};

export const deleteCategory = async (id) => {
    await axios.delete(`${API_BASE_URL}/snacks/categories/${id}`);
};

// --- ORDERS (ADMIN) ---
export const fetchOrders = async () => {
    try {
        // ✅ FIX: Updated path from '/orders' to '/orders/admin/all'
        const res = await axios.get(`${API_BASE_URL}/orders/admin/all`);
        return res.data;
    } catch (error) {
        console.error("Error fetching orders", error);
        return [];
    }
};

export const updateOrderStatus = async (id, status) => {
    const res = await axios.put(`${API_BASE_URL}/orders/${id}/status`, { status });
    return res.data;
};

// --- CHECKOUT & OTP ---
export const sendOtp = async (phone) => {
    try {
        // Backend Route: router.post('/otp/send') mounted at '/api/orders'
        // Full Path: /api/orders/otp/send
        const res = await axios.post(`${API_BASE_URL}/orders/otp/send`, { phone });
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const placeOrderWithOtp = async (orderData) => {
    try {
        // Backend Route: router.post('/place') mounted at '/api/orders'
        // Full Path: /api/orders/place
        const res = await axios.post(`${API_BASE_URL}/orders/place`, orderData);
        return res.data;
    } catch (error) {
        throw error;
    }
};

// --- AUTH ---
export const adminLogin = async (username, password) => {
    return username === 'admin' && password === 'admin123';
};