// app/product/[id]/ProductClient.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Divider,
  Alert,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Link,
  TextField,
  Container,
  Skeleton,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Add,
  Remove,
  ShoppingCart,
  ArrowBackIos,
  ArrowForwardIos,
  Store,
  LocalFireDepartment,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/components/cartContext';
import TopNavBar from '@/app/components/TopNavBar';
import MainNavBar from '@/app/components/MainNavBar';

const MEDIA_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : 'https://cloudtech-c4ft.onrender.com';

type ProductT = {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  discount?: number;
  final_price?: number;
  cover_image?: string;
  images?: { id: string; image: string }[];
  colors?: string[];
  brand?: { id: number; name: string };
  is_active?: boolean;
};

type Props = {
  product: ProductT;
  relatedProducts: ProductT[];
  initialWishlist: string[];
};

const CACHE_TIME = 15 * 60 * 1000;

export default function ProductClient({ product, relatedProducts: initialRelated, initialWishlist }: Props) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { cart, addToCart, updateQuantity } = useCart() as any;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState(initialRelated);
  const mounted = useRef(true);

  const id = product.id;

  // Load wishlist
  useEffect(() => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setIsWishlisted(wishlist.includes(id));
    } catch (err) {
      console.error('Error loading wishlist:', err);
    }
  }, [id]);

  // Cache related products
  useEffect(() => {
    sessionStorage.setItem('related_products_cache', JSON.stringify({ data: initialRelated, timestamp: Date.now() }));
  }, [initialRelated]);

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const updated = isWishlisted ? wishlist.filter((pid: string) => pid !== id) : [...wishlist, id];
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setIsWishlisted(!isWishlisted);
  };

  const cartItem = cart[id];
  const handleAddToCart = () => {
    if (product.stock === 0) return;
    const success = addToCart({
      id: Number(product.id),
      title: product.title,
      price: product.final_price || product.price,
      quantity,
      stock: product.stock,
    });
    if (success) setQuantity(1);
  };

  const updateCartQuantity = (delta: number) => {
    if (!cartItem) return;
    const newQty = cartItem.quantity + delta;
    if (newQty > 0 && newQty <= product.stock) {
      updateQuantity(Number(id), delta);
    }
  };

  const allImages = [
    product.cover_image,
    ...(product.images?.map((i) => i.image) || []),
  ].filter(Boolean) as string[];

  const currentImage = allImages[selectedImageIndex]?.startsWith('http')
    ? allImages[selectedImageIndex]
    : `${MEDIA_BASE}${allImages[selectedImageIndex]}`;

  const finalPrice = product.final_price || (product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price);

  const isLowStock = product.stock > 0 && product.stock < 5;

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh' }}>
      <TopNavBar />
      <MainNavBar />

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Breadcrumbs sx={{ mb: 4, fontSize: '0.875rem', color: '#666' }}>
          <Link underline="hover" color="inherit" href="/" sx={{ '&:hover': { color: '#e91e63' } }}>
            Home
          </Link>
          <Link underline="hover" color="inherit" href="/products" sx={{ '&:hover': { color: '#e91e63' } }}>
            Products
          </Link>
          <Typography color="#1a1a1a" sx={{ fontWeight: 600 }}>
            {product.title}
          </Typography>
        </Breadcrumbs>

        {/* === SAME UI AS BEFORE === */}
        <Box sx={{ bgcolor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #eaeaea', borderRadius: 2, overflow: 'hidden' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} divider={<Divider orientation="vertical" flexItem />}>
            {/* IMAGE SECTION */}
            <Box sx={{ flex: '0 0 45%', p: { xs: 2, md: 4 }, bgcolor: '#fafafa' }}>
              <Box sx={{ height: { xs: 300, sm: 380, md: 440 }, bgcolor: '#fff', border: '1px solid #eee', borderRadius: 2, overflow: 'hidden', position: 'relative', mb: 2 }}>
                <img src={currentImage || '/images/fallback.jpg'} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                {allImages.length > 1 && (
                  <>
                    <IconButton size="small" onClick={() => setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
                      sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.95)', boxShadow: 3, '&:hover': { bgcolor: '#fff' } }}>
                      <ArrowBackIos fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setSelectedImageIndex((prev) => (prev + 1) % allImages.length)}
                      sx={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.95)', boxShadow: 3, '&:hover': { bgcolor: '#fff' } }}>
                      <ArrowForwardIos fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Box>
              {allImages.length > 1 && (
                <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', py: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                  {allImages.map((img, i) => (
                    <Box key={i} onClick={() => setSelectedImageIndex(i)} sx={{
                      width: 64, height: 64, border: i === selectedImageIndex ? '2px solid #e91e63' : '1px solid #ddd',
                      borderRadius: 1.5, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, bgcolor: '#fff',
                      boxShadow: i === selectedImageIndex ? '0 0 0 1px #e91e63' : 'none', transition: 'all 0.2s'
                    }}>
                      <img src={img.startsWith('http') ? img : `${MEDIA_BASE}${img}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            {/* DETAILS */}
            <Box sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
              <Typography variant="h4" sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
                {product.title}
              </Typography>
              {product.brand && (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#666', mb: 2, fontWeight: 500 }}>
                  <Store fontSize="small" /> {product.brand.name}
                </Typography>
              )}
              {isLowStock && (
                <Alert severity="warning" icon={<LocalFireDepartment sx={{ color: '#e91e63' }} />} sx={{ mb: 3, py: 1, fontSize: '0.9rem', fontWeight: 600, bgcolor: '#fff8e1', border: '1px solid #ffecb3', color: '#a66400', borderRadius: 1.5 }}>
                  Only {product.stock} left in stock!
                </Alert>
              )}
              <Typography variant="body1" sx={{ color: '#444', mb: 3, lineHeight: 1.7 }}>{product.description}</Typography>
              <Divider sx={{ mb: 3, borderColor: '#eee' }} />

              <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                {product.discount && product.discount > 0 && (
                  <Typography sx={{ fontSize: '1.1rem', color: '#888', textDecoration: 'line-through' }}>
                    KES {product.price.toLocaleString()}
                  </Typography>
                )}
                <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: '#1a1a1a' }}>
                  KES {finalPrice.toLocaleString()}
                </Typography>
                {product.discount && (
                  <Box sx={{ bgcolor: '#e91e63', color: '#fff', px: 1.2, py: 0.4, borderRadius: 1, fontSize: '0.8rem', fontWeight: 700 }}>
                    -{product.discount}%
                  </Box>
                )}
              </Stack>

              {/* Colors, Quantity, Buttons... (same as before) */}
              {/* ... keep all your existing UI logic ... */}
            </Box>
          </Stack>
        </Box>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <Box sx={{ mt: 10 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 4 }}>You May Also Like</Typography>
            <Stack direction="row" spacing={3} sx={{ overflowX: 'auto', pb: 2, '&::-webkit-scrollbar': { display: 'none' } }}>
              {relatedProducts.map((p) => {
                const img = p.cover_image?.startsWith('http') ? p.cover_image : `${MEDIA_BASE}${p.cover_image}`;
                const price = p.final_price || (p.discount ? p.price - (p.price * p.discount) / 100 : p.price);
                return (
                  <Box key={p.id} onClick={() => router.push(`/product/${p.id}`)} sx={{ minWidth: 190, cursor: 'pointer', transition: '0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                    <Box sx={{ height: 170, bgcolor: '#fafafa', border: '1px solid #eee', borderRadius: 2, overflow: 'hidden', mb: 1.5 }}>
                      <img src={img || '/images/fallback.jpg'} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </Box>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.95rem' }}>{p.title}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#e91e63', fontSize: '1.1rem' }}>KES {price.toLocaleString()}</Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
}