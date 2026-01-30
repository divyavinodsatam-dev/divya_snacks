import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useCart } from '../context/CartContext';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getImageUrl } from '../utils/imageHelper';

export default function CartScreen() {
    const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
    const router = useRouter();

    if (cartItems.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Feather name="shopping-cart" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Your cart is empty</Text>
                <TouchableOpacity style={styles.shopBtn} onPress={() => router.back()}>
                    <Text style={styles.shopBtnText}>Start Shopping</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={cartItems}
                keyExtractor={item => item.snackId}
                contentContainerStyle={{ padding: 20 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image source={{ uri: getImageUrl(item.image) }} style={styles.image} />
                        <View style={styles.info}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.price}>₹{item.price}</Text>
                            
                            <View style={styles.qtyRow}>
                                <TouchableOpacity onPress={() => updateQuantity(item.snackId, -1)} style={styles.qtyBtn}>
                                    <Feather name="minus" size={16} color="#333" />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{item.quantity}</Text>
                                <TouchableOpacity onPress={() => updateQuantity(item.snackId, 1)} style={styles.qtyBtn}>
                                    <Feather name="plus" size={16} color="#333" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => removeFromCart(item.snackId)} style={styles.deleteBtn}>
                            <Feather name="trash-2" size={20} color="red" />
                        </TouchableOpacity>
                    </View>
                )}
            />

            <View style={styles.footer}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Amount:</Text>
                    <Text style={styles.totalValue}>₹{cartTotal}</Text>
                </View>
                <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push('/checkout')}>
                    <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 15, elevation: 2, alignItems: 'center' },
    image: { width: 70, height: 70, borderRadius: 10, marginRight: 15, backgroundColor: '#eee' },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold' },
    price: { fontSize: 14, color: 'green', marginBottom: 5 },
    qtyRow: { flexDirection: 'row', alignItems: 'center' },
    qtyBtn: { backgroundColor: '#f0f0f0', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    qtyText: { marginHorizontal: 10, fontWeight: 'bold' },
    deleteBtn: { padding: 10 },
    
    footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    totalLabel: { fontSize: 18, fontWeight: 'bold' },
    totalValue: { fontSize: 20, fontWeight: 'bold', color: 'green' },
    checkoutBtn: { backgroundColor: '#FFD700', padding: 15, borderRadius: 30, alignItems: 'center' },
    checkoutText: { fontSize: 18, fontWeight: 'bold', color: '#000' },

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { marginTop: 20, fontSize: 18, color: '#888', marginBottom: 20 },
    shopBtn: { backgroundColor: '#FFD700', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
    shopBtnText: { fontWeight: 'bold' }
});