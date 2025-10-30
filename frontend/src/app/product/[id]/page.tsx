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
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/app/components/cartContext';
import TopNavBar from '@/app/components/TopNavBar';
import MainNavBar from '@/app/components/MainNavBar';

const API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/api'
    : 'https://cloudtech-c4ft.onrender.com/api';

const MEDIA_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : 'https://cloudtech-c4ft.onrender.com';

const CACHE_TIME = 15 * 60 * 1000; // 15 minutes

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

const ProductDetailPage = () => {
  const { id: rawId } = useParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? '';
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { cart, addToCart, updateQuantity } = useCart() as {
    cart: Record<string, { id: number; title: string; price: number; quantity: number; stock: number }>;
    addToCart: (item: any) => boolean;
    updateQuantity: (id: number, delta: number) => boolean;
  };

  const [product, setProduct] = useState<ProductT | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const mounted = useRef(true);

  const CACHE_KEY_PRODUCT = `product_${id}_cache`;
  const CACHE_KEY_RELATED = 'related_products_cache';

  // Load wishlist
  useEffect(() => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setIsWishlisted(wishlist.includes(id));
    } catch (err) {
      console.error('Error loading wishlist:', err);
    }
  }, [id]);

  // Load from cache
  useEffect(() => {
    if (!id) return;

    const cachedProduct = sessionStorage.getItem(CACHE_KEY_PRODUCT);
    const cachedRelated = sessionStorage.getItem(CACHE_KEY_RELATED);

    if (cachedProduct) {
      const { data, timestamp } = JSON.parse(cachedProduct);
      if (Date.now() - timestamp < CACHE_TIME) {
        setProduct(data);
      }
    }

    if (cachedRelated) {
      const { data, timestamp } = JSON.parse(cachedRelated);
      if (Date.now() - timestamp < CACHE_TIME) {
        const filtered = data.filter((p: ProductT) => p.id !== id && p.is_active);
        setRelatedProducts(filtered.slice(0, 6));
      }
    }
  }, [id]);

  // Fetch data
  useEffect(() => {
    if (!id) return;

    mounted.current = true;
    const fetchData = async () => {
      try {
        const [prodRes, relatedRes] = await Promise.all([
          fetch(`${API_BASE}/products/${id}/`, { cache: 'no-store' }),
          fetch(`${API_BASE}/products/`, { cache: 'no-store' }),
        ]);

        if (!prodRes.ok) throw new Error('Product not found');
        const prodData = await prodRes.json();

        const relatedData = await relatedRes.json();
        const all = Array.isArray(relatedData) ? relatedData : relatedData.results || [];
        const filtered = all.filter((p: ProductT) => p.id !== id && p.is_active);

        if (mounted.current) {
          setProduct(prodData);
          setRelatedProducts(filtered.slice(0, 6));
          setLoading(false);

          sessionStorage.setItem(CACHE_KEY_PRODUCT, JSON.stringify({ data: prodData, timestamp: Date.now() }));
          sessionStorage.setItem(CACHE_KEY_RELATED, JSON.stringify({ data: all, timestamp: Date.now() }));
        }
      } catch (err: any) {
        if (mounted.current) {
          setError(err.message || 'Failed to load product');
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      mounted.current = false;
    };
  }, [id]);

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const updated = isWishlisted
      ? wishlist.filter((pid: string) => pid !== id)
      : [...wishlist, id];
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setIsWishlisted(!isWishlisted);
  };

  const cartItem = cart[id];
  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    const success = addToCart({
      id: Number(product.id),
      title: product.title,
      price: product.final_price || product.price,
      quantity: quantity,
      stock: product.stock,
    });
    if (success) setQuantity(1);
  };

  const updateCartQuantity = (delta: number) => {
    if (!cartItem || !product) return;
    const newQty = cartItem.quantity + delta;
    if (newQty > 0 && newQty <= product.stock) {
      updateQuantity(Number(id), delta);
    }
  };

  // === FULL WHITE LOADING SCREEN ===
  if (loading) {
    return (
      <Box sx={{ bgcolor: '#fff', minHeight: '100vh', width: '100%' }}>
        <TopNavBar />
        <MainNavBar />
        <Container maxWidth="lg" sx={{ py: 5 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 4 }}>
            <Skeleton width={60} height={20} />
            <Skeleton width={80} height={20} />
            <Skeleton width={140} height={20} />
          </Breadcrumbs>

          {/* Main Card Skeleton */}
          <Box sx={{ bgcolor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #eaeaea', borderRadius: 1 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} divider={<Divider orientation="vertical" flexItem />}>
              {/* Image Section */}
              <Box sx={{ flex: '0 0 45%', p: { xs: 2, md: 4 } }}>
                <Skeleton variant="rectangular" height={420} sx={{ mb: 2, borderRadius: 1 }} />
                <Stack direction="row" spacing={1}>
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} variant="rectangular" width={56} height={56} sx={{ borderRadius: 1 }} />
                  ))}
                </Stack>
              </Box>

              {/* Details Section */}
              <Box sx={{ flex: 1, p: { xs: 3, md: 4 } }}>
                <Skeleton width="85%" height={40} sx={{ mb: 1 }} />
                <Skeleton width="40%" height={20} sx={{ mb: 2 }} />
                <Skeleton width="100%" height={80} sx={{ mb: 3 }} />
                <Skeleton width="60%" height={40} sx={{ mb: 3 }} />
                <Skeleton width="70%" height={40} sx={{ mb: 2 }} />
                <Stack direction="row" spacing={2}>
                  <Skeleton width="70%" height={56} />
                  <Skeleton width={56} height={56} />
                </Stack>
              </Box>
            </Stack>
          </Box>

          {/* Related Products Skeleton */}
          <Box sx={{ mt: 8 }}>
            <Skeleton width={200} height={36} sx={{ mb: 3 }} />
            <Stack direction="row" spacing={3}>
              {[...Array(4)].map((_, i) => (
                <Box key={i} sx={{ minWidth: 180 }}>
                  <Skeleton variant="rectangular" height={160} sx={{ mb: 1.5, borderRadius: 1 }} />
                  <Skeleton width="90%" height={20} />
                  <Skeleton width="60%" height={24} />
                </Box>
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={{ bgcolor: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <TopNavBar />
        <MainNavBar />
        <Container maxWidth="sm" sx={{ textAlign: 'center', py: 8 }}>
          <Alert severity="error" sx={{ mb: 3, fontSize: '1rem' }}>
            {error || 'Product not found'}
          </Alert>
          <Button
            variant="outlined"
            onClick={() => router.back()}
            sx={{
              color: '#1a1a1a',
              borderColor: '#1a1a1a',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              '&:hover': { borderColor: '#000', bgcolor: 'rgba(0,0,0,0.05)' },
            }}
          >
            Go Back
          </Button>
        </Container>
      </Box>
    );
  }

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
        {/* Breadcrumbs */}
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

        {/* Main Product Card */}
        <Box
          sx={{
            bgcolor: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #eaeaea',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} divider={<Divider orientation="vertical" flexItem />}>
            {/* IMAGE SECTION */}
            <Box sx={{ flex: '0 0 45%', p: { xs: 2, md: 4 }, bgcolor: '#fafafa' }}>
              <Box
                sx={{
                  height: { xs: 300, sm: 380, md: 440 },
                  bgcolor: '#fff',
                  border: '1px solid #eee',
                  borderRadius: 2,
                  overflow: 'hidden',
                  position: 'relative',
                  mb: 2,
                }}
              >
                <img
                  src={currentImage || '/images/fallback.jpg'}
                  alt={product.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    background: '#fff',
                  }}
                />

                {allImages.length > 1 && (
                  <>
                    <IconButton
                      size="small"
                      onClick={() => setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
                      sx={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(255,255,255,0.95)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        '&:hover': { bgcolor: '#fff' },
                      }}
                    >
                      <ArrowBackIos fontSize="small" sx={{ color: '#1a1a1a' }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setSelectedImageIndex((prev) => (prev + 1) % allImages.length)}
                      sx={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(255,255,255,0.95)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        '&:hover': { bgcolor: '#fff' },
                      }}
                    >
                      <ArrowForwardIos fontSize="small" sx={{ color: '#1a1a1a' }} />
                    </IconButton>
                  </>
                )}
              </Box>

              {allImages.length > 1 && (
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    overflowX: 'auto',
                    py: 1,
                    '&::-webkit-scrollbar': { display: 'none' },
                  }}
                >
                  {allImages.map((img, i) => (
                    <Box
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      sx={{
                        width: 64,
                        height: 64,
                        border: i === selectedImageIndex ? '2px solid #e91e63' : '1px solid #ddd',
                        borderRadius: 1.5,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        flexShrink: 0,
                        bgcolor: '#fff',
                        boxShadow: i === selectedImageIndex ? '0 0 0 1px #e91e63' : 'none',
                        transition: 'all 0.2s',
                      }}
                    >
                      <img
                        src={img.startsWith('http') ? img : `${MEDIA_BASE}${img}`}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            {/* DETAILS SECTION */}
            <Box sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '1.6rem', md: '2rem' },
                  fontWeight: 700,
                  color: '#1a1a1a',
                  mb: 1,
                  lineHeight: 1.3,
                }}
              >
                {product.title}
              </Typography>

              {product.brand && (
                <Typography
                  variant="body2"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: '#666',
                    mb: 2,
                    fontWeight: 500,
                  }}
                >
                  <Store fontSize="small" />
                  {product.brand.name}
                </Typography>
              )}

              {isLowStock && (
                <Alert
                  severity="warning"
                  icon={<LocalFireDepartment sx={{ color: '#e91e63' }} />}
                  sx={{
                    mb: 3,
                    py: 1,
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    bgcolor: '#fff8e1',
                    border: '1px solid #ffecb3',
                    color: '#a66400',
                    borderRadius: 1.5,
                  }}
                >
                  Only {product.stock} left in stock!
                </Alert>
              )}

              <Typography
                variant="body1"
                sx={{
                  color: '#444',
                  mb: 3,
                  lineHeight: 1.7,
                  fontSize: '1rem',
                }}
              >
                {product.description}
              </Typography>

              <Divider sx={{ mb: 3, borderColor: '#eee' }} />

              {/* Price */}
              <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                {product.discount && product.discount > 0 && (
                  <Typography
                    sx={{
                      fontSize: '1.1rem',
                      color: '#888',
                      textDecoration: 'line-through',
                    }}
                  >
                    KES {product.price.toLocaleString()}
                  </Typography>
                )}
                <Typography
                  sx={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: '#1a1a1a',
                  }}
                >
                  KES {finalPrice.toLocaleString()}
                </Typography>
                {product.discount && (
                  <Box
                    sx={{
                      bgcolor: '#e91e63',
                      color: '#fff',
                      px: 1.2,
                      py: 0.4,
                      borderRadius: 1,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    -{product.discount}%
                  </Box>
                )}
              </Stack>

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#1a1a1a' }}>
                    Color
                  </Typography>
                  <Stack direction="row" spacing={1.5}>
                    {product.colors.map((c) => (
                      <Box
                        key={c}
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          bgcolor: c.toLowerCase(),
                          border: '3px solid #fff',
                          boxShadow: '0 0 0 1px #ddd',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'scale(1.1)' },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Quantity */}
              <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                {cartItem ? (
                  <>
                    <IconButton
                      size="small"
                      onClick={() => updateCartQuantity(-1)}
                      disabled={cartItem.quantity <= 1}
                      sx={{
                        border: '1px solid #ddd',
                        color: '#1a1a1a',
                        '&:hover': { bgcolor: '#f9f9f9' },
                      }}
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                    <Typography sx={{ minWidth: 40, textAlign: 'center', fontWeight: 600, fontSize: '1.1rem' }}>
                      {cartItem.quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => updateCartQuantity(1)}
                      disabled={cartItem.quantity >= product.stock}
                      sx={{
                        border: '1px solid #ddd',
                        color: '#1a1a1a',
                        '&:hover': { bgcolor: '#f9f9f9' },
                      }}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton
                      size="small"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      sx={{
                        border: '1px solid #ddd',
                        color: '#1a1a1a',
                        '&:hover': { bgcolor: '#f9f9f9' },
                      }}
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                    <TextField
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
                      size="small"
                      inputProps={{ min: 1, max: product.stock, style: { textAlign: 'center', fontWeight: 600 } }}
                      sx={{
                        width: 72,
                        '& .MuiInputBase-root': {
                          height: 40,
                          fontSize: '1rem',
                          fontWeight: 600,
                        },
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      sx={{
                        border: '1px solid #ddd',
                        color: '#1a1a1a',
                        '&:hover': { bgcolor: '#f9f9f9' },
                      }}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Stack>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart sx={{ fontSize: 20 }} />}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  sx={{
                    flex: 1,
                    py: 1.8,
                    fontWeight: 700,
                    fontSize: '1rem',
                    textTransform: 'none',
                    bgcolor: '#1a1a1a',
                    color: '#fff',
                    borderRadius: 1.5,
                    '&:hover': { bgcolor: '#000' },
                    '&:disabled': { bgcolor: '#ccc', color: '#888' },
                  }}
                >
                  {cartItem ? 'Update Cart' : 'Add to Cart'}
                </Button>
                <IconButton
                  onClick={toggleWishlist}
                  sx={{
                    border: '1px solid #ddd',
                    width: 56,
                    height: 56,
                    borderRadius: 1.5,
                    color: isWishlisted ? '#e91e63' : '#666',
                    bgcolor: isWishlisted ? '#e91e63' : '#fff',
                    '&:hover': {
                      bgcolor: isWishlisted ? '#c2185b' : '#f9f9f9',
                      color: isWishlisted ? '#fff' : '#e91e63',
                    },
                  }}
                >
                  {isWishlisted ? <Favorite sx={{ fontSize: 22 }} /> : <FavoriteBorder sx={{ fontSize: 22 }} />}
                </IconButton>
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <Box sx={{ mt: 10 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 4 }}>
              You May Also Like
            </Typography>
            <Stack
              direction="row"
              spacing={3}
              sx={{
                overflowX: 'auto',
                pb: 2,
                '&::-webkit-scrollbar': { display: 'none' },
              }}
            >
              {relatedProducts.map((p) => {
                const img = p.cover_image?.startsWith('http') ? p.cover_image : `${MEDIA_BASE}${p.cover_image}`;
                const price = p.final_price || (p.discount ? p.price - (p.price * p.discount) / 100 : p.price);

                return (
                  <Box
                    key={p.id}
                    onClick={() => router.push(`/product/${p.id}`)}
                    sx={{
                      minWidth: 190,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateY(-4px)' },
                    }}
                  >
                    <Box
                      sx={{
                        height: 170,
                        bgcolor: '#fafafa',
                        border: '1px solid #eee',
                        borderRadius: 2,
                        overflow: 'hidden',
                        mb: 1.5,
                      }}
                    >
                      <img
                        src={img || '/images/fallback.jpg'}
                        alt={p.title}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.95rem' }}
                    >
                      {p.title}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, color: '#e91e63', fontSize: '1.1rem' }}
                    >
                      KES {price.toLocaleString()}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ProductDetailPage;