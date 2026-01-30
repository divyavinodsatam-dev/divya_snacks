import { Stack } from 'expo-router';
import { CartProvider } from '../context/CartContext';

export default function Layout() {
  return (
    <CartProvider>
      <Stack 
        screenOptions={{ 
          headerStyle: { backgroundColor: '#f4511e' }, 
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      >
        {/* Hiding header for Home so we can use our custom UI */}
        <Stack.Screen 
          name="index" 
          options={{ title: 'Our Menu', headerShown: false }} 
        />
        <Stack.Screen 
          name="snack/[id]" 
          options={{ title: 'Details' }} 
        />
        <Stack.Screen 
          name="cart" 
          options={{ title: 'Your Cart' }} 
        />
        <Stack.Screen 
          name="checkout" 
          options={{ title: 'Secure Checkout' }} 
        />
        <Stack.Screen 
          name="search" 
          options={{ title: 'Search', headerShown: false }} 
        />
        <Stack.Screen 
          name="admin/login" 
          options={{ title: 'Admin Login' }} 
        />
        <Stack.Screen 
          name="admin/dashboard" 
          options={{ title: 'Dashboard' }} 
        />
      </Stack>
    </CartProvider>
  );
}