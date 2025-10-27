// cartContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type CartItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
  stock: number;
};

type CartContextType = {
  cart: Record<number, CartItem>;
  addToCart: (item: CartItem) => boolean; // Return boolean for success/failure
  updateQuantity: (id: number, delta: number) => boolean; // Return boolean for success/failure
  removeFromCart: (id: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<number, CartItem>>({});

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

    loadCart();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'cart') {
        loadCart();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

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

  const addToCart = (item: CartItem): boolean => {
    if (item.quantity <= 0 || item.quantity > item.stock) {
      console.log('Invalid addToCart attempt:', item);
      return false;
    }
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[item.id]) {
        const newQuantity = newCart[item.id].quantity + item.quantity;
        if (newQuantity > item.stock) {
          console.log('Stock limit reached:', item);
          return prev;
        }
        newCart[item.id] = {
          ...newCart[item.id],
          quantity: newQuantity,
        };
      } else {
        newCart[item.id] = { ...item };
      }
      console.log('Cart updated:', newCart);
      return newCart;
    });
    return true;
  };

  const updateQuantity = (id: number, delta: number): boolean => {
    let success = false;
    setCart((prev) => {
      const newCart = { ...prev };
      const item = newCart[id];
      if (!item) {
        console.log('Item not found for update:', id);
        return newCart;
      }
      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) {
        delete newCart[id];
        success = true;
        return newCart;
      }
      if (newQuantity > item.stock) {
        console.log('Stock limit reached for update:', item);
        return prev;
      }
      newCart[id] = { ...item, quantity: newQuantity };
      success = true;
      console.log('Cart updated:', newCart);
      return newCart;
    });
    return success;
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const newCart = { ...prev };
      delete newCart[id];
      console.log('Item removed, new cart:', newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
    console.log('Cart cleared');
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}>
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