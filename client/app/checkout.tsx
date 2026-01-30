import React, { useState } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, 
    ActivityIndicator, ScrollView, Keyboard 
} from 'react-native';
import { useRouter } from 'expo-router';
import { sendOtp, placeOrder } from '../services/api';
import { useCart } from '../context/CartContext'; 

export default function Checkout() {
    const router = useRouter();
    const { cartItems, cartTotal, clearCart } = useCart(); 

    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    if (cartItems.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={{fontSize: 18, marginBottom: 20}}>Cart is empty</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{color: 'blue', fontSize: 16}}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // --- STEP 1: REQUEST REAL SMS ---
    const handleRequestOtp = async () => {
        // 1. Strict Validation
        if (!name.trim()) return Alert.alert("Required", "Please enter your name.");
        if (phone.length !== 10) return Alert.alert("Invalid Phone", "Please enter a valid 10-digit mobile number.");
        
        Keyboard.dismiss();
        setLoading(true);
        try {
            // 2. Call Backend (Backend handles the +91 prefix for TextBee)
            await sendOtp(phone);
            
            setStep(2);
            Alert.alert(
                "SMS Sent!", 
                "We sent a code to your mobile via our SMS Gateway. It may take a few seconds to arrive."
            );
        } catch (error) {
            Alert.alert("Failed", "Could not send SMS. Ensure your internet is on.");
        } finally {
            setLoading(false);
        }
    };

    // --- STEP 2: VERIFY OTP ---
    const handleConfirm = async () => {
        if (otp.length < 4) return Alert.alert("Error", "Enter the 4-digit OTP received via SMS");

        setLoading(true);
        try {
            const itemsPayload = cartItems.map(item => ({
                snackId: item.snackId,
                quantity: item.quantity
            }));

            const orderPayload = {
                customerName: name,
                customerPhone: phone,
                otp: otp,
                items: itemsPayload
            };

            await placeOrder(orderPayload);
            clearCart();
            
            Alert.alert("🎉 Order Placed!", "We have received your order and will contact you shortly.", [
                { text: "OK", onPress: () => router.replace('/') }
            ]);
        } catch (error) {
            console.log(error);
            Alert.alert("Verification Failed", "Incorrect OTP or the code has expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.summary}>
                <Text style={styles.summaryTitle}>Order Summary</Text>
                {cartItems.map((item) => (
                    <View key={item.snackId} style={styles.itemRow}>
                        <Text style={{flex: 1, fontSize: 16}}>{item.quantity} x {item.name}</Text>
                        <Text style={{fontSize: 16, fontWeight: 'bold'}}>₹{item.price * item.quantity}</Text>
                    </View>
                ))}
                <View style={styles.divider} />
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Payable:</Text>
                    <Text style={styles.total}>₹{cartTotal}</Text>
                </View>
            </View>

            {step === 1 ? (
                <View style={styles.form}>
                    <Text style={styles.sectionTitle}>Delivery Details</Text>
                    
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput 
                        placeholder="e.g. Rahul Sharma" 
                        value={name} onChangeText={setName} 
                        style={styles.input} 
                    />
                    
                    <Text style={styles.label}>Phone Number (10 Digits)</Text>
                    <View style={styles.phoneInputContainer}>
                        <Text style={styles.prefix}>+91</Text>
                        <TextInput 
                            placeholder="9876543210" 
                            value={phone} onChangeText={setPhone} 
                            keyboardType="number-pad" 
                            maxLength={10}
                            style={styles.phoneInput} 
                        />
                    </View>
                    
                    <TouchableOpacity style={styles.btn} onPress={handleRequestOtp} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send OTP via SMS</Text>}
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.form}>
                    <Text style={styles.sectionTitle}>Verify Mobile</Text>
                    <Text style={styles.subLabel}>
                        Enter the code sent to <Text style={{fontWeight: 'bold'}}>+91 {phone}</Text>
                    </Text>
                    
                    <TextInput 
                        placeholder="XXXX" 
                        value={otp} onChangeText={setOtp} 
                        keyboardType="number-pad" 
                        maxLength={4}
                        style={[styles.input, {textAlign: 'center', letterSpacing: 10, fontSize: 24, fontWeight: 'bold'}]} 
                    />
                    
                    <TouchableOpacity style={styles.btn} onPress={handleConfirm} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify & Place Order</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setStep(1)} style={{marginTop: 20}}>
                        <Text style={{color: '#ff6347', textAlign: 'center', fontWeight: 'bold'}}>Change Phone Number</Text>
                    </TouchableOpacity>
                </View>
            )}
            
            <View style={{height: 50}} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    summary: { backgroundColor: '#f9f9f9', padding: 20, borderRadius: 12, marginBottom: 30 },
    summaryTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 12 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
    totalLabel: { fontWeight: 'bold', fontSize: 18 },
    total: { fontSize: 18, fontWeight: 'bold', color: '#28a745' },
    form: { width: '100%' },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    label: { fontSize: 14, marginBottom: 5, color: '#555', fontWeight: '600' },
    subLabel: { fontSize: 14, color: '#666', marginBottom: 20 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16, backgroundColor: '#fff' },
    
    // New Styles for Phone Input with Prefix
    phoneInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 15, backgroundColor: '#fff' },
    prefix: { paddingHorizontal: 15, fontSize: 16, fontWeight: 'bold', color: '#555', borderRightWidth: 1, borderRightColor: '#eee' },
    phoneInput: { flex: 1, padding: 12, fontSize: 16 },

    btn: { backgroundColor: '#FFD700', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, elevation: 2 },
    btnText: { color: '#000', fontSize: 16, fontWeight: 'bold' }
});