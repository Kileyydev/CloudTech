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
  Button
} from '@mui/material';
import { Favorite, ShoppingCart } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<Record<string, any>>({});
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const storedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlist(new Set(storedWishlist));

    const storedCart = JSON.parse(localStorage.getItem('cart') || '{}');
    setCart(storedCart);
  }, []);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(Array.from(wishlist)));
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [wishlist, cart]);

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

  const handleRemoveWishlist = (id: string) => {
    setWishlist(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleAddToCart = (product: any) => {
    setCart(prev => {
      const newCart = { ...prev };
      const key = String(product.id);
      if (!newCart[key]) newCart[key] = { ...product, quantity: 1 };
      return newCart;
    });
    alert('Added to cart!');
  };

  const wishlistProducts = products.filter(p => wishlist.has(String(p.id)) && p.stock > 0);

  if (wishlistProducts.length === 0) return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Your Wishlist is Empty</Typography>
      <Button variant="contained" onClick={() => router.push('/')}>Browse Products</Button>
    </Box>
  );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Your Wishlist</Typography>
      <Grid container spacing={2}>
        {wishlistProducts.map(product => (
          <Grid item xs={12} md={4} key={product.id}>
            <Card sx={{ p: 2 }}>
              <CardMedia
                component="img"
                height={150}
                image={product.cover_image || '/images/placeholder.png'}
                alt={product.title}
                sx={{ objectFit: 'contain' }}
              />
              <CardContent>
                <Typography variant="h6">{product.title}</Typography>
                <Typography>${product.price}</Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button variant="contained" onClick={() => handleAddToCart(product)}>
                    Add to Cart
                  </Button>
                  <IconButton onClick={() => handleRemoveWishlist(String(product.id))}>
                    <Favorite sx={{ color: 'red' }} />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
