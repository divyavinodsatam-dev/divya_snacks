export interface Snack {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string; // Used for display logic
    images: string[]; // Array of image paths from backend
    category: string; // <--- ADD THIS LINE
    isAvailable: boolean;
    stock: number;
}

export interface OrderPayload {
    customerName: string;
    customerPhone: string;
    otp: string;
    items: {
        snackId: string;
        quantity: number;
    }[];
}

export interface OtpResponse {
    message: string;
}

export interface OrderResponse {
    message: string;
    orderId: string;
}

