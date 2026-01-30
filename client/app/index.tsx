import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, Text, Image, StyleSheet, TouchableOpacity, 
  FlatList, ScrollView, Dimensions, ActivityIndicator, Modal, Alert, RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { fetchSnacks, fetchCategories } from '../services/api';
import { Snack } from '../types';
import { getImageUrl } from '../utils/imageHelper';
import { Category } from '../services/api';
// --- CONFIG ---
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.65;
// Using placeholder until you fix your local logo file
const LOGO_IMAGE = require('../assets/images/logo_bg.png');

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); 
  
  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [allItems, setAllItems] = useState<Snack[]>([]);
  
  // Display State
  const [filteredItems, setFilteredItems] = useState<Snack[]>([]);
  const [heroItems, setHeroItems] = useState<Snack[]>([]);

  // UI State
  const [menuVisible, setMenuVisible] = useState(false); 

  // --- AUTO-REFRESH LOGIC ---
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    filterData();
  }, [selectedCategory, allItems]);

  const loadData = async () => {
    try {
      const [snackData, catData] = await Promise.all([fetchSnacks(), fetchCategories()]);
      setAllItems(snackData);
      setCategories([{ _id: 'all', name: 'All' }, ...catData]);
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setLoading(false);
      setRefreshing(false); // <--- Stop the spinner when done
    }
  };

  const onRefresh = () => {
      setRefreshing(true);
      loadData();
  };

  const filterData = () => {
    // ROBUST FILTERING: Only show items explicitly NOT hidden
    let items = allItems.filter(item => {
        const status = String(item.isAvailable);
        return status !== 'false'; 
    });

    if (selectedCategory !== 'All') {
        items = items.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(items);
    setHeroItems(items.slice(0, 2));
  };

  // --- ACTIONS ---

  const handleNotificationPress = () => {
      Alert.alert("Notifications", "You have no new notifications.");
  };

  const renderStockBadge = (stock: number) => {
      if (stock === 0) {
          return (
              <View style={[styles.badge, { backgroundColor: '#FF5252' }]}>
                  <Text style={styles.badgeText}>Sold Out</Text>
              </View>
          );
      }
      if (stock < 5) {
          return (
              <View style={[styles.badge, { backgroundColor: '#FFA726' }]}>
                  <Text style={styles.badgeText}>Only {stock} Left!</Text>
              </View>
          );
      }
      return null;
  };

  // --- RENDERERS ---

  const renderCategory = ({ item }: { item: Category }) => {
    const isActive = selectedCategory === item.name;
    return (
      <TouchableOpacity 
        onPress={() => setSelectedCategory(item.name)}
        style={styles.catItemContainer}
      >
        <Text style={[styles.catText, isActive && styles.catTextActive]}>
          {item.name}
        </Text>
        {isActive && <View style={styles.catDot} />}
      </TouchableOpacity>
    );
  };

  const renderHeroCard = ({ item, index }: { item: Snack, index: number }) => {
    const bgColor = index % 2 === 0 ? '#FFD700' : '#FF5252';
    const textColor = index % 2 === 0 ? '#000' : '#FFF';
    const imageUrl = getImageUrl(item.images);
    const isOutOfStock = item.stock === 0;

    return (
      <TouchableOpacity 
        activeOpacity={0.9}
        disabled={isOutOfStock}
        onPress={() => router.push({
            pathname: "/snack/[id]",
            params: { 
                id: item._id, 
                name: item.name, 
                price: item.price.toString(), 
                image: imageUrl, 
                description: item.description 
            }
        })}
        style={[styles.heroCard, { backgroundColor: isOutOfStock ? '#E0E0E0' : bgColor }]}
      >
        <View style={styles.heroHeader}>
          <Text style={[styles.heroName, { color: isOutOfStock ? '#999' : textColor }]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={[styles.heroPrice, { color: isOutOfStock ? '#999' : textColor }]}>
            ₹{item.price}
          </Text>
        </View>

        <Image 
            source={{ uri: imageUrl }} 
            style={[styles.heroImage, isOutOfStock && { opacity: 0.5 }]} 
            resizeMode="contain" 
        />
        
        {renderStockBadge(item.stock || 0)}

        <View style={[styles.addToCartBtn, isOutOfStock && { backgroundColor: '#ccc' }]}>
          <Text style={styles.addToCartText}>
              {isOutOfStock ? 'Out of Stock' : 'Order Now'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMiniCard = ({ item }: { item: Snack }) => {
    const imageUrl = getImageUrl(item.images);
    const isOutOfStock = item.stock === 0;

    return (
        <TouchableOpacity 
          style={[styles.miniCard, isOutOfStock && { opacity: 0.7 }]}
          disabled={isOutOfStock}
          onPress={() => router.push({
            pathname: "/snack/[id]",
            params: { 
                id: item._id, 
                name: item.name, 
                price: item.price.toString(), 
                image: imageUrl, 
                description: item.description 
            }
          })}
        >
          <View style={styles.miniHeader}>
            <Text style={styles.miniName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.miniPrice}>₹{item.price}</Text>
          </View>
          
          <Image source={{ uri: imageUrl }} style={styles.miniImage} resizeMode="contain" />
          
          {renderStockBadge(item.stock || 0)}

          <View style={[styles.miniAddBtn, isOutOfStock && { backgroundColor: '#eee' }]}>
             <Feather name={isOutOfStock ? "slash" : "plus"} size={14} color="black" />
          </View>
        </TouchableOpacity>
     );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FFD700"/></View>;

  return (
    <SafeAreaView style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.iconBtn}>
          <Feather name="menu" size={24} color="black" />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
            <Image source={LOGO_IMAGE} style={styles.logo} resizeMode="contain" />
        </View>

        <TouchableOpacity onPress={handleNotificationPress} style={styles.iconBtn}>
             <Feather name="bell" size={24} color="black" />
             <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      {/* MAIN LAYOUT */}
      <View style={styles.splitLayout}>
        
        {/* LEFT SIDEBAR */}
        <View style={styles.leftSidebar}>
          <FlatList 
            data={categories}
            renderItem={renderCategory}
            keyExtractor={item => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.catListContent}
          />
        </View>

        {/* RIGHT CONTENT (With Refresh Control) */}
        <ScrollView 
            style={styles.rightContent} 
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FFD700']} />
            }
        >
          {filteredItems.length === 0 ? (
             <View style={styles.center}>
                <Text style={{ marginTop: 50, color: '#999' }}>No items found.</Text>
             </View>
          ) : (
             <>
                {/* Hero Carousel */}
                <FlatList 
                    data={heroItems}
                    horizontal
                    renderItem={renderHeroCard}
                    keyExtractor={item => item._id}
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={CARD_WIDTH + 20}
                    decelerationRate="fast"
                    contentContainerStyle={{ paddingRight: 20 }}
                />

                {/* Grid */}
                <View style={styles.miniGrid}>
                    {filteredItems.slice(2).map(item => (
                        <View key={item._id} style={{ width: '48%', marginBottom: 15 }}>
                            {renderMiniCard({ item })}
                        </View>
                    ))}
                </View>
             </>
          )}
          
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => router.push('/admin/login')}>
          <Feather name="user" size={24} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.push('/search')}>
          <Feather name="search" size={24} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.cartPill} onPress={() => router.push('/cart')}>
          <Text style={styles.cartText}>Cart</Text>
          <Feather name="shopping-cart" size={18} color="#333" />
        </TouchableOpacity>
      </View>

      {/* HAMBURGER MENU */}
      <Modal animationType="fade" transparent={true} visible={menuVisible} onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
            <View style={styles.menuContainer}>
                <Text style={styles.menuTitle}>Menu</Text>
                
                <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); router.push('/admin/login'); }}>
                    <Feather name="user" size={20} color="#333" />
                    <Text style={styles.menuText}>Admin Login</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); router.push('/cart'); }}>
                    <Feather name="shopping-cart" size={20} color="#333" />
                    <Text style={styles.menuText}>My Cart</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); router.push('/search'); }}>
                    <Feather name="search" size={20} color="#333" />
                    <Text style={styles.menuText}>Search</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.closeMenuBtn} onPress={() => setMenuVisible(false)}>
                    <Text style={{color: '#fff', fontWeight: 'bold'}}>Close</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
      paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#FAFAFA', zIndex: 10
  },
  logoContainer: { flex: 1, alignItems: 'center' },
  logo: { width: 150, height: 60 },
  iconBtn: { padding: 5 },
  notifDot: { position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFD700', borderWidth: 1, borderColor: '#FFF' },
  splitLayout: { flex: 1, flexDirection: 'row', marginTop: 10 },
  leftSidebar: { width: 60, alignItems: 'center' },
  rightContent: { flex: 1, paddingLeft: 10 },
  catListContent: { paddingVertical: 20, gap: 30 },
  catItemContainer: { height: 100, justifyContent: 'center', alignItems: 'center', width: 60, marginBottom: 20 },
  catText: { fontSize: 14, color: '#AAA', fontWeight: '600', transform: [{ rotate: '-90deg' }], width: 120, textAlign: 'center' },
  catTextActive: { color: '#F4C430', fontWeight: 'bold' },
  catDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F4C430', marginTop: 15 },
  heroCard: { width: CARD_WIDTH, height: 340, borderRadius: 30, padding: 20, marginRight: 20, justifyContent: 'space-between' },
  heroHeader: { marginBottom: 10 },
  heroName: { fontSize: 22, fontWeight: 'bold', width: '100%' },
  heroPrice: { fontSize: 20, fontWeight: 'bold' },
  heroImage: { width: '100%', height: 160, alignSelf: 'center' },
  addToCartBtn: { backgroundColor: '#FFF', paddingVertical: 12, borderRadius: 20, alignItems: 'center' },
  addToCartText: { fontWeight: 'bold', color: '#000' },
  miniGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20, paddingRight: 20 },
  miniCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 15, alignItems: 'center', width: '100%', elevation: 2 },
  miniHeader: { alignSelf: 'flex-start', marginBottom: 5, width: '100%' },
  miniName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  miniPrice: { fontSize: 12, color: '#666', marginTop: 2 },
  miniImage: { width: 60, height: 60, marginVertical: 10 },
  miniAddBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#F4F4F4', borderTopLeftRadius: 15, borderBottomRightRadius: 15, padding: 10 },
  badge: { position: 'absolute', top: 15, right: 15, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, zIndex: 10 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  bottomNav: { 
    position: 'absolute', bottom: 30, left: 20, right: 20, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: '#FFF', borderRadius: 30, paddingVertical: 10, paddingHorizontal: 20, 
    elevation: 10, shadowColor: '#000', shadowOffset: {width:0, height:5}, shadowOpacity: 0.1, shadowRadius: 10 
  },
  cartPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFD700', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25 },
  cartText: { marginRight: 10, fontWeight: 'bold', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  menuContainer: { width: '70%', height: '100%', backgroundColor: '#FFF', padding: 20, paddingTop: 60, elevation: 5 },
  menuTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuText: { fontSize: 18, marginLeft: 15, color: '#333' },
  closeMenuBtn: { marginTop: 40, backgroundColor: '#FF5252', padding: 15, borderRadius: 10, alignItems: 'center' }
});