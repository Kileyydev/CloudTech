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
import { useCart } from './cartContext';

// 🔧 Types
type ProductT = {
  id: number;
  title: string;
  price: number;
  description: string;
  cover_image?: string;
  images?: string[];
  categories?: { name: string }[];
  stock: number;
};

const CACHE_KEY = 'featured_products_cache';
const CACHE_TIME = 15 * 60 * 1000;


const API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/api'
    : 'https://www.cloudtechstore.net/api';

const MEDIA_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : 'https://www.cloudtechstore.net';

const API_FEATURED = `${API_BASE}/products/?is_featured=true`;

const ProductSection = () => {
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

  // ✅ Load from cache first
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

  // ✅ Fetch products
  useEffect(() => {
    mounted.current = true;
    const fetchProducts = async () => {
      try {
        const res = await fetch(API_FEATURED, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch featured products');

        const data = await res.json();
        const list: ProductT[] = Array.isArray(data) ? data : data.results ?? [];

        const indexes: Record<number, number> = {};
        list.forEach((p) => (indexes[p.id] = 0));

        if (mounted.current) {
          setProducts(list);
          setCurrentIndexes(indexes);
          setLoading(false);
        }

        // Cache results
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: list, timestamp: Date.now() }));
      } catch (err) {
        console.error('Error fetching featured products:', err);
        if (mounted.current) {
          setSnackbar({ open: true, message: 'Failed to load featured products', severity: 'error' });
          setLoading(false);
        }
      }
    };

    fetchProducts();
    return () => {
      mounted.current = false;
    };
  }, []);

  // ✅ Load wishlist
  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem('wishlist');
      if (storedWishlist) setWishlist(new Set(JSON.parse(storedWishlist)));
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  }, []);

  // ✅ Snackbar helpers
  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  // ✅ Cart handlers
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
    if (cartItem && cartItem.quantity >= product.stock)
      return showSnackbar(`Only ${product.stock} items available`, 'error');

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
    const success = updateQuantity(id, -1);
    if (success) showSnackbar('Cart updated');
  };

  const handleViewCart = () => {
    if (Object.keys(cart).length === 0) return showSnackbar('Your cart is empty', 'error');
    router.push('/cart');
  };

  const getCartItemCount = () => Object.values(cart).reduce((total, item) => total + (item.quantity || 0), 0);

  // ✅ Render UI
  const renderSkeletonCard = (_: any, index: number) => (
    <Card key={index} sx={{ width: 220, height: 360, backgroundColor: '#fff', borderRadius: 0 }}>
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
        : `${MEDIA_BASE}${images[currentIndex]}`;

    return (
      <Card
        key={product.id}
        sx={{
          width: 220,
          height: 360,
          backgroundColor: '#fff',
          borderRadius: 0,
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          flex: '0 0 220px',
          position: 'relative',
          transition: 'transform 0.2s',
          '&:hover': { transform: 'translateY(-4px)' },
        }}
      >
        {/* ❤️ Wishlist */}
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
            borderRadius: '50%',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleWishlistToggle(product.id);
          }}
        >
          <Favorite sx={{ color: wishlist.has(product.id) ? '#e91e63' : '#888', fontSize: 18 }} />
        </Box>

        {/* 🖼 Product Image */}
        <Box
          sx={{ width: 220, height: 180, cursor: 'pointer', overflow: 'hidden' }}
          onClick={() => router.push(`/product/${product.id}`)}
        >
          <CardMedia
            component="img"
            image={imageSrc || '/images/fallback.jpg'}
            alt={product.title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>

        {/* 📦 Product Info */}
        <CardContent sx={{ flexGrow: 1, p: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 180 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#222', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem', mt: 0.5 }}>
              {product.description}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#222', mt: 1 }}>
              KES {product.price.toLocaleString()}
            </Typography>
          </Box>

          {cartItem ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5, gap: 1.5 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDecreaseQuantity(product.id);
                }}
                sx={{ color: '#e91e63', border: '1px solid #e91e63', width: 32, height: 32 }}
              >
                <Remove sx={{ fontSize: 16 }} />
              </IconButton>
              <Typography sx={{ fontWeight: 600 }}>{cartItem.quantity}</Typography>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
                disabled={cartItem.quantity >= product.stock}
                sx={{ color: '#e91e63', border: '1px solid #e91e63', width: 32, height: 32 }}
              >
                <Add sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ) : (
            <Button
              variant="contained"
              startIcon={<ShoppingCart sx={{ fontSize: 16 }} />}
              fullWidth
              sx={{ backgroundColor: '#e91e63', color: '#fff', textTransform: 'none', mt: 1.5, borderRadius: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
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
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: '#fff' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#222' }}>
          Featured Products
        </Typography>
        <Button
          variant="contained"
          startIcon={<ShoppingCart sx={{ fontSize: 16 }} />}
          onClick={handleViewCart}
          sx={{ backgroundColor: '#e91e63', color: '#fff', textTransform: 'none', borderRadius: 0 }}
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
            ? { display: 'flex', overflowX: 'auto', gap: 2, pb: 2, scrollSnapType: 'x mandatory', '&::-webkit-scrollbar': { display: 'none' } }
            : { display: 'grid', gridTemplateColumns: { md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 3 }),
        }}
      >
        {loading ? Array.from({ length: 8 }).map(renderSkeletonCard) : products.filter((p) => p.stock > 0).map(renderCard)}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductSection;
