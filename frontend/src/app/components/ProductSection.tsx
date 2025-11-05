'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
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

type ProductT = {
  id: number;
  title: string;
  price: number;
  description: string;
  cover_image?: string;
  images?: string[];
  stock: number;
};

// ——— CONFIG ———
const CACHE_KEY = 'featured_products_cache';
const CACHE_TIME = 15 * 60 * 1000;

const API_FEATURED = `${
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/api'
    : 'https://cloudtech-c4ft.onrender.com/api'
}/products/?is_featured=true`;

const ProductSection = () => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { cart, addToCart, updateQuantity } = useCart();

  const [products, setProducts] = useState<ProductT[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
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

  const hasFetched = useRef(false);

  // ——— LOAD FROM CACHE ———
  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TIME) {
        setProducts(data);
        setLoading(false);
        hasFetched.current = true;
      }
    }
  }, []);

  // ——— FETCH ONCE ———
  useEffect(() => {
    if (hasFetched.current) return;

    const fetchProducts = async () => {
      try {
        const res = await fetch(API_FEATURED, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const list: ProductT[] = Array.isArray(data) ? data : data.results ?? [];

        setProducts(list);
        setLoading(false);
        hasFetched.current = true;

        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: list, timestamp: Date.now() }));
      } catch (err) {
        console.error('Fetch error:', err);
        setSnackbar({ open: true, message: 'Failed to load products', severity: 'error' });
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ——— LOAD WISHLIST ———
  useEffect(() => {
    const stored = localStorage.getItem('wishlist');
    if (stored) setWishlist(new Set(JSON.parse(stored)));
  }, []);

  // ——— UTILS ———
  const show = (msg: string, type: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message: msg, severity: type });
  const hide = () => setSnackbar((p) => ({ ...p, open: false }));

  const toggleHeart = (id: number) => {
    setWishlist((prev) => {
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

  // ——— SIMPLIFIED & ROBUST getImageUrl ———
  const getImageUrl = (path?: string): string => {
    if (!path) {
      console.warn('%c[Image] No path provided', 'color: yellow');
      return '/images/fallback.jpg';
    }
    return path; // Full URL from Django
  };

  // ——— CARD DIMENSIONS ———
  const CARD_W = 218;
  const CARD_H = 350;

  const skeleton = () => (
    <Card sx={{ width: CARD_W, height: CARD_H, borderRadius: 0, bgcolor: '#fff' }}>
      <Skeleton variant="rectangular" width="100%" height={CARD_H * 0.56} />
      <CardContent sx={{ p: 1.5 }}>
        <Skeleton width="90%" height={24} sx={{ mb: 0.5 }} />
        <Skeleton width="70%" height={18} sx={{ mb: 1 }} />
        <Skeleton width="55%" height={28} />
      </CardContent>
    </Card>
  );

  // ——— productCard — FIXED LOGGING & IMAGE LOADING ———
  const productCard = (p: ProductT) => {
    const src = getImageUrl(p.cover_image);
    const inCart = cart[p.id];

    // Log immediately when component mounts (accurate values)
    useEffect(() => {
      console.log('%c[Product Image] Loading:', 'color: cyan; font-weight: bold', {
        id: p.id,
        title: p.title,
        cover_image: p.cover_image,
        src,
      });
    }, [p.id, p.title, p.cover_image, src]);

    return (
      <Card
        key={p.id}
        sx={{
          width: CARD_W,
          height: CARD_H,
          bgcolor: '#fff',
          borderRadius: 0,
          boxShadow: '0 3px 6px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          flex: `0 0 ${CARD_W}px`,
          position: 'relative',
        }}
      >
        {/* Heart */}
        <Box
          onClick={(e) => {
            e.stopPropagation();
            toggleHeart(p.id);
          }}
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

        {/* Image - EAGER + HIGH PRIORITY */}
        <Box
          onClick={() => router.push(`/product/${p.id}`)}
          sx={{ width: '100%', height: CARD_H * 0.56, cursor: 'pointer', overflow: 'hidden' }}
        >
          <img
            src={src}
            alt={p.title}
            loading="eager"
            fetchPriority="high"
            crossOrigin="anonymous"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease-in-out',
              display: 'block',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.0)';
            }}
            onLoad={() => {
              console.log('%c[Product Image] LOADED', 'color: green; font-weight: bold', p.title, src);
            }}
            onError={(e) => {
              const target = e.currentTarget;
              target.src = '/images/fallback.jpg';
              console.error('%c[Product Image] FAILED TO LOAD', 'color: red; font-weight: bold', {
                id: p.id,
                title: p.title,
                attempted_url: src,
                fallback_used: '/images/fallback.jpg',
              });
            }}
          />
        </Box>

        {/* Content */}
        <CardContent sx={{ p: 1.5, height: CARD_H * 0.44, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: '#222',
                fontSize: '0.95rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {p.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#666',
                fontSize: '0.78rem',
                mt: 0.5,
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {p.description}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#222', mt: 1, fontSize: '1.05rem' }}>
              KES {p.price.toLocaleString()}
            </Typography>
          </Box>

          {inCart ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 1.2 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  sub(p.id);
                }}
                sx={{ color: '#e91e63', border: '1.5px solid #e91e63', width: 32, height: 32 }}
              >
                <Remove fontSize="small" />
              </IconButton>
              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', minWidth: 28, textAlign: 'center' }}>
                {inCart.quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  add(p);
                }}
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
              onClick={(e) => {
                e.stopPropagation();
                add(p);
              }}
              sx={{
                bgcolor: '#e91e63',
                color: '#fff',
                textTransform: 'none',
                mt: 1.5,
                borderRadius: 0,
                fontSize: '0.88rem',
                py: 0.9,
                '&:hover': { bgcolor: '#c2185b' },
              }}
            >
              Add to Cart
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  // ——— RENDER ———
  return (
    <Box sx={{ py: { xs: 3, md: 5 }, bgcolor: '#fff' }}>
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#222' }}>
          Featured Products
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
          ? Array.from({ length: 10 }).map((_, i) => (
              <Box key={i}>{skeleton()}</Box>
            ))
          : products
              .filter((p) => p.stock > 0)
              .map(productCard)}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={hide}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={hide} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductSection;