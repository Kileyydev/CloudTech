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
  Card,
  CardContent,
  CardMedia,
  Chip,
  alpha,
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
  Add,
  Remove,
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
  type?: { value: string }[];
  connectivity?: { value: string }[];
}

type ProductImage = { image?: { url: string } } | { url: string } | string;
interface PopularProductT {
  id: number;
  title: string;
  description?: string;
  price: number;
  discount?: number;
  final_price?: number;
  stock: number;
  cover_image?: ProductImage;
  images?: ProductImage[];
  brand?: { name: string };
  type?: { value: string }[];
  connectivity?: { value: string }[];
  colors?: { value: string }[];
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

  // Popular products states
  const [popularProducts, setPopularProducts] = useState<PopularProductT[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const CACHE_KEY = 'popular_products_cache_v1';
  const CACHE_DURATION = 1000 * 60 * 5; // 5 mins
  const slidesToShow = 4; // Number of cards to show at once

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

  // Fetch popular products - using general fetch with limit=10
  useEffect(() => {
    const loadPopularProducts = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setPopularProducts(data);
            setLoadingPopular(false);
            return;
          }
        }
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE;
        if (!API_BASE_URL) throw new Error('API base URL not defined');
        // Fetch general active products, limit to 10 for carousel
        const res = await fetch(`${API_BASE_URL}/products/?is_active=true&limit=10`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('No popular products found');
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('Failed to parse popular products');
        }
        const list = Array.isArray(data)
          ? data
          : data.results || data.data || [];
        if (list.length === 0) throw new Error('No popular products found');
        setPopularProducts(list);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: list, timestamp: Date.now() })
        );
      } catch (err: any) {
        console.error('Popular products fetch failed:', err);
        // Fallback: try to fetch without limit or other params if needed
      } finally {
        setLoadingPopular(false);
      }
    };
    loadPopularProducts();
  }, []);

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

  const handlePopularAddToCart = (p: PopularProductT) => {
    if (p.stock <= 0) {
      setSnackbar({ open: true, message: 'Out of stock', severity: 'error' });
      return;
    }
    const priceToUse = p.final_price && p.discount ? p.final_price : p.price;
    addToCart({
      id: p.id,
      title: p.title,
      price: priceToUse,
      quantity: 1,
      stock: p.stock,
    });
    setSnackbar({ open: true, message: `${p.title} added to cart!`, severity: 'success' });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(popularProducts.length / slidesToShow));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(popularProducts.length / slidesToShow)) % Math.ceil(popularProducts.length / slidesToShow));
  };

  const handleLoadMore = () => {
    router.push('/products');
  };

  if (loading || !product) {
    return (
      <Box sx={{ bgcolor: '#fdfdfd', minHeight: '100vh', py: 8 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 3, md: 6 } }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4} alignItems="flex-start">
            <Box sx={{ flex: 1, height: 500, bgcolor: '#fff', borderRadius: 1, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ height: 60, bgcolor: '#fff', borderRadius: 1, mb: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
              <Box sx={{ height: 80, bgcolor: '#fff', borderRadius: 1, mb: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
              <Box sx={{ height: 100, bgcolor: '#fff', borderRadius: 1, mb: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
              <Box sx={{ height: 120, bgcolor: '#fff', borderRadius: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
            </Box>
          </Stack>
        </Box>
      </Box>
    );
  }

  const displayPrice = selectedVariant?.price || product.final_price || product.price;
  const originalPrice = selectedVariant?.compare_at_price || product.price;
  const savings = originalPrice - displayPrice;
  const uniqueColors = Array.from(new Set(product.variants?.map((v: any) => v.color).filter(Boolean))) as string[];
  const uniqueStorages = Array.from(new Set(product.variants?.map((v: any) => v.storage).filter(Boolean)))
    .filter(Boolean)
    .sort((a: any, b: any) => parseInt(a) - parseInt(b)) as string[];
  const inStock = selectedVariant ? selectedVariant.stock > 0 : false;
  const hasDiscount = savings > 0;

  // Popular products rendering
  const getPopularImageUrl = (img: ProductImage | undefined): string => {
    if (!img) return '/images/fallback.jpg';
    if (typeof img === 'string')
      return img.startsWith('http')
        ? img
        : `${process.env.NEXT_PUBLIC_MEDIA_BASE}${img}`;
    if ('url' in img)
      return img.url.startsWith('http')
        ? img.url
        : `${process.env.NEXT_PUBLIC_MEDIA_BASE}${img.url}`;
    if ('image' in img) return getPopularImageUrl(img.image);
    return '/images/fallback.jpg';
  };

  const renderPopularCard = (p: PopularProductT) => {
    const imageSrc = getPopularImageUrl(p.cover_image);
    const hasDiscount = p.discount && p.discount > 0;
    const displayPrice = hasDiscount && p.final_price ? p.final_price : p.price;
    return (
      <Card
        key={p.id}
        sx={{
          width: 250,
          height: 380,
          bgcolor: '#fff',
          overflow: 'hidden',
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 1,
          transition: 'box-shadow 0.2s',
          '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            height: 150,
            p: 2,
            cursor: 'pointer',
            bgcolor: '#f9f9f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}
          onClick={() => router.push(`/product/${p.id}`)}
        >
          <CardMedia
            component="img"
            image={imageSrc}
            alt={p.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
          {hasDiscount && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                bgcolor: '#e91e63',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.75rem',
                px: 1,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              {p.discount}% OFF
            </Box>
          )}
        </Box>
        <CardContent sx={{ p: 2, pb: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography
            sx={{
              fontWeight: 700,
              color: '#1a1a1a',
              mb: 1,
              fontSize: '0.9rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            onClick={() => router.push(`/product/${p.id}`)}
          >
            {p.title}
          </Typography>
          {p.brand && (
            <Typography sx={{ color: '#666', fontSize: '0.8rem', mb: 1 }}>
              {p.brand.name}
            </Typography>
          )}
          <Box sx={{ mb: 1.5 }}>
            {hasDiscount ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ textDecoration: 'line-through', color: '#999', fontSize: '0.8rem' }}>
                  KES {p.price.toLocaleString()}
                </Typography>
                <Typography sx={{ fontWeight: 800, color: '#e91e63', fontSize: '1rem' }}>
                  KES {displayPrice.toLocaleString()}
                </Typography>
              </Stack>
            ) : (
              <Typography sx={{ fontWeight: 800, color: '#1a1a1a', fontSize: '1rem' }}>
                KES {displayPrice.toLocaleString()}
              </Typography>
            )}
          </Box>
          <Button
            fullWidth
            size="small"
            startIcon={<ShoppingCart sx={{ fontSize: 16 }} />}
            onClick={(e) => {
              e.stopPropagation();
              handlePopularAddToCart(p);
            }}
            disabled={p.stock === 0}
            sx={{
              bgcolor: '#e91e63',
              color: '#fff',
              fontWeight: 700,
              textTransform: 'none',
              py: 0.8,
              fontSize: '0.8rem',
              borderRadius: 1,
              '&[disabled]': { bgcolor: '#eee', color: '#999' },
            }}
          >
            {p.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  const inStockPopular = popularProducts.filter(p => p.stock > 0);
  const totalSlides = Math.max(1, Math.ceil(inStockPopular.length / slidesToShow));

  return (
    <Box sx={{ bgcolor: '#fdfdfd', minHeight: '100vh', color: '#1a1a1a' }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 3, md: 6 }, py: { xs: 3, lg: 6 } }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={6} alignItems="flex-start">
          {/* LEFT: Images + Description below */}
          <Box sx={{ flex: 1, position: 'sticky', top: 100, alignSelf: 'flex-start' }}>
            <Card sx={{ bgcolor: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden', mb: 3 }}>
              <Box sx={{ position: 'relative', p: 4 }}>
                <Image
                  src={allImages[selectedImageIndex] || '/images/fallback.jpg'}
                  alt={product.title}
                  width={800}
                  height={800}
                  style={{ width: '100%', height: 500, objectFit: 'contain' }}
                />
                {allImages.length > 1 && (
                  <>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        left: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(255,255,255,0.95)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        '&:hover': { bgcolor: '#fff' },
                      }}
                      onClick={() => setSelectedImageIndex((i) => (i - 1 + allImages.length) % allImages.length)}
                    >
                      <ChevronLeft />
                    </IconButton>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        right: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(255,255,255,0.95)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        '&:hover': { bgcolor: '#fff' },
                      }}
                      onClick={() => setSelectedImageIndex((i) => (i + 1) % allImages.length)}
                    >
                      <ChevronRight />
                    </IconButton>
                  </>
                )}
              </Box>
            </Card>
            {allImages.length > 1 && (
              <Stack direction="row" spacing={2} justifyContent="center" mb={4}>
                {allImages.map((src, i) => (
                  <Box
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    sx={{
                      width: 80,
                      height: 80,
                      border: '2px solid',
                      borderColor: selectedImageIndex === i ? '#e91e63' : '#e0e0e0',
                      borderRadius: 1,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: selectedImageIndex === i ? '0 2px 8px rgba(233,30,99,0.2)' : 'none',
                    }}
                  >
                    <Image src={src} alt="" width={80} height={80} style={{ objectFit: 'cover' }} />
                  </Box>
                ))}
              </Stack>
            )}
            {/* Description below images, aligned to the center */}
            {product.description && (
              <Card sx={{ bgcolor: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', borderRadius: 2, p: 4 }}>
                <Typography variant="h6" fontWeight={700} color="#1a1a1a" mb={2.5} sx={{ textAlign: 'center' }}>
                  Description
                </Typography>
                <Typography variant="body1" color="#444" lineHeight={1.8} sx={{ fontSize: '1rem', textAlign: 'center' }}>
                  {product.description}
                </Typography>
              </Card>
            )}
          </Box>

          {/* RIGHT: Info (without description) */}
          <Box sx={{ flex: 1 }}>
            <Card sx={{ bgcolor: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', borderRadius: 2, p: { xs: 3, md: 4 } }}>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Stack spacing={4}>
                  {/* Title & Brand */}
                  <Box>
                    <Typography variant="h4" fontWeight={800} lineHeight={1.2} color="#1a1a1a" mb={1.5}>
                      {product.title}
                    </Typography>
                    {product.brand && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" color="#666" fontWeight={600}>
                          {product.brand.name}
                        </Typography>
                      </Stack>
                    )}
                  </Box>

                  {/* Price Section */}
                  <Box>
                    <Box sx={{ mb: hasDiscount ? 1 : 0 }}>
                      {hasDiscount ? (
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="h5" color="#999" sx={{ textDecoration: 'line-through', fontSize: '1rem' }}>
                            KES {originalPrice.toLocaleString()}
                          </Typography>
                          <Chip
                            label={`Save KES ${savings.toLocaleString()}`}
                            sx={{
                              bgcolor: alpha('#e91e63', 0.1),
                              color: '#e91e63',
                              fontWeight: 700,
                              fontSize: '0.875rem',
                            }}
                          />
                        </Stack>
                      ) : null}
                      <Typography variant="h3" fontWeight={800} color="#1a1a1a">
                        KES {displayPrice.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ borderColor: '#e0e0e0' }} />

                  {/* Variant Selectors */}
                  <Stack spacing={3}>
                    {uniqueColors.length > 0 && (
                      <FormControl fullWidth>
                        <InputLabel sx={{ fontWeight: 700, color: '#1a1a1a' }}>Color</InputLabel>
                        <Select
                          value={selectedColor}
                          label="Color"
                          onChange={(e) => setSelectedColor(e.target.value as string)}
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e91e63', borderWidth: 2 },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#e91e63' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#e91e63' },
                          }}
                        >
                          {uniqueColors.map((c) => (
                            <MenuItem key={c} value={c}>
                              {c}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    {uniqueStorages.length > 0 && (
                      <FormControl fullWidth>
                        <InputLabel sx={{ fontWeight: 700, color: '#1a1a1a' }}>Storage</InputLabel>
                        <Select
                          value={selectedStorage}
                          label="Storage"
                          onChange={(e) => setSelectedStorage(e.target.value as string)}
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e91e63', borderWidth: 2 },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#e91e63' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#e91e63' },
                          }}
                        >
                          {uniqueStorages.map((s) => (
                            <MenuItem key={s} value={s}>
                              {s}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Stack>

                  {/* Stock Warning */}
                  {selectedVariant && selectedVariant.stock < 10 && selectedVariant.stock > 0 && (
                    <Alert severity="warning" sx={{ fontWeight: 600 }}>
                      Only {selectedVariant.stock} left in stock — order soon!
                    </Alert>
                  )}

                  {/* Actions */}
                  <Stack spacing={3}>
                    <Stack direction="row" spacing={3}>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<ShoppingCart sx={{ fontSize: 24 }} />}
                        onClick={handleAddToCart}
                        disabled={!inStock || !selectedVariant}
                        sx={{
                          flex: 1,
                          bgcolor: '#e91e63',
                          color: '#fff',
                          py: 2,
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          borderRadius: 1,
                          boxShadow: '0 4px 16px rgba(233,30,99,0.3)',
                          '&:hover': { bgcolor: '#c2185b', boxShadow: '0 6px 20px rgba(233,30,99,0.4)' },
                          '&[disabled]': { bgcolor: '#eee', color: '#999' },
                        }}
                      >
                        {inStock && selectedVariant ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                      <IconButton
                        onClick={toggleWishlist}
                        sx={{
                          border: '2px solid #e91e63',
                          width: 56,
                          height: 56,
                          color: wishlist.has(product.id) ? '#e91e63' : '#999',
                          '&:hover': { borderColor: '#c2185b', color: '#e91e63' },
                        }}
                      >
                        {wishlist.has(product.id) ? <Favorite sx={{ fontSize: 28 }} /> : <FavoriteBorder sx={{ fontSize: 28 }} />}
                      </IconButton>
                    </Stack>
                  </Stack>

                  {/* Features */}
                  <Card sx={{ bgcolor: '#f9f9f9', boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                      <Stack spacing={2.5}>
                        <Stack direction="row" alignItems="flex-start" spacing={2.5}>
                          <LocalShipping sx={{ fontSize: 24, color: '#e91e63', mt: 0.5 }} />
                          <Typography fontWeight={600} lineHeight={1.6}>Free delivery within Nairobi CBD</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="flex-start" spacing={2.5}>
                          <Sync sx={{ fontSize: 24, color: '#e91e63', mt: 0.5 }} />
                          <Typography fontWeight={600} lineHeight={1.6}>Most repairs completed within 5 working days. Complex cases may take up to 21 working days.</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="flex-start" spacing={2.5}>
                          <Security sx={{ fontSize: 24, color: '#e91e63', mt: 0.5 }} />
                          <Typography fontWeight={600} lineHeight={1.6}>1-year warranty</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="flex-start" spacing={2.5}>
                          <CreditCard sx={{ fontSize: 24, color: '#e91e63', mt: 0.5 }} />
                          <Typography fontWeight={600} lineHeight={1.6}>Secure payment</Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Box>

      {/* What Others Are Buying Section - Sliding Carousel */}
      {inStockPopular.length > 0 && (
        <>
          <Box sx={{ bgcolor: '#fff', py: 6, mt: 6 }}>
            <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 3, md: 6 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h5" fontWeight={800} color="#1a1a1a">
                  What others are buying
                </Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    sx={{ bgcolor: alpha('#e91e63', 0.1), color: '#e91e63', '&:hover': { bgcolor: alpha('#e91e63', 0.2) }, '&[disabled]': { color: '#ccc' } }}
                  >
                    <ChevronLeft />
                  </IconButton>
                  <IconButton
                    onClick={nextSlide}
                    disabled={currentSlide === totalSlides - 1}
                    sx={{ bgcolor: alpha('#e91e63', 0.1), color: '#e91e63', '&:hover': { bgcolor: alpha('#e91e63', 0.2) }, '&[disabled]': { color: '#ccc' } }}
                  >
                    <ChevronRight />
                  </IconButton>
                </Stack>
              </Stack>
              <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    transition: 'transform 0.5s ease-in-out',
                    transform: `translateX(-${(currentSlide * 100) / slidesToShow}%)`,
                    width: `${(inStockPopular.length / slidesToShow) * 100}%`,
                  }}
                >
                  {inStockPopular.map((p) => (
                    <Box key={p.id} sx={{ width: `${100 / slidesToShow}%`, px: 1 }}>
                      {renderPopularCard(p)}
                    </Box>
                  ))}
                </Box>
              </Box>
              {/* Indicators */}
              {totalSlides > 1 && (
                <Stack direction="row" justifyContent="center" spacing={0.5} mt={2}>
                  {Array.from({ length: totalSlides }).map((_, i) => (
                    <Box
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: i === currentSlide ? '#e91e63' : '#e0e0e0',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                    />
                  ))}
                </Stack>
              )}
              {/* Load More Button */}
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handleLoadMore}
                  sx={{
                    borderColor: '#e91e63',
                    color: '#e91e63',
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    borderRadius: 1,
                    '&:hover': { borderColor: '#c2185b', color: '#c2185b' },
                  }}
                >
                  Load More Products
                </Button>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              height: 4,
              bgcolor: '#e91e63',
              width: '100%',
              boxShadow: '0 2px 8px rgba(233,30,99,0.3)',
              background: 'linear-gradient(to right, transparent, #e91e63 20%, #e91e63 80%, transparent)',
              borderRadius: '2px',
              mx: 'auto',
              maxWidth: 1400,
              px: { xs: 3, md: 6 },
            }}
          />
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ fontWeight: 700, width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}