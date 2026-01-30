import axios from 'axios';
import { API_BASE_URL } from '../constants/urls';
import { Snack, OrderPayload, OtpResponse, OrderResponse } from '../types';


export interface AdminOrder {
    _id: string;
    customerName: string;
    customerPhone: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: { snackName: string; quantity: number }[];
}

export interface Category {
    _id: string;
    name: string;
}

export const fetchSnacks = async (): Promise<Snack[]> => {
    try {
        const res = await axios.get<Snack[]>(`${API_BASE_URL}/snacks`);
        return res.data;
    } catch (error) {
        console.error("Fetch error:", error);
        return [];
    }
};

export const sendOtp = async (phone: string): Promise<OtpResponse> => {
    const res = await axios.post<OtpResponse>(`${API_BASE_URL}/orders/otp/send`, { phone });
    return res.data;
};

export const placeOrder = async (orderData: OrderPayload): Promise<OrderResponse> => {
    const res = await axios.post<OrderResponse>(`${API_BASE_URL}/orders/place`, orderData);
    return res.data;
};

export const fetchOrders = async (): Promise<AdminOrder[]> => {
    try {
        const res = await axios.get<AdminOrder[]>(`${API_BASE_URL}/orders/admin/all`);
        return res.data;
    } catch (error) {
        console.error("Admin Fetch Error:", error);
        return [];
    }
};

// SNACK CRUD
export const addSnack = async (snackData: Partial<Snack>) => {
    const res = await axios.post(`${API_BASE_URL}/snacks`, snackData);
    return res.data;
};

export const addSnackWithImages = async (formData: FormData) => {
    // Note: When sending FormData, Axios usually sets the headers automatically,
    // but explicit 'Content-Type': 'multipart/form-data' helps.
    const res = await axios.post(`${API_BASE_URL}/snacks`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

export const updateSnack = async (id: string, snackData: Partial<Snack>) => {
    const res = await axios.put(`${API_BASE_URL}/snacks/${id}`, snackData);
    return res.data;
};

export const deleteSnack = async (id: string) => {
    const res = await axios.delete(`${API_BASE_URL}/snacks/${id}`);
    return res.data;
};

// ORDER ACTIONS
export const updateOrderStatus = async (orderId: string, status: string) => {
    const res = await axios.put(`${API_BASE_URL}/orders/${orderId}/status`, { status });
    return res.data;
};

// --- CATEGORY API ---
export const fetchCategories = async (): Promise<Category[]> => {
    const res = await axios.get<Category[]>(`${API_BASE_URL}/snacks/categories`);
    return res.data;
};

export const addCategory = async (name: string) => {
    const res = await axios.post(`${API_BASE_URL}/snacks/categories`, { name });
    return res.data;
};

export const deleteCategory = async (id: string) => {
    await axios.delete(`${API_BASE_URL}/snacks/categories/${id}`);
};

// --- UPDATED SNACK API ---
// We use FormData for updates too now, to handle image replacements
export const updateSnackWithImages = async (id: string, formData: FormData) => {
    const res = await axios.put(`${API_BASE_URL}/snacks/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};

export const adminLogin = async (username: string, password: string): Promise<boolean> => {
    try {
        // Simple hardcoded check for now (or connect to a real backend auth route)
        // If you want real backend auth, uncomment the axios call below:
        
        /* const response = await axios.post(`${API_BASE_URL}/admin/login`, { username, password });
        return response.data.success; 
        */

        // For this demo, we will accept these credentials:
        if (username === 'admin' && password === 'admin123') {
            return true;
        }
        return false;
    } catch (error) {
        console.error("Login error", error);
        return false;
    }
};