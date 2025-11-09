// src/app/components/cartContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type CartItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
  stock: number;
  cover_image?: string;
  selectedOptions?: {
    ram?: string;
    storage?: string;
    color?: string;
  };
};

type CartContextType = {
  cart: Record<number, CartItem>;
  addToCart: (item: CartItem) => boolean;
  updateQuantity: (id: number, delta: number) => boolean;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  deviceId: string; // ← EXPOSE TO FRONTEND
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<number, CartItem>>({});
  const [deviceId, setDeviceId] = useState<string>('');

  // === 1. LOAD CART + GENERATE DEVICE ID ===
  useEffect(() => {
    const loadCart = () => {
      try {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          const validCart: Record<number, CartItem> = {};
          Object.entries(parsedCart).forEach(([id, item]: [string, any]) => {
            if (
              item.id &&
              item.quantity > 0 &&
              item.title &&
              typeof item.price === 'number' &&
              !isNaN(item.price) &&
              item.stock >= item.quantity
            ) {
              validCart[Number(id)] = {
                id: Number(item.id),
                title: String(item.title),
                price: Number(item.price),
                quantity: Math.max(1, Math.min(Number(item.quantity), Number(item.stock) || 999)),
                stock: Number(item.stock) || 999,
                cover_image: item.cover_image,
              };
            }
          });
          setCart(validCart);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        localStorage.removeItem('cart');
        setCart({});
      }
    };

    const generateDeviceId = () => {
      let id = localStorage.getItem('device_id');
      if (!id) {
        id = `DEV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('device_id', id);
      }
      setDeviceId(id);
    };

    loadCart();
    generateDeviceId();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'cart') loadCart();
      if (event.key === 'device_id') setDeviceId(event.newValue || '');
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // === 2. SAVE CART ON CHANGE ===
  useEffect(() => {
    try {
      if (Object.keys(cart).length > 0) {
        localStorage.setItem('cart', JSON.stringify(cart));
      } else {
        localStorage.removeItem('cart');
      }
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [cart]);

  // === 3. CART ACTIONS ===
  const addToCart = (item: CartItem): boolean => {
    if (item.quantity <= 0 || item.quantity > item.stock) return false;

    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[item.id]) {
        const newQuantity = newCart[item.id].quantity + item.quantity;
        if (newQuantity > item.stock) return prev;
        newCart[item.id] = { ...newCart[item.id], quantity: newQuantity };
      } else {
        newCart[item.id] = { ...item };
      }
      return newCart;
    });
    return true;
  };

  const updateQuantity = (id: number, delta: number): boolean => {
    let success = false;
    setCart((prev) => {
      const newCart = { ...prev };
      const item = newCart[id];
      if (!item) return newCart;

      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) {
        delete newCart[id];
        success = true;
        return newCart;
      }
      if (newQuantity > item.stock) return prev;

      newCart[id] = { ...item, quantity: newQuantity };
      success = true;
      return newCart;
    });
    return success;
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const newCart = { ...prev };
      delete newCart[id];
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        deviceId, // ← EXPOSE IT
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}