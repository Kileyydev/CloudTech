// src/app/samsung/components/ProductCategorySection.tsx
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
  images?: (string | null)[];
  stock: number;
  discount?: number;
};

const CACHE_KEY = 'samsung_products_cache';
const CACHE_TIME = 15 * 60 * 1000;
const API_BASE = 'https://cloudtech-c4ft.onrender.com/api/products/?category=samsung';
const MEDIA_BASE = 'https://cloudtech-c4ft.onrender.com';

const SamsungProductsSection = () => {
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

  // Load from cache
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

  // Fetch products
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
        console.error('Error fetching Samsung products:', err);
        if (mounted.current) {
          setSnackbar({ open: true, message: 'Failed to load Samsung products', severity: 'error' });
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
      const stored = localStorage.getItem('wishlist');
      if (stored) setWishlist(new Set(JSON.parse(stored)));
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
    <Card key={index} sx={{ width: 220, height: 360, flex: '0 0 220px', bgcolor: '#fff' }}>
      <Skeleton variant="rectangular" width="100%" height={180} />
      <CardContent sx={{ p: 2 }}>
        <Skeleton width="80%" height={24} sx={{ mb: 1 }} />
        <Skeleton width="60%" height={20} sx={{ mb: 2 }} />
        <Skeleton width="40%" height={28} />
      </CardContent>
    </Card>
  );

  const renderCard = (product: ProductT) => {
    // Build safe image array
    const rawImages = [product.cover_image, ...(product.images || [])].filter((img): img is string => typeof img === 'string' && img.trim() !== '');
    const images = rawImages.length > 0 ? rawImages : ['/images/fallback.jpg'];
    const currentIndex = currentIndexes[product.id] || 0;
    const currentImage = images[currentIndex] || '/images/fallback.jpg';

    // Determine final image source
    const imageSrc = currentImage.startsWith('http') || currentImage.startsWith('data:')
      ? currentImage
      : `${MEDIA_BASE}${currentImage.startsWith('/') ? '' : '/'}${currentImage}`;

    const cartItem = cart[product.id];

    return (
      <Card
        key={product.id}
        sx={{
          width: 220,
          height: 360,
          flex: '0 0 220px',
          display: 'flex',
          flexDirection: 'column',
      
          bgcolor: '#fff',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Wishlist */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            bgcolor: '#fff',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
           
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleWishlistToggle(product.id);
          }}
        >
          <Favorite sx={{ color: wishlist.has(product.id) ? '#c2185b' : '#888', fontSize: 18 }} />
        </Box>

        {/* Product Image */}
        <Box
          sx={{ width: 220, height: 180, cursor: 'pointer', overflow: 'hidden' }}
          onClick={() => router.push(`/product/${product.id}`)}
        >
          <CardMedia
            component="img"
            image={imageSrc}
            alt={product.title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {product.stock < 5 && product.stock > 0 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                bgcolor: 'rgba(0,0,0,0.8)',
                color: '#fff',
                px: 1,
                py: 0.5,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              Only {product.stock} left!
            </Box>
          )}
        </Box>

        {/* Card Content */}
        <CardContent sx={{ flexGrow: 1, p: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 180 }}>
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                color: '#000',
                fontSize: '1rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {product.title}
            </Typography>
            <Typography
              sx={{
                color: '#444',
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
              <Typography sx={{ fontWeight: 800, color: '#000', fontSize: '1rem' }}>
                KES {product.price.toLocaleString()}
              </Typography>
              {product.discount && (
                <Typography sx={{ ml: 1, fontSize: '0.8rem', fontWeight: 600, color: '#c2185b' }}>
                  ({product.discount}% off)
                </Typography>
              )}
            </Box>
          </Box>

          {cartItem ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1.5, gap: 1.5 }}>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); handleDecreaseQuantity(product.id); }}
                sx={{ color: '#c2185b', width: 32, height: 32 }}
              >
                <Remove sx={{ fontSize: 16 }} />
              </IconButton>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', minWidth: 24, textAlign: 'center' }}>
                {cartItem.quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                disabled={cartItem.quantity >= product.stock}
                sx={{
                  color: '#c2185b',
                  
                  width: 32,
                  height: 32,
                  '&[disabled]': { color: '#ccc' },
                }}
              >
                <Add sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ) : (
            <Button
              fullWidth
              startIcon={<ShoppingCart sx={{ fontSize: 16 }} />}
              onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
              disabled={product.stock === 0}
              sx={{
                bgcolor: '#c2185b',
                color: '#fff',
                textTransform: 'none',
                fontSize: '0.9rem',
                mt: 1.5,
                py: 0.75,
              
                '&:disabled': { bgcolor: '#e0e0e0', color: '#999' },
              }}
            >
              Add to Cart
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#fff' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

        <Button
          startIcon={<ShoppingCart sx={{ fontSize: 16 }} />}
          onClick={handleViewCart}
          disabled={getCartItemCount() === 0}
          sx={{
            bgcolor: '#c2185b',
            color: '#fff',
            textTransform: 'none',
            fontSize: '0.9rem',
            py: 0.75,
            px: 2,
         
            '&:disabled': { bgcolor: '#e0e0e0', color: '#999' },
          }}
        >
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

export default SamsungProductsSection;