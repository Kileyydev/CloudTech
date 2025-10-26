'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Button,
} from '@mui/material';
import { Favorite, ShoppingCart } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { CardMediaProps } from '@mui/material/CardMedia';

// Define interface for CardMedia to support component prop
interface CustomCardMediaProps extends CardMediaProps {
  component?: 'img';
  image?: string;
  alt?: string;
}

// Define interface for Product
interface Product {
  id: number;
  title: string;
  price: number;
  cover_image?: string;
  stock: number;
}

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<Record<string, Product & { quantity: number }>>({});
  const [products, setProducts] = useState<Product[]>([]);

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
    setWishlist((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const newCart = { ...prev };
      const key = String(product.id);
      if (!newCart[key]) newCart[key] = { ...product, quantity: 1 };
      return newCart;
    });
    alert('Added to cart!');
  };

  const wishlistProducts = products.filter((p) => wishlist.has(String(p.id)) && p.stock > 0);

  if (wishlistProducts.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4">Your Wishlist is Empty</Typography>
        <Button variant="contained" onClick={() => router.push('/')}>
          Browse Products
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Your Wishlist
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2, // Matches original Grid spacing={2}
          '& > *': {
            flex: {
              xs: '1 1 100%', // Full width on xs (xs={12})
              md: '1 1 calc(33.33% - 16px)', // 3 columns on md (md={4})
            },
            minWidth: 0,
          },
        }}
      >
        {wishlistProducts.map((product) => (
          <Card key={product.id} sx={{ p: 2 }}>
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
        ))}
      </Box>
    </Box>
  );
}