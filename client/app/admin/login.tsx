import React, { useState } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, 
    ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, 
    TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons'; // Import Icon
import { adminLogin } from '../../services/api';

export default function AdminLogin() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    // State to toggle password visibility
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const success = await adminLogin(username, password);
            if (success) {
                // Navigate to dashboard and replace history so back button exits
                router.replace('/admin/dashboard'); 
            } else {
                Alert.alert("Login Failed", "Invalid credentials");
            }
        } catch (error) {
            Alert.alert("Error", "Server error. Check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView 
                    contentContainerStyle={styles.scrollContent} 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Admin Portal</Text>
                        <Text style={styles.subtitle}>Please sign in to continue</Text>
                    </View>

                    <View style={styles.card}>
                        {/* Username Field */}
                        <Text style={styles.label}>Username</Text>
                        <View style={styles.inputContainer}>
                            <Feather name="user" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input}
                                placeholder="Enter username" 
                                placeholderTextColor="#aaa"
                                value={username} 
                                onChangeText={setUsername} 
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Password Field with Toggle */}
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputContainer}>
                            <Feather name="lock" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput 
                                style={[styles.input, { flex: 1 }]} // flex: 1 takes available space
                                placeholder="Enter password" 
                                placeholderTextColor="#aaa"
                                value={password} 
                                onChangeText={setPassword} 
                                secureTextEntry={!showPassword} // Toggle logic
                                autoCapitalize="none"
                            />
                            <TouchableOpacity 
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeBtn}
                            >
                                <Feather 
                                    name={showPassword ? "eye" : "eye-off"} 
                                    size={20} 
                                    color="#666" 
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.btnText}>Login</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
                        <Text style={styles.backText}>← Back to Home</Text>
                    </TouchableOpacity>

                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F5F7FA' 
    },
    scrollContent: { 
        flexGrow: 1, 
        justifyContent: 'center', 
        padding: 20 
    },
    header: { 
        alignItems: 'center', 
        marginBottom: 30 
    },
    title: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        color: '#333',
        marginBottom: 5 
    },
    subtitle: { 
        fontSize: 16, 
        color: '#888' 
    },
    card: { 
        backgroundColor: '#fff', 
        borderRadius: 15, 
        padding: 25, 
        elevation: 4, // Android Shadow
        shadowColor: '#000', // iOS Shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8
    },
    label: { 
        fontSize: 14, 
        fontWeight: '600', 
        color: '#333', 
        marginBottom: 8, 
        marginLeft: 4
    },
    inputContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#F9F9F9', 
        borderWidth: 1, 
        borderColor: '#E0E0E0', 
        borderRadius: 10, 
        marginBottom: 20,
        paddingHorizontal: 10
    },
    inputIcon: { 
        marginRight: 10 
    },
    input: { 
        flex: 1,
        paddingVertical: 12, 
        fontSize: 16, 
        color: '#333' 
    },
    eyeBtn: { 
        padding: 10 
    },
    btn: { 
        backgroundColor: '#FFD700', 
        padding: 15, 
        borderRadius: 10, 
        alignItems: 'center', 
        marginTop: 10,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5
    },
    btnText: { 
        color: '#000', 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
    backLink: { 
        alignItems: 'center', 
        marginTop: 30 
    },
    backText: { 
        color: '#666', 
        fontSize: 14 
    }
});