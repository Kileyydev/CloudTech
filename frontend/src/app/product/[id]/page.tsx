'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Snackbar,
  Alert,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  LocalShipping,
  Sync,
  Security,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/app/components/cartContext';

interface Variant {
  id: string;
  color?: string;
  storage?: string;
  price: number;
  compare_at_price?: number;
  stock: number;
}

interface Product {
  id: string;
  title: string;
  description: string;
  cover_image?: any;
  images?: any[];
  price: number;
  final_price?: number;
  brand?: { name: string };
  variants?: Variant[];
  colors?: { value: string }[];
  storage_options?: { value: string }[];
}

const getImageUrl = (img: any): string => {
  if (!img) return '/images/fallback.jpg';
  if (typeof img === 'string') return img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_MEDIA_BASE}${img}`;
  if ('url' in img) return img.url.startsWith('http') ? img.url : `${process.env.NEXT_PUBLIC_MEDIA_BASE}${img.url}`;
  if ('image' in img) return getImageUrl(img.image);
  return '/images/fallback.jpg';
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Dropdown states
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('wishlist');
    if (saved) setWishlist(new Set(JSON.parse(saved)));
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/products/${params.id}/`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setProduct(data);

        // Extract unique options from variants
        const colors = Array.from(new Set(data.variants?.map((v: any) => v.color).filter(Boolean))) as string[];
        const storages = Array.from(new Set(data.variants?.map((v: any) => v.storage).filter(Boolean)))
          .filter(Boolean)
          .sort((a: any, b: any) => parseInt(a) - parseInt(b)) as string[];

        // Auto-select first available variant
        const available = data.variants?.find((v: Variant) => v.stock > 0);
        if (available) {
          setSelectedVariant(available);
          setSelectedColor(available.color || '');
          setSelectedStorage(available.storage || '');
        }
      } catch {
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchProduct();
  }, [params.id, router]);

  // Re-calculate variant when color/storage changes
  useEffect(() => {
    if (!product?.variants || (!selectedColor && !selectedStorage)) return;

    const match = product.variants.find((v: any) =>
      (!selectedColor || v.color === selectedColor) &&
      (!selectedStorage || v.storage === selectedStorage) &&
      v.stock > 0
    );

    if (match) {
      setSelectedVariant(match);
    } else {
      setSelectedVariant(null);
    }
  }, [selectedColor, selectedStorage, product?.variants]);

  const allImages = product
    ? [getImageUrl(product.cover_image), ...(product.images || []).map((i: any) => getImageUrl(i))]
    : [];

  const toggleWishlist = () => {
    if (!product) return;
    const updated = new Set(wishlist);
    updated.has(product.id) ? updated.delete(product.id) : updated.add(product.id);
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(Array.from(updated)));
    setSnackbar({ open: true, message: updated.has(product.id) ? 'Added to wishlist ❤️' : 'Removed from wishlist', severity: 'success' });
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) {
      setSnackbar({ open: true, message: 'Please select color and storage', severity: 'error' });
      return;
    }

    addToCart({
      id: Number(product.id),
      title: `${product.title} • ${selectedColor} ${selectedStorage}`.trim(),
      price: selectedVariant.price,
      quantity: 1,
      stock: selectedVariant.stock,
      cover_image: allImages[0],
      selectedOptions: { color: selectedColor, storage: selectedStorage },
    });

    setSnackbar({ open: true, message: 'Added to cart! 🛒', severity: 'success' });
  };

  if (loading || !product) {
    return <Box sx={{ p: 8, textAlign: 'center', bgcolor: '#ffffffff', color: '#000' }}>Loading product...</Box>;
  }

  const displayPrice = selectedVariant?.price || product.final_price || product.price;
  const originalPrice = selectedVariant?.compare_at_price || product.price;
  const savings = originalPrice - displayPrice;

  const uniqueColors = Array.from(new Set(product.variants?.map((v: any) => v.color).filter(Boolean))) as string[];
  const uniqueStorages = Array.from(new Set(product.variants?.map((v: any) => v.storage).filter(Boolean)))
    .filter(Boolean)
    .sort((a: any, b: any) => parseInt(a) - parseInt(b)) as string[];

  const inStock = selectedVariant ? selectedVariant.stock > 0 : false;

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', color: '#000' }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 3, md: 6 }, py: 8 }}>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 10 }}>

          {/* LEFT: Images */}
          <Box sx={{ flex: 1, position: 'sticky', top: 100, alignSelf: 'flex-start' }}>
            <Box sx={{ bgcolor: '#fff', mb: 4, position: 'relative' }}>
              <Image
                src={allImages[selectedImageIndex] || '/images/fallback.jpg'}
                alt={product.title}
                width={800}
                height={800}
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
              {allImages.length > 1 && (
                <>
                  <IconButton sx={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', bgcolor: '#fff' }}
                    onClick={() => setSelectedImageIndex(i => (i - 1 + allImages.length) % allImages.length)}>
                    <ChevronLeft />
                  </IconButton>
                  <IconButton sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', bgcolor: '#fff' }}
                    onClick={() => setSelectedImageIndex(i => (i + 1) % allImages.length)}>
                    <ChevronRight />
                  </IconButton>
                </>
              )}
            </Box>

            {allImages.length > 1 && (
              <Stack direction="row" spacing={2} justifyContent="center">
                {allImages.map((src, i) => (
                  <Box
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    sx={{
                      width: 80, height: 80, border: '2px solid',
                      borderColor: selectedImageIndex === i ? '#000' : '#ddd',
                      overflow: 'hidden', cursor: 'pointer'
                    }}
                  >
                    <Image src={src} alt="" width={80} height={80} style={{ objectFit: 'cover' }} />
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          {/* RIGHT: Info */}
          <Box sx={{ flex: 1 }}>
            <Stack spacing={6}>

              <Box>
                <Typography variant="h3" fontWeight={900} lineHeight={1}>
                  {product.title}
                </Typography>
                {product.brand && (
                  <Typography variant="h5" color="#333" mt={1} fontWeight={600}>
                    {product.brand.name}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="h2" fontWeight={900}>
                  KES {displayPrice.toLocaleString()}
                </Typography>
                {savings > 0 && (
                  <Stack direction="row" alignItems="center" spacing={2} mt={1}>
                    <Typography variant="h5" color="#888" sx={{ textDecoration: 'line-through' }}>
                      KES {originalPrice.toLocaleString()}
                    </Typography>
                    <Box sx={{ bgcolor: '#000', color: '#fff', px: 2, py: 0.5, fontWeight: 800 }}>
                      Save KES {savings.toLocaleString()}
                    </Box>
                  </Stack>
                )}
              </Box>

              <Divider sx={{ borderColor: '#000' }} />

              {/* Color Dropdown */}
              {uniqueColors.length > 0 && (
                <FormControl fullWidth>
                  <InputLabel sx={{ fontWeight: 700 }}>Color</InputLabel>
                  <Select
                    value={selectedColor}
                    label="Color"
                    onChange={(e) => setSelectedColor(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#000', borderWidth: 2 },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
                    }}
                  >
                    {uniqueColors.map(c => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Storage Dropdown */}
              {uniqueStorages.length > 0 && (
                <FormControl fullWidth>
                  <InputLabel sx={{ fontWeight: 700 }}>Storage</InputLabel>
                  <Select
                    value={selectedStorage}
                    label="Storage"
                    onChange={(e) => setSelectedStorage(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#000', borderWidth: 2 },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
                    }}
                  >
                    {uniqueStorages.map(s => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {selectedVariant && selectedVariant.stock < 10 && selectedVariant.stock > 0 && (
                <Typography color="#d32f2f" fontWeight={700}>
                  Only {selectedVariant.stock} left in stock — order soon!
                </Typography>
              )}

              <Stack direction="row" spacing={3}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart sx={{ fontSize: 32 }} />}
                  onClick={handleAddToCart}
                  disabled={!inStock || !selectedVariant}
                  sx={{
                    flex: 1, bgcolor: '#000', color: '#fff', py: 3.5,
                    fontSize: '1.4rem', fontWeight: 900, textTransform: 'none'
                  }}
                >
                  {inStock && selectedVariant ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <IconButton onClick={toggleWishlist} sx={{ border: '3px solid #000', width: 70, height: 70 }}>
                  {wishlist.has(product.id) ? <Favorite sx={{ fontSize: 34 }} /> : <FavoriteBorder sx={{ fontSize: 34 }} />}
                </IconButton>
              </Stack>

              <Box sx={{ p: 4, bgcolor: '#fff', border: '1px solid #000' }}>
                <Stack spacing={3}>
                  <Stack direction="row" alignItems="center" spacing={3}><LocalShipping /><Typography fontWeight={700}>Free delivery • 2–4 days</Typography></Stack>
                  <Stack direction="row" alignItems="center" spacing={3}><Sync /><Typography fontWeight={700}>Free 30-day returns</Typography></Stack>
                  <Stack direction="row" alignItems="center" spacing={3}><Security /><Typography fontWeight={700}>1-year warranty</Typography></Stack>
                  <Stack direction="row" alignItems="center" spacing={3}><CreditCard /><Typography fontWeight={700}>Secure payment</Typography></Stack>
                </Stack>
              </Box>

            </Stack>
          </Box>
        </Box>

      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} sx={{ fontWeight: 700 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}