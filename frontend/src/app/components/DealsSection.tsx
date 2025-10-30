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
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  Skeleton,
} from '@mui/material';
import { Favorite, ShoppingCart, Add, Remove } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCart } from './cartContext';

type ProductT = {
  id: number;
  title: string;
  price: number;
  discount?: number;
  description: string;
  cover_image?: string;
  images?: string[];
  categories?: { id: number; name: string }[];
  stock: number;
  is_active?: boolean;
};

type CategoryT = { id: number; name: string };

const CACHE_KEY = 'deals_cache_v1';
const CACHE_TIME = 15 * 60 * 1000; // 15 minutes

// 💡 Smart API + Media base URLs (auto-switches between dev and production)
const API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/api'
    : 'https://cloudtech-c4ft.onrender.com/api';

const MEDIA_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : 'https://cloudtech-c4ft.onrender.com';

const API_PRODUCTS = `${API_BASE}/products/`;
const API_CATEGORIES = `${API_BASE}/categories/`;

const DealsSection = () => {
  const theme = useTheme();
  const router = useRouter();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { cart, addToCart, updateQuantity } = useCart();

  const [products, setProducts] = useState<ProductT[]>([]);
  const [categories, setCategories] = useState<CategoryT[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [currentIndexes, setCurrentIndexes] = useState<Record<number, number>>({});
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const mounted = useRef(true);

  // ✅ Load cached data first
  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TIME) {
        setProducts(data.products);
        setCategories(data.categories);
        setLoading(false);
      }
    }
  }, []);

  // ✅ Fetch fresh data in parallel and cache
  useEffect(() => {
    mounted.current = true;

    const fetchDealsAndCategories = async () => {
      try {
        const [productRes, categoryRes] = await Promise.all([
          fetch(API_PRODUCTS, { cache: 'no-store' }),
          fetch(API_CATEGORIES, { cache: 'no-store' }),
        ]);

        if (!productRes.ok || !categoryRes.ok) throw new Error('Failed to fetch');

        const productData = await productRes.json();
        const categoryData = await categoryRes.json();

        const allProducts: ProductT[] = Array.isArray(productData)
          ? productData
          : productData.results ?? [];

        const discounted = allProducts.filter(
          (p) => p.is_active && p.discount && p.discount > 0
        );

        const catsArray: CategoryT[] = Array.isArray(categoryData)
          ? categoryData
          : categoryData.results ?? [];

        const indexes: Record<number, number> = {};
        discounted.forEach((p) => (indexes[p.id] = 0));

        if (mounted.current) {
          setProducts(discounted);
          setCategories(catsArray);
          setCurrentIndexes(indexes);
          setLoading(false);
        }

        // Cache results
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: { products: discounted, categories: catsArray },
            timestamp: Date.now(),
          })
        );
      } catch (err) {
        console.error('Fetch error:', err);
        if (mounted.current) {
          setSnackbar({
            open: true,
            message: 'Failed to load deals',
            severity: 'error',
          });
          setLoading(false);
        }
      }
    };

    fetchDealsAndCategories();

    return () => {
      mounted.current = false;
    };
  }, []);

  // ✅ Load wishlist from localStorage
  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem('wishlist');
      if (storedWishlist) setWishlist(new Set(JSON.parse(storedWishlist)));
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  }, []);

  // Handlers
  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message, severity });
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
    if (product.stock === 0)
      return showSnackbar('This product is out of stock', 'error');
    const cartItem = cart[product.id];
    if (cartItem && cartItem.quantity >= product.stock)
      return showSnackbar(`Only ${product.stock} available`, 'error');
    const success = addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      stock: product.stock,
    });
    showSnackbar(success ? `${product.title} added to cart!` : 'Failed to add', success ? 'success' : 'error');
  };

  const handleDecreaseQuantity = (id: number) => {
    const success = updateQuantity(id, -1);
    if (success) showSnackbar('Cart updated');
  };

  const handleTabChange = (_: any, newVal: number | 'all') => setActiveCategory(newVal);

  const getCartItemCount = () =>
    Object.values(cart).reduce((total, item) => total + (item.quantity || 0), 0);

  const handleViewCart = () => {
    if (Object.keys(cart).length === 0) return showSnackbar('Cart is empty', 'error');
    router.push('/cart');
  };

  // Filter deals by category
  const displayedProducts =
    activeCategory === 'all'
      ? products.filter((p) => p.stock > 0)
      : products.filter(
          (p) =>
            p.stock > 0 && p.categories?.some((c) => c.id === activeCategory)
        );

  // ✅ Skeleton UI
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

  // ✅ Product cards
  const renderCard = (product: ProductT) => {
    const images = [product.cover_image, ...(product.images || [])]
      .filter(Boolean)
      .slice(0, 3);
    const currentIndex = currentIndexes[product.id] || 0;
    const cartItem = cart[product.id];
    const imageSrc =
      images[currentIndex]?.startsWith('http')
        ? images[currentIndex]
        : `${MEDIA_BASE}${images[currentIndex]}`;
    const finalPrice = product.discount
      ? (product.price - product.price * (product.discount / 100)).toFixed(2)
      : product.price.toFixed(2);

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
          transition: 'transform 0.2s',
          '&:hover': { transform: 'translateY(-4px)' },
          flex: '0 0 220px',
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
            sx={{ color: wishlist.has(product.id) ? '#e91e63' : '#888', fontSize: 18 }}
          />
        </Box>

        {/* 🖼 Image */}
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

        {/* 📦 Content */}
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
              {product.description}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography
                variant="caption"
                sx={{ textDecoration: 'line-through', color: '#888', fontSize: '0.85rem', mr: 1 }}
              >
                KES {product.price.toLocaleString()}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: '#222', fontSize: '1rem' }}
              >
                KES {Number(finalPrice).toLocaleString()}
              </Typography>
            </Box>
          </Box>

          {cartItem ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5, gap: 1.5 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDecreaseQuantity(product.id);
                }}
                sx={{
                  color: '#e91e63',
                  border: '1px solid #e91e63',
                  width: 32,
                  height: 32,
                }}
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
                sx={{
                  color: '#e91e63',
                  border: '1px solid #e91e63',
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
                borderRadius: 0,
              }}
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
          Hot Deals
        </Typography>
        <Button
          variant="contained"
          startIcon={<ShoppingCart sx={{ fontSize: 16 }} />}
          onClick={handleViewCart}
          sx={{
            backgroundColor: '#e91e63',
            color: '#fff',
            textTransform: 'none',
            borderRadius: 0,
          }}
          disabled={getCartItemCount() === 0}
        >
          View Cart ({getCartItemCount()})
        </Button>
      </Box>

      {/* Category Tabs */}
      <Tabs
        value={activeCategory}
        onChange={handleTabChange}
        variant={isSmallScreen ? 'scrollable' : 'standard'}
        scrollButtons
        allowScrollButtonsMobile
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: '#666',
            '&.Mui-selected': { color: '#e91e63', fontWeight: 700 },
          },
          '& .MuiTabs-indicator': { backgroundColor: '#e91e63' },
        }}
      >
        <Tab label="All" value="all" />
        {categories.map((c) => (
          <Tab key={c.id} label={c.name} value={c.id} />
        ))}
      </Tabs>

      {/* Product Grid */}
      <Box
        sx={{
          maxWidth: '1200px',
          mx: 'auto',
          ...(isSmallScreen
            ? {
                display: 'flex',
                overflowX: 'auto',
                gap: 2,
                pb: 2,
                scrollSnapType: 'x mandatory',
                '&::-webkit-scrollbar': { display: 'none' },
              }
            : {
                display: 'grid',
                gridTemplateColumns: {
                  md: 'repeat(4, minmax(220px, 1fr))',
                  lg: 'repeat(5, minmax(220px, 1fr))',
                },
                gap: 3,
              }),
        }}
      >
        {loading
          ? Array.from({ length: 8 }).map(renderSkeletonCard)
          : displayedProducts.map(renderCard)}
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DealsSection;
