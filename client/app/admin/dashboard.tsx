import React, { useEffect, useState } from 'react';
import { 
    View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, 
    TextInput, Alert, Modal, Image, ScrollView, Switch, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { 
    fetchOrders, fetchSnacks, updateOrderStatus, deleteSnack, 
    addSnackWithImages, updateSnackWithImages, 
    fetchCategories, addCategory, deleteCategory 
} from '../../services/api';
import {  Snack  } from '../../types';
import { getImageUrl } from '../../utils/imageHelper';
import {Category, AdminOrder} from '../../services/api';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'Orders' | 'Menu' | 'Categories'>('Orders');
    
    // Data State
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [snacks, setSnacks] = useState<Snack[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    // Form State (Add/Edit Snack)
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    
    const [formName, setFormName] = useState('');
    const [formPrice, setFormPrice] = useState('');
    const [formStock, setFormStock] = useState(''); 
    const [formDesc, setFormDesc] = useState('');
    const [formCategory, setFormCategory] = useState('');
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    
    // Category Form State
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setRefreshing(true);
        try {
            if (activeTab === 'Orders') {
                setOrders(await fetchOrders());
            } else if (activeTab === 'Menu') {
                const [sData, cData] = await Promise.all([fetchSnacks(), fetchCategories()]);
                setSnacks(sData);
                setCategories(cData);
            } else if (activeTab === 'Categories') {
                setCategories(await fetchCategories());
            }
        } catch (e) {
            console.error("Failed to load data", e);
        } finally {
            setRefreshing(false);
        }
    };

    // --- SNACK ACTIONS ---

    const handleSaveSnack = async () => {
        if (!formName.trim() || !formPrice.trim() || !formCategory.trim()) {
            return Alert.alert("Missing Info", "Please fill in Name, Price, and Category.");
        }

        const formData = new FormData();
        formData.append('name', formName);
        formData.append('price', formPrice);
        formData.append('description', formDesc || ''); 
        formData.append('category', formCategory);
        
        // Default stock to 0 if left blank
        const safeStock = formStock && formStock.trim() !== '' ? formStock : '0';
        formData.append('stock', safeStock);

        if (!isEditing) {
            formData.append('isAvailable', 'true');
        }

        if (selectedImages.length > 0) {
            selectedImages.forEach((uri) => {
                const filename = uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                // @ts-ignore
                formData.append('images', { uri, name: filename, type });
            });
        }

        try {
            if (isEditing && editId) {
                await updateSnackWithImages(editId, formData);
                Alert.alert("Success", "Item updated!");
            } else {
                await addSnackWithImages(formData);
                Alert.alert("Success", "New item added!");
            }
            setModalVisible(false);
            loadData();
        } catch (e: any) {
            console.error("Save Error:", e);
            Alert.alert("Error", "Could not save. Check your inputs.");
        }
    };

    const handleDeleteSnack = async (id: string) => {
        Alert.alert("Delete Item", "Are you sure?", [
            { text: "Cancel" },
            { text: "Delete", style: 'destructive', onPress: async () => {
                await deleteSnack(id);
                loadData();
            }}
        ]);
    };

    // const handleToggleAvailability = async (item: Snack) => {
    //     try {
    //         const updatedSnacks = snacks.map(s => 
    //             s._id === item._id ? { ...s, isAvailable: !s.isAvailable } : s
    //         );
    //         setSnacks(updatedSnacks);

    //         const formData = new FormData();
    //         formData.append('name', item.name);
    //         formData.append('price', item.price.toString());
    //         formData.append('isAvailable', (!item.isAvailable).toString()); 
            
    //         await updateSnackWithImages(item._id, formData);
    //     } catch (e) {
    //         Alert.alert("Error", "Could not update status");
    //         loadData(); 
    //     }
    // };

    // --- ORDER ACTIONS ---

    const handleToggleAvailability = async (item: Snack) => {
        try {
            // 1. Optimistic Update (Update UI instantly)
            const updatedSnacks = snacks.map(s => 
                s._id === item._id ? { ...s, isAvailable: !s.isAvailable } : s
            );
            setSnacks(updatedSnacks);

            // 2. Prepare Data for Backend
            const formData = new FormData();
            formData.append('name', item.name);
            formData.append('price', item.price.toString());
            
            // SEND THE OPPOSITE OF CURRENT STATUS
            // If item is visible (true), we send 'false'
            formData.append('isAvailable', (!item.isAvailable).toString()); 
            
            // IMPORTANT: Send existing stock so backend doesn't crash
            formData.append('stock', (item.stock || 0).toString());

            await updateSnackWithImages(item._id, formData);
        } catch (e) {
            console.error("Toggle error:", e);
            Alert.alert("Error", "Could not update status. Please refresh.");
            loadData(); // Reload data if it failed
        }
    };
    
    const handleConfirmOrder = async (orderId: string, phone: string) => {
        try {
            await updateOrderStatus(orderId, 'Confirmed');
            Alert.alert("Confirmed", `SMS notification sent to +91${phone}`);
            loadData();
        } catch (e) {
            Alert.alert("Error", "Failed to confirm order");
        }
    };

    // --- CATEGORY ACTIONS ---

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        await addCategory(newCategoryName);
        setNewCategoryName('');
        loadData();
    };

    const handleDeleteCategory = async (id: string) => {
        Alert.alert("Delete", "Are you sure?", [
            { text: "Cancel" },
            { text: "Delete", style: 'destructive', onPress: async () => {
                await deleteCategory(id);
                loadData();
            }}
        ]);
    };

    // --- UI HELPERS ---

    const openAddModal = () => {
        setIsEditing(false);
        setEditId(null);
        setFormName(''); setFormPrice(''); setFormStock(''); setFormDesc(''); setFormCategory(''); setSelectedImages([]);
        setModalVisible(true);
    };

    const openEditModal = (item: Snack) => {
        setIsEditing(true);
        setEditId(item._id);
        setFormName(item.name);
        setFormPrice(item.price.toString());
        setFormStock(item.stock ? item.stock.toString() : '0');
        setFormDesc(item.description);
        setFormCategory(item.category || '');
        setSelectedImages([]); 
        setModalVisible(true);
    };

    const pickImages = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            const uris = result.assets.map(asset => asset.uri);
            setSelectedImages(uris);
        }
    };

    // --- RENDERERS ---

    const renderSnack = ({ item }: { item: Snack }) => (
        <View style={[styles.card, !item.isAvailable && styles.cardDisabled]}>
            <Image source={{ uri: getImageUrl(item.images) }} style={styles.snackImg} />
            <View style={styles.info}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.sub}>Stock: {item.stock || 0}</Text>
                <Text style={styles.price}>₹{item.price}</Text>
            </View>
            <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>{item.isAvailable ? 'Live' : 'Hidden'}</Text>
                <Switch 
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={item.isAvailable ? "#007bff" : "#f4f3f4"}
                    onValueChange={() => handleToggleAvailability(item)}
                    value={item.isAvailable}
                />
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconBtn}>
                    <Feather name="edit-2" size={20} color="blue" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteSnack(item._id)} style={styles.iconBtn}>
                    <Feather name="trash" size={20} color="red" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderOrder = ({ item }: { item: AdminOrder }) => (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                    <Text style={styles.title}>{item.customerName}</Text>
                    <Text style={[styles.sub, { fontWeight: 'bold', color: item.status==='Confirmed'?'green':'orange' }]}>
                        {item.status}
                    </Text>
                </View>
                <Text style={styles.sub}>{item.customerPhone}</Text>
                <View style={{marginVertical: 5}}>
                    {item.items.map((s, i) => (
                        <Text key={i} style={{fontSize: 12, color: '#444'}}>
                            • {s.quantity} x {s.snackName}
                        </Text>
                    ))}
                </View>
                <Text style={{ marginTop: 5, fontWeight: 'bold' }}>Total: ₹{item.totalAmount}</Text>
            </View>
            {item.status === 'Pending' && (
                <TouchableOpacity style={styles.confirmBtn} onPress={() => handleConfirmOrder(item._id, item.customerPhone)}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Confirm</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderCategory = ({ item }: { item: Category }) => (
        <View style={[styles.card, { alignItems: 'center', paddingVertical: 15 }]}>
            <Text style={[styles.title, { flex: 1 }]}>{item.name}</Text>
            <TouchableOpacity onPress={() => handleDeleteCategory(item._id)}>
                <Feather name="trash-2" size={20} color="red" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.tabs}>
                {['Orders', 'Menu', 'Categories'].map((t) => (
                    <TouchableOpacity 
                        key={t} 
                        style={[styles.tab, activeTab === t && styles.activeTab]} 
                        onPress={() => setActiveTab(t as any)}
                    >
                        <Text style={[styles.tabText, activeTab === t && styles.activeTabText]}>{t}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.content}>
                {activeTab === 'Orders' && (
                    <FlatList 
                        data={orders}
                        renderItem={renderOrder}
                        keyExtractor={i => i._id}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
                        ListEmptyComponent={<Text style={styles.empty}>No Pending Orders</Text>}
                    />
                )}
                
                {activeTab === 'Menu' && (
                    <>
                        <FlatList 
                            data={snacks}
                            renderItem={renderSnack}
                            keyExtractor={i => i._id}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
                            contentContainerStyle={{ paddingBottom: 80 }}
                        />
                        <TouchableOpacity style={styles.fab} onPress={openAddModal}>
                            <Feather name="plus" size={24} color="#fff" />
                        </TouchableOpacity>
                    </>
                )}

                {activeTab === 'Categories' && (
                    <View style={{ flex: 1 }}>
                        <View style={styles.addCatRow}>
                            <TextInput 
                                style={styles.catInput} 
                                placeholder="New Category Name" 
                                value={newCategoryName}
                                onChangeText={setNewCategoryName}
                            />
                            <TouchableOpacity style={styles.addCatBtn} onPress={handleAddCategory}>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList 
                            data={categories}
                            renderItem={renderCategory}
                            keyExtractor={i => i._id}
                        />
                    </View>
                )}
            </View>

            {/* --- NEW IMPROVED MODAL --- */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <ScrollView contentContainerStyle={styles.modalScroll}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>{isEditing ? 'Edit Item' : 'Add New Item'}</Text>
                            
                            {/* Product Name */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Product Name <Text style={{color:'red'}}>*</Text></Text>
                                <TextInput 
                                    style={styles.input} 
                                    placeholder="e.g. Besan Laddu" 
                                    value={formName} 
                                    onChangeText={setFormName} 
                                />
                            </View>

                            {/* Price & Stock Row */}
                            <View style={styles.row}>
                                <View style={[styles.formGroup, {flex: 1, marginRight: 10}]}>
                                    <Text style={styles.label}>Price (₹) <Text style={{color:'red'}}>*</Text></Text>
                                    <TextInput 
                                        style={styles.input} 
                                        placeholder="199" 
                                        keyboardType="numeric" 
                                        value={formPrice} 
                                        onChangeText={setFormPrice} 
                                    />
                                </View>
                                <View style={[styles.formGroup, {flex: 1}]}>
                                    <Text style={styles.label}>Stock Quantity</Text>
                                    <TextInput 
                                        style={styles.input} 
                                        placeholder="10" 
                                        keyboardType="numeric" 
                                        value={formStock} 
                                        onChangeText={setFormStock} 
                                    />
                                    <Text style={styles.helperText}>How many available?</Text>
                                </View>
                            </View>

                            {/* Description - User Friendly Text Area */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Description</Text>
                                <Text style={styles.helperText}>Mention weight, taste, or ingredients (e.g., "500g box, pure ghee")</Text>
                                <TextInput 
                                    style={[styles.input, styles.textArea]} 
                                    placeholder="Type details here..." 
                                    value={formDesc} 
                                    onChangeText={setFormDesc} 
                                    multiline 
                                    numberOfLines={4}
                                    textAlignVertical="top" 
                                />
                            </View>
                            
                            {/* Category Select */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Category <Text style={{color:'red'}}>*</Text></Text>
                                <ScrollView horizontal style={{ marginVertical: 5, maxHeight: 45 }} showsHorizontalScrollIndicator={false}>
                                    {categories.map(cat => (
                                        <TouchableOpacity 
                                            key={cat._id} 
                                            style={[styles.chip, formCategory === cat.name && styles.chipActive]}
                                            onPress={() => setFormCategory(cat.name)}
                                        >
                                            <Text style={formCategory === cat.name ? { color: '#000', fontWeight: 'bold' } : { color: '#555' }}>
                                                {cat.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                {formCategory === '' && <Text style={{color:'red', fontSize:12}}>Please select one</Text>}
                            </View>

                            {/* Image Picker */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Product Image</Text>
                                <TouchableOpacity style={styles.imgBtn} onPress={pickImages}>
                                    <Feather name="image" size={24} color="#666" />
                                    <Text style={{ marginLeft: 10, fontSize: 16, color: '#333' }}>
                                        {selectedImages.length > 0 ? `${selectedImages.length} Image Selected` : 'Select from Gallery'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Actions */}
                            <View style={styles.modalActions}>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.modalBtn, styles.cancelBtn]}>
                                    <Text style={styles.btnTextRaw}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSaveSnack} style={[styles.modalBtn, styles.saveBtn]}>
                                    <Text style={styles.btnTextBold}>Save Item</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f4' },
    tabs: { flexDirection: 'row', backgroundColor: '#fff', elevation: 2 },
    tab: { flex: 1, padding: 15, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
    activeTab: { borderBottomColor: '#FFD700' },
    tabText: { fontWeight: 'bold', color: '#888' },
    activeTabText: { color: '#000' },
    content: { flex: 1, padding: 15 },
    empty: { textAlign: 'center', marginTop: 50, color: '#999' },

    card: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10, alignItems: 'center', elevation: 2 },
    cardDisabled: { opacity: 0.6, backgroundColor: '#f9f9f9' },
    snackImg: { width: 60, height: 60, borderRadius: 8, marginRight: 15, backgroundColor: '#eee' },
    info: { flex: 1 },
    title: { fontWeight: 'bold', fontSize: 16 },
    sub: { color: '#666', fontSize: 12 },
    price: { color: 'green', fontWeight: 'bold' },
    toggleContainer: { alignItems: 'center', marginRight: 10 },
    toggleLabel: { fontSize: 10, marginBottom: 2, color: '#666' },
    actions: { flexDirection: 'row' },
    iconBtn: { padding: 8 },
    confirmBtn: { backgroundColor: '#28a745', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 5, marginLeft: 10 },
    fab: { position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFD700', justifyContent: 'center', alignItems: 'center', elevation: 5 },
    addCatRow: { flexDirection: 'row', marginBottom: 15 },
    catInput: { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 10, marginRight: 10, borderWidth: 1, borderColor: '#ddd' },
    addCatBtn: { backgroundColor: '#FFD700', padding: 10, borderRadius: 8, justifyContent: 'center' },
    
    // --- MODAL STYLES ---
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
    modalScroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', padding: 25, borderRadius: 15, elevation: 5 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
    
    formGroup: { marginBottom: 15 },
    row: { flexDirection: 'row', marginBottom: 5 },
    label: { marginBottom: 8, fontWeight: 'bold', color: '#333', fontSize: 15 },
    helperText: { fontSize: 12, color: '#888', marginTop: 4, marginBottom: 4 },
    
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#FAFAFA' },
    textArea: { height: 100, textAlignVertical: 'top' },
    
    chip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 25, backgroundColor: '#eee', marginRight: 8, borderWidth: 1, borderColor: '#ddd' },
    chipActive: { backgroundColor: '#FFD700', borderColor: '#DAA520', borderWidth: 2 },
    
    imgBtn: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#F0F0F0', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed' },
    
    modalActions: { flexDirection: 'row', marginTop: 10 },
    modalBtn: { flex: 1, padding: 15, alignItems: 'center', borderRadius: 8, marginHorizontal: 5 },
    cancelBtn: { backgroundColor: '#ccc' },
    saveBtn: { backgroundColor: '#FFD700' },
    btnTextRaw: { fontWeight: '600', color: '#333' },
    btnTextBold: { fontWeight: 'bold', color: '#000', fontSize: 16 }
});