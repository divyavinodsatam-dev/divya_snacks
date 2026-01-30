import React, { useEffect, useState } from 'react';
import { 
    View, Text, Image, StyleSheet, TouchableOpacity, Alert, 
    ScrollView, Dimensions, StatusBar 
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { fetchSnacks } from '../../services/api';
import { Snack } from '../../types';
import { getImageUrl } from '../../utils/imageHelper'; // <--- 1. IMPORT THIS

const { width, height } = Dimensions.get('window');

export default function SnackDetail() {
    const router = useRouter();
    const { addToCart } = useCart();
    
    const params = useLocalSearchParams<{ id: string; name: string; price: string; image: string; description: string }>();
    
    const [item, setItem] = useState<Snack | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        loadFreshData();
    }, []);

    const loadFreshData = async () => {
        try {
            const allSnacks = await fetchSnacks();
            const found = allSnacks.find(s => s._id === params.id);
            if (found) setItem(found);
        } catch (e) {
            console.error("Failed to load fresh details");
        } finally {
            setLoading(false);
        }
    };

    // --- 2. FIX IMAGE URL LOGIC ---
    // If we have fresh item data, use that. Otherwise use params.
    // ALWAYS wrap the result in getImageUrl() to ensure it has the http:// part.
    const rawImage = item?.images?.[0] ? item.images[0] : params.image; 
    const displayImage = getImageUrl(rawImage); 

    const displayName = item?.name || params.name;
    const displayPrice = item?.price || parseFloat(params.price || '0');
    const displayDesc = item?.description || params.description;
    const currentStock = item?.stock ?? 10;
    const isSoldOut = currentStock === 0;

    const handleAddToCart = () => {
        if (isSoldOut) return;

        const snackToAdd: Snack = {
            _id: params.id || '',
            name: displayName || 'Unknown',
            price: displayPrice,
            description: displayDesc || '',
            image: displayImage, 
            images: [displayImage],
            category: item?.category || 'Snack',
            stock: currentStock,
            isAvailable: true
        };

        addToCart(snackToAdd, quantity);

        Alert.alert("Added to Cart", `${quantity} x ${displayName} added!`, [
            { text: "Continue Shopping", style: "cancel", onPress: () => router.back() },
            { text: "View Cart", onPress: () => router.push('/cart') }
        ]);
    };

    const handleQuantityChange = (delta: number) => {
        const newQty = quantity + delta;
        if (newQty < 1) return;
        if (newQty > currentStock) {
            Alert.alert("Max Stock Reached", `Only ${currentStock} items available.`);
            return;
        }
        setQuantity(newQty);
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            <View style={styles.imageContainer}>
                {/* 3. USE THE FIXED URL */}
                <Image source={{ uri: displayImage }} style={styles.image} resizeMode="contain" />
                
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={styles.sheetContainer}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    <View style={styles.headerRow}>
                        <View style={{flex: 1}}>
                            <Text style={styles.title}>{displayName}</Text>
                            <Text style={styles.category}>{item?.category || 'Snack'}</Text>
                        </View>
                        <Text style={styles.price}>₹{displayPrice}</Text>
                    </View>

                    {isSoldOut ? (
                        <View style={[styles.stockBadge, { backgroundColor: '#FFEBEE' }]}>
                            <Text style={[styles.stockText, { color: '#D32F2F' }]}>Sold Out</Text>
                        </View>
                    ) : (
                        <View style={[styles.stockBadge, { backgroundColor: '#E0F2F1' }]}>
                            <Text style={[styles.stockText, { color: '#00695C' }]}>In Stock</Text>
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.description}>
                        {displayDesc || "Freshly homemade with love. Perfect for your daily cravings."}
                    </Text>

                </ScrollView>

                <View style={styles.footer}>
                    <View style={styles.qtyContainer}>
                        <TouchableOpacity 
                            onPress={() => handleQuantityChange(-1)} 
                            style={[styles.qtyBtn, isSoldOut && styles.disabledBtn]}
                            disabled={isSoldOut}
                        >
                            <Feather name="minus" size={20} color="#333" />
                        </TouchableOpacity>
                        
                        <Text style={styles.qtyText}>{quantity}</Text>
                        
                        <TouchableOpacity 
                            onPress={() => handleQuantityChange(1)} 
                            style={[styles.qtyBtn, isSoldOut && styles.disabledBtn]}
                            disabled={isSoldOut}
                        >
                            <Feather name="plus" size={20} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                        style={[styles.addBtn, isSoldOut && { backgroundColor: '#ccc' }]} 
                        onPress={handleAddToCart}
                        disabled={isSoldOut}
                    >
                        <Text style={styles.addBtnText}>
                            {isSoldOut ? 'Sold Out' : `Add • ₹${displayPrice * quantity}`}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    imageContainer: { 
        height: height * 0.45, 
        width: '100%',
        backgroundColor: '#F8F9FA', 
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40
    },
    image: { width: '80%', height: '80%' }, 
    backBtn: { 
        position: 'absolute', top: 50, left: 20, 
        backgroundColor: '#fff', 
        width: 45, height: 45, borderRadius: 25,
        justifyContent: 'center', alignItems: 'center',
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5
    },
    sheetContainer: { 
        flex: 1, 
        backgroundColor: '#fff',
        marginTop: -20, 
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        elevation: 0 
    },
    scrollContent: { padding: 25, paddingBottom: 100 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
    title: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', width: '70%' },
    category: { fontSize: 16, color: '#999', marginTop: 4 },
    price: { fontSize: 28, fontWeight: 'bold', color: '#FFD700' }, 
    stockBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 25 },
    stockText: { fontSize: 14, fontWeight: 'bold' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    description: { fontSize: 16, lineHeight: 24, color: '#666' },
    footer: { 
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff',
        padding: 20, paddingTop: 10,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderTopWidth: 1, borderTopColor: '#f0f0f0'
    },
    qtyContainer: { 
        flexDirection: 'row', alignItems: 'center', 
        backgroundColor: '#F5F5F5', borderRadius: 30, paddingHorizontal: 5, paddingVertical: 5 
    },
    qtyBtn: { width: 45, height: 45, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', borderRadius: 25, elevation: 1 },
    disabledBtn: { opacity: 0.5 },
    qtyText: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 15, minWidth: 20, textAlign: 'center' },
    addBtn: { 
        backgroundColor: '#FF5252', 
        flex: 1, marginLeft: 20, 
        paddingVertical: 18, borderRadius: 30, 
        alignItems: 'center', elevation: 2 
    },
    addBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});