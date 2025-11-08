// src/app/search/page.tsx
'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
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
  CircularProgress,
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

// ──────── SUSPENSE FALLBACK (Fixes the build error) ────────
const SearchResultsInner = () => {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams(); // ← Now safe inside Suspense
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { cart, addToCart, updateQuantity } = useCart();

  const query = searchParams.get('query')?.trim() || '';
  const [products, setProducts] = useState<ProductT[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [currentIndexes] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const mounted = useRef(true);
  const cacheKey = query ? `search_${query}` : null;

  // Cache check
  useEffect(() => {
    if (!cacheKey) return;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TIME) {
        setProducts(data);
        setLoading(false);
        return;
      }
    }
  }, [cacheKey]);

  // Fetch
  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/products/?search=${encodeURIComponent(query)}`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Network error');

        const data = await res.json();
        const list: ProductT[] = Array.isArray(data) ? data : data.results || [];

        if (mounted.current) {
          setProducts(list);
          setLoading(false);
          sessionStorage.setItem(cacheKey!, JSON.stringify({ data: list, timestamp: Date.now() }));
        }
      } catch (err) {
        console.error(err);
        if (mounted.current) {
          setSnackbar({ open: true, message: 'Failed to load', severity: 'error' });
          setLoading(false);
        }
      }
    };

    fetchProducts();
    return () => { mounted.current = false; };
  }, [query, cacheKey]);

  // Wishlist
  useEffect(() => {
    const saved = localStorage.getItem('wishlist');
    if (saved) setWishlist(new Set(JSON.parse(saved)));
  }, []);

  const show = (msg: string, type: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message: msg, severity: type });
  const hide = () => setSnackbar(p => ({ ...p, open: false }));

  const toggleWishlist = (id: number) => {
    setWishlist(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('wishlist', JSON.stringify([...next]));
      return next;
    });
  };

  const addOne = (p: ProductT) => {
    if (p.stock === 0) return show('Out of stock', 'error');
    const existing = cart[p.id];
    if (existing && existing.quantity >= p.stock) return show(`Only ${p.stock} left`, 'error');
    addToCart({ id: p.id, name: p.title, price: p.price, quantity: 1 });
    show(`${p.title} added!`);
  };

  const removeOne = (id: number) => {
    updateQuantity(id, -1);
    show('Removed');
  };

  const viewCart = () => router.push('/cart');
  const cartCount = Object.values(cart).reduce((s, i) => s + (i.quantity || 0), 0);

  // Cards
  const skeleton = () => (
    <Card sx={{ width: 220, height: 360, borderRadius: 0 }}>
      <Skeleton variant="rectangular" height={180} />
      <CardContent>
        <Skeleton width="80%" />
        <Skeleton width="60%" />
        <Skeleton width="40%" height={36} />
      </CardContent>
    </Card>
  );

  const productCard = (p: ProductT) => {
    const imgs = [p.cover_image, ...(p.images || [])].filter(Boolean);
    const idx = currentIndexes[p.id] || 0;
    const src = imgs[idx]?.startsWith('http') ? imgs[idx] : `${MEDIA_BASE}${imgs[idx]}`;
    const inCart = cart[p.id];

    return (
      <Card key={p.id} sx={{
        width: 220,
        height: 360,
        bgcolor: '#fff',
        borderRadius: 0,
        boxShadow: 3,
        overflow: 'hidden',
        flex: '0 0 220px',
        transition: '0.2s',
        '&:hover': { transform: 'translateY(-4px)' }
      }}>
        <Box
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, bgcolor: 'rgba(255,255,255,.9)', borderRadius: '50%', p: 0.5 }}
          onClick={() => toggleWishlist(p.id)}
        >
          <Favorite sx={{ fontSize: 18, color: wishlist.has(p.id) ? '#e91e63' : '#888' }} />
        </Box>

        <Box onClick={() => router.push(`/product/${p.id}`)} sx={{ height: 180, cursor: 'pointer' }}>
          <CardMedia image={src || '/images/fallback.jpg'} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>

        <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 180 }}>
          <Box>
            <Typography noWrap fontWeight={600}>{p.title}</Typography>
            <Typography variant="body2" color="text.secondary" noWrap fontSize=".85rem">
              {p.description}
            </Typography>
            <Typography fontWeight={700} mt={1}>KES {p.price.toLocaleString()}</Typography>
          </Box>

          {inCart ? (
            <Box display="flex" justifyContent="center" gap={1} mt={1}>
              <IconButton size="small" onClick={() => removeOne(p.id)} sx={{ border: '1px solid #e91e63' }}>
                <Remove fontSize="small" />
              </IconButton>
              <Typography fontWeight={600} minWidth={24} textAlign="center">{inCart.quantity}</Typography>
              <IconButton size="small" onClick={() => addOne(p)} disabled={inCart.quantity >= p.stock} sx={{ border: '1px solid #e91e63' }}>
                <Add fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Button fullWidth variant="contained" startIcon={<ShoppingCart fontSize="small" />}
              onClick={() => addOne(p)}
              sx={{ bgcolor: '#e91e63', mt: 1.5, borderRadius: 0 }}>
              Add to Cart
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  // Empty query
  if (!query) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
          <SearchOffIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" fontWeight={600} mb={1}>No Search Term</Typography>
          <Typography color="text.secondary" mb={3}>Type something in the search bar!</Typography>
          <Button variant="contained" sx={{ bgcolor: '#e91e63', borderRadius: 0 }} onClick={() => router.push('/')}>
            Go Home
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', pt: 2 }}>
      <Box sx={{ px: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight={700}>
          Results for "{query}"
        </Typography>
        <Button variant="contained" startIcon={<ShoppingCart />}
          onClick={viewCart}
          sx={{ bgcolor: '#e91e63', borderRadius: 0 }}
          disabled={cartCount === 0}>
          Cart ({cartCount})
        </Button>
      </Box>

      {loading ? (
        <Box sx={{
          maxWidth: 1200, mx: 'auto',
          display: isSmallScreen ? 'flex' : 'grid',
          gap: 2,
          overflowX: isSmallScreen ? 'auto' : 'hidden',
          gridTemplateColumns: isSmallScreen ? 'none' : 'repeat(auto-fill, 220px)',
          justifyContent: 'center',
          pb: isSmallScreen ? 2 : 0,
          '&::-webkit-scrollbar': { display: 'none' }
        }}>
          {[...Array(10)].map((_, i) => <Box key={i}>{skeleton()}</Box>)}
        </Box>
      ) : products.length > 0 ? (
        <Box sx={{
          maxWidth: 1200, mx: 'auto',
          display: isSmallScreen ? 'flex' : 'grid',
          gap: 2,
          overflowX: isSmallScreen ? 'auto' : 'hidden',
          gridTemplateColumns: isSmallScreen ? 'none' : 'repeat(auto-fill, 220px)',
          justifyContent: 'center',
          pb: isSmallScreen ? 2 : 0,
          '&::-webkit-scrollbar': { display: 'none' }
        }}>
          {products.filter(p => p.stock > 0).map(productCard)}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
            <SearchOffIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
            <Typography variant="h5" fontWeight={600}>No Results</Typography>
            <Typography color="text.secondary" mb={3}>
              Try different keywords
            </Typography>
            <Button variant="contained" sx={{ bgcolor: '#e91e63', borderRadius: 0 }} onClick={() => router.push('/')}>
              Back Home
            </Button>
          </Paper>
        </Box>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={hide}>
        <Alert onClose={hide} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// ──────── MAIN PAGE WITH SUSPENSE BOUNDARY ────────
export default function SearchPage() {
  return (
    <>
      
      <Suspense fallback={
        <Box sx={{ minHeight: '100vh', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#e91e63' }} />
        </Box>
      }>
        <SearchResultsInner />
      </Suspense>
    </>
  );
}