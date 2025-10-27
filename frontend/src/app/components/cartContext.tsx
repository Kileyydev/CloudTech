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
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: number, delta: number) => void;
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
              !isNaN(item.price)
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
    window.addEventListener('storage', loadCart);
    return () => window.removeEventListener('storage', loadCart);
  }, []);

  useEffect(() => {
    try {
      if (Object.keys(cart).length > 0) {
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('storage'));
      } else {
        localStorage.removeItem('cart');
      }
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[item.id]) {
        newCart[item.id].quantity = Math.min(
          newCart[item.id].quantity + item.quantity,
          item.stock
        );
      } else {
        newCart[item.id] = { ...item };
      }
      return newCart;
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) => {
      const newCart = { ...prev };
      const item = newCart[id];
      if (!item) return newCart;
      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) {
        delete newCart[id];
        return newCart;
      }
      if (newQuantity > item.stock) {
        return prev;
      }
      item.quantity = newQuantity;
      return newCart;
    });
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