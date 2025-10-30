'use client';

import { useState, useEffect, useRef } from 'react';
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
  Skeleton,
} from '@mui/material';
import { Favorite, ShoppingCart, Add, Remove } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/components/cartContext';

type ProductT = {
  id: number;
  title: string;
  price: number;
  description?: string;
  cover_image?: string | null;
  images?: string[];
  stock: number;
  discount?: number;
};

const CACHE_KEY = 'storage_accessories_cache';
const CACHE_TIME = 15 * 60 * 1000; // 15 minutes
const categorySlug = 'storage';
const API_BASE = `https://cloudtech-c4ft.onrender.com/api/products/?category=${categorySlug}`;

const StorageAccessoriesSection = () => {
  const theme = useTheme();
  const router = useRouter();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { cart, addToCart, updateQuantity } = useCart();
  const [products, setProducts] = useState<ProductT[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [currentIndexes, setCurrentIndexes] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const mounted = useRef(true);

  // Load from cache first
  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TIME) {
        setProducts(data);
        setLoading(false);
      }
    }
  }, []);

  // Fetch and cache
  useEffect(() => {
    mounted.current = true;
    const fetchProducts = async () => {
      try {
        const res = await fetch(API_BASE, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        const list = data.results || data;

        const indexes: Record<number, number> = {};
        list.forEach((p: ProductT) => (indexes[p.id] = 0));
        if (mounted.current) {
          setCurrentIndexes(indexes);
          setProducts(list);
          setLoading(false);
        }

        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: list, timestamp: Date.now() }));
      } catch (err) {
        console.error('Error fetching storage accessories:', err);
        if (mounted.current) {
          setSnackbar({ open: true, message: 'Failed to load storage accessories', severity: 'error' });
          setLoading(false);
        }
      }
    };
    fetchProducts();
    return () => {
      mounted.current = false;
    };
  }, []);

  // Load wishlist
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

  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const handleWishlistToggle = (id: number) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      localStorage.setItem('wishlist', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const handleAddToCart = (product: ProductT) => {
    if (product.stock === 0) return showSnackbar('This product is out of stock', 'error');
    const cartItem = cart[product.id];
    if (cartItem && cartItem.quantity >= product.stock) {
      return showSnackbar(`Only ${product.stock} items available in stock`, 'error');
    }
    const success = addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      stock: product.stock,
    });
    showSnackbar(success ? `${product.title} added to cart!` : 'Failed to add to cart', success ? 'success' : 'error');
  };

  const handleDecreaseQuantity = (id: number) => {
    const cartItem = cart[id];
    if (!cartItem) return;
    const success = updateQuantity(id, -1);
    if (success) showSnackbar(`${cartItem.title} quantity updated`);
  };

  const handleViewCart = () => {
    if (Object.keys(cart).length === 0) return showSnackbar('Your cart is empty', 'error');
    router.push('/cart');
  };

  const getCartItemCount = () => Object.values(cart).reduce((total, item) => total + (item.quantity || 0), 0);

  const renderSkeletonCard = (_: any, index: number) => (
    <Card key={index} sx={{ width: 220, height: 360, flex: '0 0 220px', backgroundColor: '#fff', borderRadius: 0 }}>
      <Skeleton variant="rectangular" width="100%" height={180} />
      <CardContent sx={{ p: 2 }}>
        <Skeleton width="80%" height={24} sx={{ mb: 1 }} />
        <Skeleton width="60%" height={20} sx={{ mb: 2 }} />
        <Skeleton width="40%" height={28} />
      </CardContent>
    </Card>
  );

  const renderCard = (product: ProductT) => {
    const images = [product.cover_image, ...(product.images || [])].filter(Boolean).slice(0, 3);
    const currentIndex = currentIndexes[product.id] || 0;
    const cartItem = cart[product.id];
    const imageSrc =
      images[currentIndex]?.startsWith('http')
        ? images[currentIndex]
        : `${process.env.NEXT_PUBLIC_API_BASE}${images[currentIndex]}` || '/images/fallback.jpg';

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
          '&:hover': { transform: 'translateY(-4px)' },
        }}
      >
        {/* Wishlist */}
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
          <Favorite sx={{ color: wishlist.has(product.id) ? '#e91e63' : '#888', fontSize: 18 }} />
        </Box>

        {/* Product Image */}
        <Box
          sx={{ width: 220, height: 180, cursor: 'pointer', overflow: 'hidden' }}
          onClick={() => router.push(`/products/${product.id}`)}
        >
          <CardMedia component="img" image={imageSrc} alt={product.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

        {/* Card Content */}
        <CardContent sx={{ flexGrow: 1, p: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 180 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#222', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#222', fontSize: '1rem' }}>
                KES {product.price.toLocaleString()}
              </Typography>
              {product.discount && (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ ml: 1, fontSize: '0.85rem', fontWeight: 500 }}
                >
                  ({product.discount}% off)
                </Typography>
              )}
            </Box>
          </Box>

          {cartItem ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1.5, gap: 1.5 }}>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDecreaseQuantity(product.id); }}
                sx={{ color: '#e91e63', border: '1px solid #e91e63', '&:hover': { backgroundColor: 'rgba(233,30,99,0.1)' }, width: 32, height: 32 }}>
                <Remove sx={{ fontSize: 16 }} />
              </IconButton>
              <Typography sx={{ fontWeight: 600, fontSize: '1rem', minWidth: 24, textAlign: 'center' }}>{cartItem.quantity}</Typography>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                disabled={cartItem.quantity >= product.stock}
                sx={{ color: '#e91e63', border: '1px solid #e91e63', '&:hover': { backgroundColor: 'rgba(233,30,99,0.1)' }, '&[disabled]': { color: '#ccc', borderColor: '#ccc' }, width: 32, height: 32 }}>
                <Add sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ) : (
            <Button variant="contained" startIcon={<ShoppingCart sx={{ fontSize: 16 }} />} fullWidth
              sx={{ backgroundColor: '#e91e63', color: '#fff', textTransform: 'none', fontSize: '0.9rem', mt: 1.5, py: 0.75, borderRadius: 0, '&:hover': { backgroundColor: '#c2185b' }, '&:disabled': { backgroundColor: '#ccc' } }}
              onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }} disabled={product.stock === 0}>
              Add to Cart
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: '#fff' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#222', fontSize: '1.5rem' }}>
          Storage Accessories
        </Typography>
        <Button variant="contained" startIcon={<ShoppingCart sx={{ fontSize: 16 }} />} onClick={handleViewCart}
          sx={{ backgroundColor: '#e91e63', color: '#fff', textTransform: 'none', fontSize: '0.9rem', py: 0.75, px: 2, borderRadius: 0, '&:hover': { backgroundColor: '#c2185b' } }}
          disabled={getCartItemCount() === 0}>
          View Cart ({getCartItemCount()})
        </Button>
      </Box>

      {/* Product Grid */}
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
                '&::-webkit-scrollbar': { display: 'none' },
              }
            : {
                display: 'grid',
                gridTemplateColumns: { md: 'repeat(4, minmax(220px, 1fr))', lg: 'repeat(5, minmax(220px, 1fr))' },
                gap: 3,
              }),
        }}
      >
        {loading
          ? Array.from({ length: 8 }).map(renderSkeletonCard)
          : products.filter((p) => p.stock > 0).map(renderCard)}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StorageAccessoriesSection;