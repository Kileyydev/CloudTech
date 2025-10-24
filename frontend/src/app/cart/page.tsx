'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Button,
  Divider
} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Record<string, any>>({});
  const [products, setProducts] = useState<any[]>([]);

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart') || '{}');
    setCart(storedCart);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch product info to get latest stock
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/products/');
        const data = await res.json();
        setProducts(data.results || data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const handleIncrease = (id: string) => {
    const product = products.find(p => p.id === Number(id));
    if (!product) return;

    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[id].quantity < product.stock) newCart[id].quantity += 1;
      else alert('Cannot exceed available stock!');
      return newCart;
    });
  };

  const handleDecrease = (id: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[id].quantity > 1) newCart[id].quantity -= 1;
      else delete newCart[id];
      return newCart;
    });
  };

  const handleRemove = (id: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[id];
      return newCart;
    });
  };

  const handleCheckout = () => {
    alert('Checkout feature coming soon!');
  };

  const totalPrice = Object.values(cart).reduce((acc, item: any) => acc + item.price * item.quantity, 0);

  if (Object.keys(cart).length === 0) return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Your Cart is Empty</Typography>
      <Button variant="contained" color="primary" onClick={() => router.push('/')}>
        Continue Shopping
      </Button>
    </Box>
  );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Your Cart</Typography>
      <Grid container spacing={2}>
        {Object.values(cart).map((item: any) => {
          const product = products.find(p => p.id === item.id);
          if (!product || product.stock === 0) return null; // hide out-of-stock items
          return (
            <Grid item xs={12} md={6} key={item.id}>
              <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                <CardMedia
                  component="img"
                  image={product.cover_image || '/images/placeholder.png'}
                  alt={item.title}
                  sx={{ width: 120, height: 120, objectFit: 'contain', mr: 2 }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{item.title}</Typography>
                  <Typography>Price: ${item.price}</Typography>
                  <Typography>Stock: {product.stock}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <IconButton onClick={() => handleDecrease(String(item.id))}><Remove /></IconButton>
                    <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                    <IconButton onClick={() => handleIncrease(String(item.id))}><Add /></IconButton>
                    <IconButton onClick={() => handleRemove(String(item.id))}><Delete /></IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Total: ${totalPrice.toFixed(2)}</Typography>
        <Button variant="contained" color="primary" onClick={handleCheckout}>
          Checkout
        </Button>
      </Box>
    </Box>
  );
}
