'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Button,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Favorite, ShoppingCart, Add, Remove } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/components/cartContext'; // Ensure cartContext is set up in your project

// Define the Product interface
interface Product {
  id: number;
  title: string;
  price: number;
  discount?: number;
  cover_image?: string | null;
  description?: string;
  stock: number; // Added to match ProductSection
  images?: string[]; // Added for potential multiple images
}

const categorySlug = 'gaming';

const GamingAccessoriesSection = () => {
  const theme = useTheme();
  const router = useRouter();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { cart, addToCart, updateQuantity } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [currentIndexes, setCurrentIndexes] = useState<Record<number, number>>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState(true);

  const API_BASE = `http://localhost:8000/api/products/?category=${categorySlug}`;

  // Fetch gaming products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(API_BASE);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.results;
          const indexes: Record<number, number> = {};
          list.forEach((p: Product) => (indexes[p.id] = 0));
          setCurrentIndexes(indexes);
          setProducts(list);
        } else {
          console.error(`Failed to fetch ${categorySlug} products`, await res.text());
          setProducts([]);
          setSnackbar({ open: true, message: `Failed to load ${categorySlug} products`, severity: 'error' });
        }
      } catch (err) {
        console.error(`Error fetching ${categorySlug} products`, err);
        setProducts([]);
        setSnackbar({ open: true, message: `Failed to load ${categorySlug} products`, severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [API_BASE]);

  // Load wishlist from localStorage
  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem('wishlist');
      if (storedWishlist) {
        setWishlist(new Set(JSON.parse(storedWishlist)));
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleWishlistToggle = (id: number) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      localStorage.setItem('wishlist', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) {
      showSnackbar('This product is out of stock', 'error');
      return;
    }

    const cartItem = cart[product.id];
    if (cartItem && cartItem.quantity >= product.stock) {
      showSnackbar(`Only ${product.stock} items available in stock`, 'error');
      return;
    }

    const success = addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      stock: product.stock,
    });

    if (success) {
      showSnackbar(cartItem ? `Added another ${product.title} to cart` : `${product.title} added to cart!`);
    } else {
      showSnackbar('Failed to add to cart', 'error');
    }
  };

  const handleDecreaseQuantity = (id: number) => {
    const cartItem = cart[id];
    if (!cartItem) return;

    const success = updateQuantity(id, -1);
    if (success && cartItem.quantity <= 1) {
      showSnackbar(`${cartItem.title} removed from cart`);
    } else if (success) {
      showSnackbar(`Updated quantity for ${cartItem.title}`);
    }
  };

  const handleViewCart = () => {
    if (Object.keys(cart).length === 0) {
      showSnackbar('Your cart is empty', 'error');
      return;
    }
    router.push('/cart');
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const renderCard = (product: Product) => {
    const images = [product.cover_image, ...(product.images || [])].filter(Boolean).slice(0, 3);
    const currentIndex = currentIndexes[product.id] || 0;
    const cartItem = cart[product.id];

    const imageSrc = images[currentIndex] && typeof images[currentIndex] === 'string'
      ? images[currentIndex].startsWith('http')
        ? images[currentIndex]
        : `http://localhost:8000${images[currentIndex]}`
      : '/images/fallback.jpg';

    return (
      <Card
        key={product.id}
        sx={{
          width: 220,
          height: 360,
          flex: '0 0 220px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          borderRadius: 0,
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#fff',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            backgroundColor: 'rgba(255,255,255,0.95)',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderRadius: '50%',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleWishlistToggle(product.id);
          }}
        >
          <Favorite
            sx={{
              color: wishlist.has(product.id) ? '#e91e63' : '#888',
              fontSize: 18,
            }}
          />
        </Box>

        <Box
          sx={{
            width: 220,
            height: 180,
            cursor: 'pointer',
            overflow: 'hidden',
          }}
          onClick={() => router.push(`/products/${product.id}`)}
        >
          <CardMedia
            component="img"
            image={imageSrc}
            alt={product.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {product.stock < 5 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                backgroundColor: 'rgba(0,0,0,0.75)',
                color: '#fff',
                padding: '4px 8px',
                fontSize: '0.8rem',
                fontWeight: 500,
              }}
            >
              Only {product.stock} left!
            </Box>
          )}
        </Box>

        <CardContent
          sx={{
            flexGrow: 1,
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: 180,
          }}
        >
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: '#222',
                fontSize: '1rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {product.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#666',
                fontSize: '0.85rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mt: 0.5,
              }}
            >
              {product.description || 'No description available'}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#222',
                fontSize: '1rem',
                mt: 1,
              }}
            >
              KES {product.price.toLocaleString()}
              {product.discount && (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ ml: 1, display: 'inline', fontSize: '0.85rem' }}
                >
                  ({product.discount}% off)
                </Typography>
              )}
            </Typography>
          </Box>

          {cartItem ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1.5, gap: 1.5 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDecreaseQuantity(product.id);
                }}
                sx={{
                  color: '#e91e63',
                  border: '1px solid #e91e63',
                  '&:hover': { backgroundColor: 'rgba(233, 30, 99, 0.1)' },
                  width: 32,
                  height: 32,
                }}
              >
                <Remove sx={{ fontSize: 16 }} />
              </IconButton>
              <Typography sx={{ fontWeight: 600, fontSize: '1rem', minWidth: 24, textAlign: 'center' }}>
                {cartItem.quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
                disabled={cartItem.quantity >= product.stock}
                sx={{
                  color: '#e91e63',
                  border: '1px solid #e91e63',
                  '&:hover': { backgroundColor: 'rgba(233, 30, 99, 0.1)' },
                  '&[disabled]': { color: '#ccc', borderColor: '#ccc' },
                  width: 32,
                  height: 32,
                }}
              >
                <Add sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ) : (
            <Button
              variant="contained"
              startIcon={<ShoppingCart sx={{ fontSize: 16 }} />}
              fullWidth
              sx={{
                backgroundColor: '#e91e63',
                color: '#fff',
                textTransform: 'none',
                fontSize: '0.9rem',
                mt: 1.5,
                py: 0.75,
                borderRadius: 0,
                '&:hover': { backgroundColor: '#c2185b' },
                '&:disabled': { backgroundColor: '#ccc' },
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
              disabled={product.stock === 0}
            >
              Add to Cart
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, background: 'linear-gradient(180deg, #f5f5f5 40%, #fff 100%)' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#222', fontSize: '1.5rem' }}>
          Gaming Accessories
        </Typography>
        <Button
          variant="contained"
          startIcon={<ShoppingCart sx={{ fontSize: 16 }} />}
          onClick={handleViewCart}
          sx={{
            backgroundColor: '#e91e63',
            color: '#fff',
            textTransform: 'none',
            fontSize: '0.9rem',
            py: 0.75,
            px: 2,
            borderRadius: 0,
            '&:hover': { backgroundColor: '#c2185b' },
            '&:disabled': { backgroundColor: '#ccc' },
          }}
          disabled={getCartItemCount() === 0}
        >
          View Cart ({getCartItemCount()})
        </Button>
      </Box>

      <Box
        sx={{
          maxWidth: '1200px',
          mx: 'auto',
          ...(isSmallScreen
            ? {
                display: 'flex',
                flexWrap: 'nowrap',
                overflowX: 'auto',
                gap: 2,
                pb: 2,
                scrollSnapType: 'x mandatory',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                '& > *': {
                  scrollSnapAlign: 'start',
                },
              }
            : {
                display: 'grid',
                gridTemplateColumns: {
                  md: 'repeat(4, minmax(220px, 1fr))',
                  lg: 'repeat(5, minmax(220px, 1fr))',
                },
                gap: { md: 3 },
              }),
        }}
      >
        {products.length === 0 ? (
          <Typography variant="body1" sx={{ width: '100%', textAlign: 'center', mt: 4 }}>
            No Gaming Accessories found.
          </Typography>
        ) : (
          products.filter((p) => p.stock > 0).map(renderCard)
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GamingAccessoriesSection;