import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Snack } from '../types';

export interface CartItem {
    snackId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (snack: Snack, quantity: number) => void;
    removeFromCart: (snackId: string) => void;
    updateQuantity: (snackId: string, delta: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const addToCart = (snack: Snack, quantity: number) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.snackId === snack._id);
            if (existing) {
                // If item exists, just update quantity
                return prev.map(item => 
                    item.snackId === snack._id 
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            // Add new item
            return [...prev, {
                snackId: snack._id,
                name: snack.name,
                price: snack.price,
                image: snack.images && snack.images.length > 0 ? snack.images[0] : '', // Store raw path
                quantity
            }];
        });
    };

    const removeFromCart = (snackId: string) => {
        setCartItems(prev => prev.filter(item => item.snackId !== snackId));
    };

    const updateQuantity = (snackId: string, delta: number) => {
        setCartItems(prev => prev.map(item => {
            if (item.snackId === snackId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const clearCart = () => setCartItems([]);

    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};