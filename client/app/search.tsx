import React, { useEffect, useState } from 'react';
import { 
    View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, 
    Image, ActivityIndicator, Dimensions 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchSnacks, fetchCategories } from '../services/api';
import { Snack } from '../types';
import { getImageUrl } from '../utils/imageHelper';
import { Category } from '../services/api';


const { width } = Dimensions.get('window');

export default function SearchScreen() {
    const router = useRouter();
    
    // Data State
    const [allItems, setAllItems] = useState<Snack[]>([]);
    const [filteredItems, setFilteredItems] = useState<Snack[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Search State
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [priceSort, setPriceSort] = useState<'asc' | 'desc' | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        handleSearch();
    }, [searchText, selectedCategory, priceSort, allItems]);

    const loadData = async () => {
        try {
            const [snackData, catData] = await Promise.all([fetchSnacks(), fetchCategories()]);
            setAllItems(snackData);
            setFilteredItems(snackData);
            setCategories(catData);
        } catch (e) {
            console.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        let results = allItems;

        // 1. Filter by Text (Name OR Category matches)
        if (searchText) {
            const query = searchText.toLowerCase();
            results = results.filter(item => 
                item.name.toLowerCase().includes(query) || 
                (item.category && item.category.toLowerCase().includes(query))
            );
        }

        // 2. Filter by Category Chip
        if (selectedCategory) {
            results = results.filter(item => item.category === selectedCategory);
        }

        // 3. Sort by Price
        if (priceSort === 'asc') {
            results = [...results].sort((a, b) => a.price - b.price);
        } else if (priceSort === 'desc') {
            results = [...results].sort((a, b) => b.price - a.price);
        }

        setFilteredItems(results);
    };

    const togglePriceSort = () => {
        if (priceSort === null) setPriceSort('asc');
        else if (priceSort === 'asc') setPriceSort('desc');
        else setPriceSort(null);
    };

    const renderItem = ({ item }: { item: Snack }) => (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push({
                pathname: "/snack/[id]",
                params: { 
                    id: item._id, 
                    name: item.name, 
                    price: item.price.toString(), 
                    image: getImageUrl(item.images), 
                    description: item.description 
                }
            })}
        >
            <Image source={{ uri: getImageUrl(item.images) }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.category}>{item.category || 'Snack'}</Text>
                <Text style={styles.price}>₹{item.price}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{padding: 5}}>
                    <Feather name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Search</Text>
                <View style={{width: 24}} /> 
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput 
                    style={styles.input} 
                    placeholder="Search name, category..." 
                    value={searchText}
                    onChangeText={setSearchText}
                    autoFocus
                />
                {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText('')}>
                        <Feather name="x-circle" size={18} color="#999" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filters Row */}
            <View style={styles.filterRow}>
                {/* Price Sort Button */}
                <TouchableOpacity 
                    style={[styles.chip, priceSort !== null && styles.chipActive]} 
                    onPress={togglePriceSort}
                >
                    <Feather 
                        name={priceSort === 'desc' ? "arrow-down" : "arrow-up"} 
                        size={14} 
                        color={priceSort !== null ? "#000" : "#555"} 
                    />
                    <Text style={[styles.chipText, priceSort !== null && styles.chipTextActive]}>
                        Price
                    </Text>
                </TouchableOpacity>

                {/* Category Chips */}
                <FlatList 
                    horizontal
                    data={categories}
                    keyExtractor={item => item._id}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={[styles.chip, selectedCategory === item.name && styles.chipActive]}
                            onPress={() => setSelectedCategory(
                                selectedCategory === item.name ? null : item.name
                            )}
                        >
                            <Text style={[styles.chipText, selectedCategory === item.name && styles.chipTextActive]}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Results List */}
            {loading ? (
                <ActivityIndicator size="large" color="#FFD700" style={{marginTop: 50}} />
            ) : (
                <FlatList 
                    data={filteredItems}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 15 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Feather name="frown" size={40} color="#ccc" />
                            <Text style={styles.emptyText}>No items found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, backgroundColor: '#fff' },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 15, paddingHorizontal: 15, borderRadius: 10, height: 50, borderWidth: 1, borderColor: '#eee', marginBottom: 10 },
    searchIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 16, height: '100%' },

    filterRow: { flexDirection: 'row', paddingHorizontal: 15, paddingBottom: 10, alignItems: 'center' },
    chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#ddd' },
    chipActive: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
    chipText: { fontSize: 14, color: '#555', marginLeft: 5 },
    chipTextActive: { color: '#000', fontWeight: 'bold' },

    card: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, marginBottom: 10, borderRadius: 12, alignItems: 'center', elevation: 2 },
    image: { width: 60, height: 60, borderRadius: 8, marginRight: 15, backgroundColor: '#f0f0f0' },
    info: { flex: 1 },
    name: { fontWeight: 'bold', fontSize: 16, color: '#333' },
    category: { fontSize: 12, color: '#888', marginBottom: 4 },
    price: { color: 'green', fontWeight: 'bold', fontSize: 14 },
    
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 10, color: '#999', fontSize: 16 }
});