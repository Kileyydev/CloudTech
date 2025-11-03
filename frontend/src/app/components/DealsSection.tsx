// src/components/DealsSection.tsx
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

const CACHE_KEY = 'deals_cache_v2';
const CACHE_TIME = 15 * 60 * 1000;

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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { cart, addToCart, updateQuantity } = useCart();

  const [products, setProducts] = useState<ProductT[]>([]);
  const [categories, setCategories] = useState<CategoryT[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // 🛡️ PREVENT FREEZE
  const hasFetched = useRef(false);

  // Load cache
  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TIME) {
        setProducts(data.products);
        setCategories(data.categories);
        setLoading(false);
        hasFetched.current = true;
      }
    }
  }, []);

  // Fetch ONCE
  useEffect(() => {
    if (hasFetched.current) return;

    const fetchAll = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch(API_PRODUCTS, { cache: 'no-store' }),
          fetch(API_CATEGORIES, { cache: 'no-store' }),
        ]);

        if (!pRes.ok || !cRes.ok) throw new Error();

        const pJson = await pRes.json();
        const cJson = await cRes.json();

        const allProds: ProductT[] = Array.isArray(pJson) ? pJson : pJson.results ?? [];
        const deals = allProds.filter(p => p.is_active && p.discount && p.discount > 0 && p.stock > 0);
        const cats: CategoryT[] = Array.isArray(cJson) ? cJson : cJson.results ?? [];

        setProducts(deals);
        setCategories(cats);
        setLoading(false);
        hasFetched.current = true;

        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          data: { products: deals, categories: cats },
          timestamp: Date.now(),
        }));
      } catch {
        setSnackbar({ open: true, message: 'Failed to load deals', severity: 'error' });
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Wishlist
  useEffect(() => {
    const stored = localStorage.getItem('wishlist');
    if (stored) setWishlist(new Set(JSON.parse(stored)));
  }, []);

  const show = (msg: string, type: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message: msg, severity: type });
  const hide = () => setSnackbar(p => ({ ...p, open: false }));

  const toggleHeart = (id: number) => {
    setWishlist(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('wishlist', JSON.stringify([...next]));
      return next;
    });
  };

  const add = (p: ProductT) => {
    if (p.stock === 0) return show('Out of stock', 'error');
    const item = cart[p.id];
    if (item && item.quantity >= p.stock) return show(`Only ${p.stock} left`, 'error');
    addToCart({ id: p.id, title: p.title, price: p.price, quantity: 1, stock: p.stock });
    show(`${p.title} added!`);
  };

  const sub = (id: number) => {
    updateQuantity(id, -1);
    show('Cart updated');
  };

  const cartCount = Object.values(cart).reduce((s, i) => s + (i.quantity || 0), 0);

  // CARD SIZE
  const W = 218;
  const H = 350;

  const skeleton = () => (
    <Card sx={{ width: W, height: H, borderRadius: 0, bgcolor: '#fff' }}>
      <Skeleton variant="rectangular" width="100%" height={H * 0.56} />
      <CardContent sx={{ p: 1.5 }}>
        <Skeleton width="88%" height={22} sx={{ mb: 0.5 }} />
        <Skeleton width="65%" height={16} sx={{ mb: 1 }} />
        <Skeleton width="50%" height={26} />
      </CardContent>
    </Card>
  );

  const dealCard = (p: ProductT) => {
    const src = p.cover_image?.startsWith('http') ? p.cover_image : `${MEDIA_BASE}${p.cover_image}`;
    const final = p.discount ? p.price * (1 - p.discount / 100) : p.price;
    const inCart = cart[p.id];

    return (
      <Card
        key={p.id}
        sx={{
          width: W,
          height: H,
          bgcolor: '#fff',
          borderRadius: 0,
          boxShadow: '0 3px 6px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          flex: `0 0 ${W}px`,
          position: 'relative',
        }}
      >
        <Box
          onClick={(e) => { e.stopPropagation(); toggleHeart(p.id); }}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1,
            bgcolor: 'rgba(255,255,255,.95)',
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Favorite sx={{ color: wishlist.has(p.id) ? '#e91e63' : '#888', fontSize: 20 }} />
        </Box>

        <Box
          onClick={() => router.push(`/product/${p.id}`)}
          sx={{ width: '100%', height: H * 0.56, cursor: 'pointer', overflow: 'hidden' }}
        >
          <CardMedia
            component="img"
            image={src || '/images/fallback.jpg'}
            alt={p.title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>

        <CardContent sx={{ p: 1.5, height: H * 0.44, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontWeight: 600, color: '#222', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {p.title}
            </Typography>
            <Typography sx={{ color: '#666', fontSize: '0.78rem', mt: 0.5, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {p.description}
            </Typography>
            
            {/* ✨ HORIZONTAL DISCOUNT LINE ✨ */}
            <Box sx={{ mt: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography 
                sx={{ 
                  textDecoration: 'line-through', 
                  color: '#999', 
                  fontSize: '0.75rem',
                  fontWeight: 500 
                }}
              >
                KES {p.price.toLocaleString()}
              </Typography>
              <Typography 
                sx={{ 
                  fontWeight: 700, 
                  color: '#e91e63', 
                  fontSize: '1rem',
                  ml: 0.5 
                }}
              >
                KES {final.toLocaleString()}
              </Typography>
            </Box>
          </Box>

          {inCart ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 1.2 }}>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); sub(p.id); }} sx={{ color: '#e91e63', border: '1.5px solid #e91e63', width: 32, height: 32 }}>
                <Remove fontSize="small" />
              </IconButton>
              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', minWidth: 28, textAlign: 'center' }}>
                {inCart.quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); add(p); }}
                disabled={inCart.quantity >= p.stock}
                sx={{ color: '#e91e63', border: '1.5px solid #e91e63', width: 32, height: 32 }}
              >
                <Add fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Button
              fullWidth
              variant="contained"
              startIcon={<ShoppingCart sx={{ fontSize: 17 }} />}
              onClick={(e) => { e.stopPropagation(); add(p); }}
              sx={{ bgcolor: '#e91e63', color: '#fff', textTransform: 'none', mt: 1.5, borderRadius: 0, fontSize: '0.88rem', py: 0.9 }}
            >
              Add to Cart
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.categories?.some(c => c.id === activeCategory));

  return (
    <Box sx={{ py: { xs: 3, md: 5 }, bgcolor: '#fff' }}>
      <Box sx={{ px: { xs: 2, md: 4 }, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#222' }}>
          Hot Deals
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<ShoppingCart sx={{ fontSize: 16 }} />}
          onClick={() => router.push('/cart')}
          sx={{ bgcolor: '#e91e63', color: '#fff', textTransform: 'none', borderRadius: 0 }}
          disabled={cartCount === 0}
        >
          Cart ({cartCount})
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeCategory}
        onChange={(_, v) => setActiveCategory(v)}
        variant={isMobile ? 'scrollable' : 'standard'}
        scrollButtons="auto"
        sx={{
          mb: 2,
          px: { xs: 2, md: 4 },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: '#666',
            minWidth: 'auto',
            px: 2,
            '&.Mui-selected': { color: '#e91e63', fontWeight: 700 },
          },
          '& .MuiTabs-indicator': { bgcolor: '#e91e63', height: 3 },
        }}
      >
        <Tab label="All" value="all" />
        {categories.map(c => <Tab key={c.id} label={c.name} value={c.id} />)}
      </Tabs>

      {/* Grid */}
      <Box
        sx={{
          maxWidth: '1350px',
          mx: 'auto',
          px: { xs: 1, md: 1.5 },
          ...(isMobile
            ? {
                display: 'flex',
                overflowX: 'auto',
                gap: 0.8,
                pb: 2,
                '&::-webkit-scrollbar': { display: 'none' },
                scrollSnapType: 'x mandatory',
              }
            : {
                display: 'grid',
                gap: 0.8,
                gridTemplateColumns: {
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(4, 1fr)',
                  lg: 'repeat(5, 1fr)',
                },
              }),
        }}
      >
        {loading
          ? Array.from({ length: 10 }).map((_, i) => <Box key={i}>{skeleton()}</Box>)
          : filtered.map(dealCard)}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={hide} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={hide} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DealsSection;