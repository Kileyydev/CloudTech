// src/app/search/page.tsx
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
  Paper,
} from '@mui/material';
import {
  Favorite,
  ShoppingCart,
  Add,
  Remove,
  SearchOff as SearchOffIcon,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/app/hooks/useCart';
import TopNavBar from '@/app/components/TopNavBar';
import MainNavBar from '@/app/components/MainNavBar';
import TickerBar from '@/app/components/TickerBar';

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

const CACHE_TIME = 15 * 60 * 1000;

const API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/api'
    : 'https://cloudtech-c4ft.onrender.com/api';

const MEDIA_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : 'https://cloudtech-c4ft.onrender.com';

// ──────── No Products Found (perfectly centered) ────────
const NoProductsFound = () => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 2,
        p: 4,
        textAlign: 'center',
        maxWidth: 600,
        mx: 'auto',
      }}
    >
      <SearchOffIcon sx={{ fontSize: 80, color: theme.palette.grey[400], mb: 2 }} />
      <Typography variant="h5" sx={{ fontWeight: 600, color: '#222', mb: 1 }}>
        No Products Found
      </Typography>
      <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
        Sorry, we couldn&apos;t find any products matching your search. Try different keywords or browse our featured products.
      </Typography>
      <Button
        variant="contained"
        sx={{ backgroundColor: '#e91e63', color: '#fff', textTransform: 'none', borderRadius: 0 }}
        onClick={() => (window.location.href = '/')}
      >
        Back to Home
      </Button>
    </Paper>
  );
};

// ──────── Main Search Page ────────
const SearchResults = () => {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { cart, addToCart, updateQuantity } = useCart();

  const query = searchParams.get('query') || '';

  const [products, setProducts] = useState<ProductT[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [currentIndexes, setCurrentIndexes] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const mounted = useRef(true);

  // ──────── Cache first ────────
  useEffect(() => {
    if (!query) return;
    const cacheKey = `search_products_${query}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TIME) {
        setProducts(data);
        setLoading(false);
      }
    }
  }, [query]);

  // ──────── Fetch products ────────
  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    mounted.current = true;
    const fetchProducts = async () => {
      try {
        const apiUrl = `${API_BASE}/products/?search=${encodeURIComponent(query)}`;
        const res = await fetch(apiUrl, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch search results');

        const data = await res.json();
        const list: ProductT[] = Array.isArray(data) ? data : data.results ?? [];

        const indexes: Record<number, number> = {};
        list.forEach((p) => (indexes[p.id] = 0));

        if (mounted.current) {
          setProducts(list);
          setCurrentIndexes(indexes);
          setLoading(false);
        }

        sessionStorage.setItem(cacheKey, JSON.stringify({ data: list, timestamp: Date.now() }));
      } catch (err) {
        console.error(err);
        if (mounted.current) {
          setSnackbar({ open: true, message: 'Failed to load results', severity: 'error' });
          setLoading(false);
        }
      }
    };

    const cacheKey = `search_products_${query}`;
    fetchProducts();
    return () => { mounted.current = false; };
  }, [query]);

  // ──────── Wishlist ────────
  useEffect(() => {
    const stored = localStorage.getItem('wishlist');
    if (stored) setWishlist(new Set(JSON.parse(stored)));
  }, []);

  // ──────── Snackbar ────────
  const showSnackbar = (msg: string, sev: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message: msg, severity: sev });
  const closeSnackbar = () => setSnackbar((p) => ({ ...p, open: false }));

  // ──────── Cart Helpers ────────
  const toggleWishlist = (id: number) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('wishlist', JSON.stringify([...next]));
      return next;
    });
  };

  const addOne = (p: ProductT) => {
    if (p.stock === 0) return showSnackbar('Out of stock', 'error');
    const item = cart[p.id];
    if (item && item.quantity >= p.stock) return showSnackbar(`Only ${p.stock} left`, 'error');

    addToCart({ id: p.id, name: p.title, price: p.price, quantity: 1 });
    showSnackbar(`${p.title} added!`);
  };

  const removeOne = (id: number) => {
    updateQuantity(id, -1);
    showSnackbar('Cart updated');
  };

  const viewCart = () => {
    if (Object.keys(cart).length === 0) return showSnackbar('Cart is empty', 'error');
    router.push('/cart');
  };

  const cartCount = Object.values(cart).reduce((s, i) => s + (i.quantity || 0), 0);

  // ──────── Card Renderers ────────
  const skeleton = (_: any, i: number) => (
    <Card key={i} sx={{ width: 220, height: 360, borderRadius: 0 }}>
      <Skeleton variant="rectangular" width="100%" height={180} />
      <CardContent sx={{ p: 2 }}>
        <Skeleton width="80%" height={24} sx={{ mb: 1 }} />
        <Skeleton width="60%" height={20} sx={{ mb: 2 }} />
        <Skeleton width="40%" height={28} />
      </CardContent>
    </Card>
  );

  const productCard = (p: ProductT) => {
    const imgs = [p.cover_image, ...(p.images || [])].filter(Boolean).slice(0, 3);
    const idx = currentIndexes[p.id] || 0;
    const item = cart[p.id];
    const src = imgs[idx]?.startsWith('http') ? imgs[idx] : `${MEDIA_BASE}${imgs[idx]}`;

    return (
      <Card
        key={p.id}
        sx={{
          width: 220,
          height: 360,
          backgroundColor: '#fff',
          borderRadius: 0,
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          flex: '0 0 220px',
          position: 'relative',
          transition: 'transform .2s',
          '&:hover': { transform: 'translateY(-4px)' },
        }}
      >
        {/* Wishlist Heart */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            bgcolor: 'rgba(255,255,255,.95)',
            width: 32,
            height: 32,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(p.id);
          }}
        >
          <Favorite sx={{ color: wishlist.has(p.id) ? '#e91e63' : '#888', fontSize: 18 }} />
        </Box>

        {/* Image */}
        <Box
          sx={{ width: 220, height: 180, cursor: 'pointer', overflow: 'hidden' }}
          onClick={() => router.push(`/product/${p.id}`)}
        >
          <CardMedia component="img" image={src || '/images/fallback.jpg'} alt={p.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>

        {/* Info */}
        <CardContent sx={{ flexGrow: 1, p: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 180 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#222', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', fontSize: '.85rem', mt: .5 }}>
              {p.description}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#222', mt: 1 }}>
              KES {p.price.toLocaleString()}
            </Typography>
          </Box>

          {item ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5, gap: 1.5 }}>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeOne(p.id); }} sx={{ color: '#e91e63', border: '1px solid #e91e63', width: 32, height: 32 }}>
                <Remove fontSize="small" />
              </IconButton>
              <Typography sx={{ fontWeight: 600 }}>{item.quantity}</Typography>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); addOne(p); }}
                disabled={item.quantity >= p.stock}
                sx={{ color: '#e91e63', border: '1px solid #e91e63', width: 32, height: 32 }}
              >
                <Add fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Button
              fullWidth
              variant="contained"
              startIcon={<ShoppingCart sx={{ fontSize: 16 }} />}
              sx={{ bgcolor: '#e91e63', color: '#fff', textTransform: 'none', mt: 1.5, borderRadius: 0 }}
              onClick={(e) => { e.stopPropagation(); addOne(p); }}
            >
              Add to Cart
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  // ──────── Empty Query ────────
  if (!query) {
    return (
      <>
      <TickerBar />
        <TopNavBar />
        <MainNavBar />
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff' }}>
          <NoProductsFound />
        </Box>
      </>
    );
  }

  // ──────── Main Layout ────────
  return (
    <>
    <TickerBar />
      <TopNavBar />
      <MainNavBar />
      

      <Box sx={{ minHeight: '100vh', bgcolor: '#fff', pt: 2 }}>
        {/* Header */}
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#222' }}>
            Search Results for "{query}"
          </Typography>
          <Button
            variant="contained"
            startIcon={<ShoppingCart sx={{ fontSize: 16 }} />}
            onClick={viewCart}
            sx={{ bgcolor: '#e91e63', color: '#fff', textTransform: 'none', borderRadius: 0 }}
            disabled={cartCount === 0}
          >
            View Cart ({cartCount})
          </Button>
        </Box>

        {/* Content */}
        {loading ? (
          <Box
            sx={{
              maxWidth: 1200,
              mx: 'auto',
              ...(isSmallScreen
                ? { display: 'flex', overflowX: 'auto', gap: 2, pb: 2, '&::-webkit-scrollbar': { display: 'none' } }
                : { display: 'grid', gridTemplateColumns: { md: 'repeat(4,1fr)', lg: 'repeat(5,1fr)' }, gap: 3 }),
            }}
          >
            {Array.from({ length: 8 }).map(skeleton)}
          </Box>
        ) : products.filter((p) => p.stock > 0).length > 0 ? (
          <Box
            sx={{
              maxWidth: 1200,
              mx: 'auto',
              ...(isSmallScreen
                ? { display: 'flex', overflowX: 'auto', gap: 2, pb: 2, '&::-webkit-scrollbar': { display: 'none' } }
                : { display: 'grid', gridTemplateColumns: { md: 'repeat(4,1fr)', lg: 'repeat(5,1fr)' }, gap: 3 }),
            }}
          >
            {products.filter((p) => p.stock > 0).map(productCard)}
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <NoProductsFound />
          </Box>
        )}
      </Box>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={closeSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SearchResults;