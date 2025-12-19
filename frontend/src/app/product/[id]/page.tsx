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
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  alpha,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  LocalShipping,
  Sync,
  Security,
  ChevronLeft,
  ChevronRight,
  Home,
  Message,
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
  categories?: { name: string; slug?: string }[];
  variants?: Variant[];
  colors?: { value: string }[];
  storage_options?: { value: string }[];
  ram_options?: { value: string }[];
  features?: Record<string, any>;
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
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const [popularProducts, setPopularProducts] = useState<PopularProductT[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const CACHE_KEY = 'popular_products_cache_v1';
  const CACHE_DURATION = 1000 * 60 * 5;
  const slidesToShow = 4;

  const WHATSAPP_PHONE = '254722244482';

  const keyFeatures = useMemo(() => {
    if (!product) return [];
    const feats: string[] = [];

    if (product.ram_options && product.ram_options.length > 0) {
      feats.push(`RAM: ${product.ram_options.map((o: any) => o.value).join(', ')}`);
    }

    if (product.storage_options && product.storage_options.length > 0) {
      feats.push(`Internal Storage: ${product.storage_options.map((o: any) => o.value).join(', ')}`);
    }

    if (product.colors && product.colors.length > 0) {
      feats.push(`Colors: ${product.colors.map((o: any) => o.value).join(', ')}`);
    }

    if (product.features) {
      const featureOrder = ['display', 'os', 'chipset', 'main_camera', 'selfie_lens', 'connectivity', 'battery'];
      featureOrder.forEach(key => {
        if (product.features && product.features[key]) {
          const formattedKey = key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          feats.push(`${formattedKey}: ${product.features[key]}`);
        }
      });

      Object.entries(product.features).forEach(([key, value]) => {
        if (!featureOrder.includes(key) && value) {
          const formattedKey = key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          feats.push(`${formattedKey}: ${value}`);
        }
      });
    }

    return feats;
  }, [product]);

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

        const colors = Array.from(new Set(data.variants?.map((v: any) => v.color).filter(Boolean))) as string[];
        const storages = Array.from(new Set(data.variants?.map((v: any) => v.storage).filter(Boolean)))
          .filter(Boolean)
          .sort((a: any, b: any) => parseInt(a) - parseInt(b)) as string[];

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

  useEffect(() => {
    if (!product?.variants || (!selectedColor && !selectedStorage)) return;
    const match = product.variants.find((v: any) =>
      (!selectedColor || v.color === selectedColor) &&
      (!selectedStorage || v.storage === selectedStorage) &&
      v.stock > 0
    );
    if (match) setSelectedVariant(match);
    else setSelectedVariant(null);
  }, [selectedColor, selectedStorage, product?.variants]);

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
        const list = Array.isArray(data) ? data : data.results || data.data || [];
        if (list.length === 0) throw new Error('No popular products found');

        setPopularProducts(list);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: list, timestamp: Date.now() }));
      } catch (err: any) {
        console.error('Popular products fetch failed:', err);
      } finally {
        setLoadingPopular(false);
      }
    };
    loadPopularProducts();
  }, []);

  const allImages = product
    ? [getImageUrl(product.cover_image), ...(product.images || []).map((i: any) => getImageUrl(i))]
    : [];

  const toggleWishlist = () => {
    if (!product) return;
    const updated = new Set(wishlist);
    updated.has(product.id) ? updated.delete(product.id) : updated.add(product.id);
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(Array.from(updated)));
    setSnackbar({
      open: true,
      message: updated.has(product.id) ? 'Added to wishlist ❤️' : 'Removed from wishlist',
      severity: 'success',
    });
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

  const handleOrderViaWhatsApp = () => {
    if (!product || !selectedVariant) {
      setSnackbar({ open: true, message: 'Please select color and storage first', severity: 'error' });
      return;
    }
    const message = `Hi, I'd like to order ${product.title} (${selectedColor}, ${selectedStorage}) for KES ${selectedVariant.price.toLocaleString()}.`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % Math.ceil(popularProducts.length / slidesToShow));
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(popularProducts.length / slidesToShow)) % Math.ceil(popularProducts.length / slidesToShow));

  const handleLoadMore = () => router.push('/products');
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setTabValue(newValue);
  const handleBreadcrumbClick = (path: string) => router.push(path);

  if (loading || !product) {
    return (
      <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 8 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 3, md: 6 } }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4} alignItems="flex-start">
            <Box sx={{ flex: 1, height: { xs: 250, sm: 350, md: 450 }, bgcolor: '#fff', borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }} />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ height: { xs: 40, md: 60 }, bgcolor: '#fff', borderRadius: 2, mb: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
              <Box sx={{ height: { xs: 60, md: 80 }, bgcolor: '#fff', borderRadius: 2, mb: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
              <Box sx={{ height: { xs: 80, md: 100 }, bgcolor: '#fff', borderRadius: 2, mb: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
              <Box sx={{ height: { xs: 100, md: 120 }, bgcolor: '#fff', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
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
  const isOutOfStock = !selectedVariant || !inStock;

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    ...(product.categories || []).map((cat: any) => ({ label: cat.name, href: `/category/${cat.slug || cat.name.toLowerCase()}` })),
    { label: product.title, href: '#' },
  ];

  const getPopularImageUrl = (img: ProductImage | undefined): string => {
    if (!img) return '/images/fallback.jpg';
    if (typeof img === 'string') return img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_MEDIA_BASE}${img}`;
    if ('url' in img) return img.url.startsWith('http') ? img.url : `${process.env.NEXT_PUBLIC_MEDIA_BASE}${img.url}`;
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
          borderRadius: 2,
          transition: 'box-shadow 0.3s ease',
          '&:hover': { boxShadow: '0 12px 40px rgba(0,0,0,0.15)', transform: 'translateY(-4px)' },
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            height: 150,
            p: 2,
            cursor: 'pointer',
            bgcolor: '#f8f9fa',
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
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          />
          {hasDiscount && (
            <Chip
              label={`${p.discount}% OFF`}
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                bgcolor: '#e91e63',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.75rem',
                height: 24,
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(233,30,99,0.3)',
              }}
            />
          )}
        </Box>
        <CardContent sx={{ p: 3, pb: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography
            variant="h6"
            fontWeight={700}
            color="#1a1a1a"
            mb={1}
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              cursor: 'pointer',
              '&:hover': { color: '#e91e63' },
            }}
            onClick={() => router.push(`/product/${p.id}`)}
          >
            {p.title}
          </Typography>
          {p.brand && (
            <Typography variant="body2" color="#666" fontWeight={600} mb={2}>
              {p.brand.name}
            </Typography>
          )}
          <Box sx={{ mb: 2 }}>
            {hasDiscount ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" color="#999" sx={{ textDecoration: 'line-through' }}>
                  KES {p.price.toLocaleString()}
                </Typography>
                <Typography variant="h6" fontWeight={800} color="#e91e63">
                  KES {displayPrice.toLocaleString()}
                </Typography>
              </Stack>
            ) : (
              <Typography variant="h6" fontWeight={800} color="#1a1a1a">
                KES {displayPrice.toLocaleString()}
              </Typography>
            )}
          </Box>
          <Button
            fullWidth
            variant="contained"
            startIcon={<ShoppingCart sx={{ fontSize: 18 }} />}
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
              py: 1.5,
              borderRadius: 1,
              boxShadow: '0 2px 8px rgba(233,30,99,0.2)',
              '&:hover': { bgcolor: '#c2185b', boxShadow: '0 4px 12px rgba(233,30,99,0.3)' },
              '&[disabled]': { bgcolor: '#f5f5f5', color: '#999' },
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
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', color: '#1a1a1a' }}>
      <Box sx={{ bgcolor: '#fff', py: { xs: 1.5, md: 2 }, borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 3, md: 6 } }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
            {breadcrumbItems.map((item, index) => (
              <Link
                key={index}
                underline="hover"
                color="inherit"
                onClick={() => item.href !== '#' && handleBreadcrumbClick(item.href)}
                sx={{ cursor: 'pointer', '&:hover': { color: '#e91e63' } }}
              >
                {index === 0 ? <Home sx={{ fontSize: { xs: 14, md: 16 }, mr: 0.5 }} /> : null}
                {item.label}
              </Link>
            ))}
          </Breadcrumbs>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 3, md: 6 }, py: { xs: 3, lg: 6 } }}>
        <Stack spacing={{ xs: 4, md: 6 }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={{ xs: 4, md: 6 }} alignItems="flex-start">
            <Box sx={{ flex: 1, position: 'sticky', top: 100, alignSelf: 'flex-start' }}>
              <Box
                sx={{
                  bgcolor: '#fff',
                  borderRadius: { xs: 2, md: 3 },
                  overflow: 'hidden',
                  mb: { xs: 2, md: 3 },
                  boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                }}
              >
                <Box sx={{ position: 'relative', p: { xs: 1.5, md: 4 }, height: { xs: 250, sm: 350, md: 450, lg: 500 } }}>
                  <Image
                    src={allImages[selectedImageIndex] || '/images/fallback.jpg'}
                    alt={product.title}
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                  {allImages.length > 1 && (
                    <>
                      <IconButton
                        sx={{
                          position: 'absolute',
                          left: { xs: 4, md: 16 },
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255,255,255,0.95)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          '&:hover': { bgcolor: '#fff' },
                          zIndex: 1,
                        }}
                        onClick={() => setSelectedImageIndex((i) => Math.max(0, (i - 1 + allImages.length) % allImages.length))}
                      >
                        <ChevronLeft />
                      </IconButton>
                      <IconButton
                        sx={{
                          position: 'absolute',
                          right: { xs: 4, md: 16 },
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255,255,255,0.95)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          '&:hover': { bgcolor: '#fff' },
                          zIndex: 1,
                        }}
                        onClick={() => setSelectedImageIndex((i) => (i + 1) % allImages.length)}
                      >
                        <ChevronRight />
                      </IconButton>
                    </>
                  )}
                </Box>
              </Box>
              {allImages.length > 1 && (
                <Stack direction="row" spacing={{ xs: 1, md: 2 }} justifyContent="center" mb={4}>
                  {allImages.map((src, i) => (
                    <Box
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      sx={{
                        width: { xs: 50, sm: 60, md: 70 },
                        height: { xs: 50, sm: 60, md: 70 },
                        border: '2px solid transparent',
                        borderRadius: { xs: 1.5, md: 2 },
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: selectedImageIndex === i ? '0 4px 12px rgba(233,30,99,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                        '&:hover': { borderColor: '#e91e63', transform: 'scale(1.05)' },
                      }}
                    >
                      <Image src={src} alt="" fill style={{ objectFit: 'cover' }} />
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Card sx={{ bgcolor: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', borderRadius: { xs: 2, md: 3 }, p: { xs: 2, md: 3, lg: 4 } }}>
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                  <Stack spacing={{ xs: 3, md: 4 }}>
                    <Box>
                      <Typography
                        variant="h4"
                        fontWeight={800}
                        lineHeight={1.1}
                        color="#1a1a1a"
                        mb={{ xs: 1, md: 1.5 }}
                        sx={{ typography: { xs: 'h5', md: 'h4' } }}
                      >
                        {product.title}
                      </Typography>
                      {product.brand && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2" color="#666" fontWeight={600}>
                            by {product.brand.name}
                          </Typography>
                        </Stack>
                      )}
                    </Box>

                    <Box>
                      <Box sx={{ mb: { xs: 1, md: 2 } }}>
                        {hasDiscount && (
                          <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 2 }}>
                            <Typography
                              variant="body1"
                              color="#999"
                              sx={{
                                textDecoration: 'line-through',
                                fontSize: { xs: '1rem', md: '1.125rem' },
                                typography: { xs: 'body1', md: 'h6' },
                              }}
                            >
                              KES {originalPrice.toLocaleString()}
                            </Typography>
                            <Chip
                              label={`Save KES ${savings.toLocaleString()}`}
                              sx={{
                                bgcolor: alpha('#e91e63', 0.1),
                                color: '#e91e63',
                                fontWeight: 700,
                                fontSize: { xs: '0.75rem', md: '0.875rem' },
                                height: { xs: 24, md: 28 },
                                borderRadius: { xs: 12, md: 14 },
                              }}
                            />
                          </Stack>
                        )}
                        <Typography
                          variant="h3"
                          fontWeight={800}
                          color="#1a1a1a"
                          sx={{ typography: { xs: 'h4', md: 'h3' } }}
                        >
                          KES {displayPrice.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ borderColor: '#e0e0e0', my: { xs: 1, md: 2 } }} />

                    <Stack spacing={{ xs: 2, md: 3 }}>
                      {uniqueColors.length > 0 && (
                        <FormControl fullWidth variant="outlined">
                          <InputLabel sx={{ fontWeight: 700, color: '#1a1a1a' }}>Select Color</InputLabel>
                          <Select
                            value={selectedColor}
                            label="Select Color"
                            onChange={(e) => setSelectedColor(e.target.value as string)}
                            sx={{
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0', borderWidth: 1 },
                              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#e91e63' },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#e91e63' },
                              borderRadius: 2,
                            }}
                          >
                            {uniqueColors.map((c) => (
                              <MenuItem key={c} value={c}>{c}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                      {uniqueStorages.length > 0 && (
                        <FormControl fullWidth variant="outlined">
                          <InputLabel sx={{ fontWeight: 700, color: '#1a1a1a' }}>Select Storage</InputLabel>
                          <Select
                            value={selectedStorage}
                            label="Select Storage"
                            onChange={(e) => setSelectedStorage(e.target.value as string)}
                            sx={{
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0', borderWidth: 1 },
                              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#e91e63' },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#e91e63' },
                              borderRadius: 2,
                            }}
                          >
                            {uniqueStorages.map((s) => (
                              <MenuItem key={s} value={s}>{s}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Stack>

                    {isOutOfStock && (
                      <Alert severity="error" icon={false} sx={{ borderRadius: 2, fontWeight: 600, px: { xs: 2, md: 3 }, py: { xs: 1, md: 1.5 }, bgcolor: alpha('#d32f2f', 0.1), color: '#d32f2f' }}>
                        This combination is out of stock. Please select another color or storage option.
                      </Alert>
                    )}

                    <Stack spacing={{ xs: 2, md: 3 }}>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<ShoppingCart sx={{ fontSize: { xs: 20, md: 24 } }} />}
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        sx={{
                          height: { xs: 48, md: 56 },
                          bgcolor: '#e91e63',
                          color: '#fff',
                          py: { xs: 1.5, md: 2 },
                          fontSize: { xs: '1rem', md: '1.125rem' },
                          fontWeight: 700,
                          textTransform: 'none',
                          borderRadius: 2,
                          boxShadow: '0 4px 20px rgba(233,30,99,0.3)',
                          '&:hover': { bgcolor: '#c2185b', boxShadow: '0 8px 25px rgba(233,30,99,0.4)', transform: 'translateY(-1px)' },
                          '&[disabled]': { bgcolor: '#f5f5f5', color: '#999', boxShadow: 'none' },
                        }}
                      >
                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<Message sx={{ fontSize: { xs: 20, md: 24 } }} />}
                        onClick={handleOrderViaWhatsApp}
                        disabled={isOutOfStock}
                        sx={{
                          height: { xs: 48, md: 56 },
                          borderColor: '#25D366',
                          color: '#25D366',
                          py: { xs: 1.5, md: 2 },
                          fontSize: { xs: '1rem', md: '1.125rem' },
                          fontWeight: 700,
                          textTransform: 'none',
                          borderRadius: 2,
                          '&:hover': { borderColor: '#128C7E', color: '#128C7E', bgcolor: alpha('#25D366', 0.04) },
                          '&[disabled]': { borderColor: '#ccc', color: '#ccc' },
                        }}
                      >
                        Order via WhatsApp
                      </Button>
                      <IconButton
                        onClick={toggleWishlist}
                        size="large"
                        sx={{
                          border: '2px solid #e0e0e0',
                          width: { xs: 56, md: 64 },
                          height: { xs: 56, md: 64 },
                          color: wishlist.has(product.id) ? '#e91e63' : '#666',
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': { borderColor: '#e91e63', color: '#e91e63', transform: 'scale(1.05)', boxShadow: '0 4px 12px rgba(233,30,99,0.2)' },
                        }}
                      >
                        {wishlist.has(product.id) ? <Favorite sx={{ fontSize: { xs: 24, md: 28 } }} /> : <FavoriteBorder sx={{ fontSize: { xs: 24, md: 28 } }} />}
                      </IconButton>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Stack>

          {(product.description || keyFeatures.length > 0) && (
            <Card sx={{ bgcolor: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', borderRadius: { xs: 2, md: 3 } }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="product details tabs" variant="fullWidth" sx={{ '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', py: { xs: 1.5, md: 2 } } }}>
                  {product.description && <Tab label="Description" />}
                  {keyFeatures.length > 0 && <Tab label="Specifications" />}
                </Tabs>
              </Box>
              <CardContent sx={{ p: { xs: 2, md: 3, lg: 4 } }}>
                {tabValue === 0 && product.description && (
                  <Typography variant="body1" color="#444" lineHeight={1.8} sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
                    {product.description}
                  </Typography>
                )}
                {tabValue === 1 && keyFeatures.length > 0 && (
                  <Stack component="ul" spacing={{ xs: 1.5, md: 2 }} sx={{ pl: 0, listStyle: 'none' }}>
                    {keyFeatures.map((feat, i) => {
                      const [keyPart, ...valueParts] = feat.split(': ');
                      const valuePart = valueParts.join(': ');
                      return (
                        <Box
                          key={i}
                          component="li"
                          sx={{
                            position: 'relative',
                            pl: { xs: 3, md: 4 },
                            py: { xs: 1, md: 1.5 },
                            bgcolor: alpha('#e91e63', 0.02),
                            borderRadius: { xs: 1, md: 1.5 },
                            '&:before': {
                              content: '"•"',
                              position: 'absolute',
                              left: { xs: 8, md: 12 },
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: '#e91e63',
                              fontSize: { xs: '1.1rem', md: '1.3rem' },
                              lineHeight: 1,
                            },
                          }}
                        >
                          <Typography
                            component="span"
                            variant="subtitle1"
                            fontWeight={700}
                            color="#1a1a1a"
                            sx={{ mr: 1, typography: { xs: 'body2', md: 'subtitle1' } }}
                          >
                            {keyPart}:
                          </Typography>
                          <Typography component="span" variant="body1" color="#444" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
                            {valuePart}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>
          )}

          <Card sx={{ bgcolor: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', borderRadius: { xs: 2, md: 3 }, overflow: 'hidden', mt: { xs: 3, md: 4 } }}>
            <CardContent sx={{ p: 0 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0} divider={<Divider orientation="vertical" flexItem />}>
                <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, md: 2 }} sx={{ flex: 1, p: { xs: 2, md: 3 }, borderRight: { xs: 'none', sm: '1px solid #e0e0e0' } }}>
                  <LocalShipping sx={{ fontSize: { xs: 24, md: 32 }, color: '#e91e63' }} />
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="#1a1a1a"
                      mb={0.5}
                      sx={{ typography: { xs: 'subtitle1', md: 'h6' } }}
                    >
                      Free Delivery
                    </Typography>
                    <Typography variant="body2" color="#666">Within Nairobi CBD</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, md: 2 }} sx={{ flex: 1, p: { xs: 2, md: 3 }, borderRight: { xs: 'none', sm: '1px solid #e0e0e0' } }}>
                  <Sync sx={{ fontSize: { xs: 24, md: 32 }, color: '#e91e63' }} />
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="#1a1a1a"
                      mb={0.5}
                      sx={{ typography: { xs: 'subtitle1', md: 'h6' } }}
                    >
                      Fast Repairs
                    </Typography>
                    <Typography variant="body2" color="#666">5 working days or less</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, md: 2 }} sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
                  <Security sx={{ fontSize: { xs: 24, md: 32 }, color: '#e91e63' }} />
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="#1a1a1a"
                      mb={0.5}
                      sx={{ typography: { xs: 'subtitle1', md: 'h6' } }}
                    >
                      1-Year Warranty
                    </Typography>
                    <Typography variant="body2" color="#666">Peace of mind guaranteed</Typography>
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      {inStockPopular.length > 0 && (
        <Box sx={{ bgcolor: '#f8f9fa', py: { xs: 6, md: 8 }, mt: { xs: 4, md: 6 } }}>
          <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 3, md: 6 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={{ xs: 3, md: 5 }}>
              <Typography
                variant="h4"
                fontWeight={800}
                color="#1a1a1a"
                sx={{ typography: { xs: 'h5', md: 'h4' } }}
              >
                What others are buying
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton onClick={prevSlide} disabled={currentSlide === 0} sx={{ bgcolor: alpha('#e91e63', 0.1), color: '#e91e63', width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 }, '&:hover': { bgcolor: alpha('#e91e63', 0.2) }, '&[disabled]': { color: '#ccc', bgcolor: 'transparent' } }}>
                  <ChevronLeft />
                </IconButton>
                <IconButton onClick={nextSlide} disabled={currentSlide === totalSlides - 1} sx={{ bgcolor: alpha('#e91e63', 0.1), color: '#e91e63', width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 }, '&:hover': { bgcolor: alpha('#e91e63', 0.2) }, '&[disabled]': { color: '#ccc', bgcolor: 'transparent' } }}>
                  <ChevronRight />
                </IconButton>
              </Stack>
            </Stack>
            <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: { xs: 2, md: 3 } }}>
              <Box
                sx={{
                  display: 'flex',
                  transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: `translateX(-${(currentSlide * 100) / slidesToShow}%)`,
                  width: `${(inStockPopular.length / slidesToShow) * 100}%`,
                }}
              >
                {inStockPopular.map((p) => (
                  <Box key={p.id} sx={{ width: `${100 / slidesToShow}%`, px: { xs: 0.5, md: 1 } }}>
                    {renderPopularCard(p)}
                  </Box>
                ))}
              </Box>
            </Box>
            {totalSlides > 1 && (
              <Stack direction="row" justifyContent="center" spacing={{ xs: 0.5, md: 1 }} mt={{ xs: 2, md: 3 }}>
                {Array.from({ length: totalSlides }).map((_, i) => (
                  <Box
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    sx={{
                      width: { xs: 10, md: 12 },
                      height: { xs: 10, md: 12 },
                      borderRadius: '50%',
                      bgcolor: i === currentSlide ? '#e91e63' : alpha('#e91e63', 0.3),
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': { bgcolor: '#e91e63', transform: 'scale(1.2)' },
                    }}
                  />
                ))}
              </Stack>
            )}
            <Box sx={{ textAlign: 'center', mt: { xs: 3, md: 5 } }}>
              <Button
                variant="outlined"
                startIcon={<ShoppingCart sx={{ fontSize: { xs: 18, md: 20 } }} />}
                onClick={handleLoadMore}
                sx={{
                  borderColor: '#e91e63',
                  color: '#e91e63',
                  fontWeight: 700,
                  px: { xs: 4, md: 6 },
                  py: { xs: 1.5, md: 2 },
                  borderRadius: 2,
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  '&:hover': { borderColor: '#c2185b', color: '#c2185b', boxShadow: '0 4px 12px rgba(233,30,99,0.2)' },
                }}
              >
                Load More Products
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ fontWeight: 700, width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}