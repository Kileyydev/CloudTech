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
  Chip,
  Stack,
  useTheme,
  Snackbar,
  Alert,
  Skeleton,
  Divider,
  alpha,
} from '@mui/material';
import {
  Favorite,
  ShoppingCart,
  Add,
  Remove,
  Headset,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/components/cartContext';

type ProductImage = { image?: { url: string } } | { url: string } | string;

interface ProductT {
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
  type?: { value: string }[];        // e.g. Wireless, Wired
  connectivity?: { value: string }[]; // e.g. Bluetooth, 3.5mm
  colors?: { value: string }[];
}

const CACHE_KEY = 'audio_accessories_cache_v3';
const CACHE_DURATION = 1000 * 60 * 5; // 5 mins

const AudioAccessoriesSection = () => {
  const theme = useTheme();
  const router = useRouter();
  const { cart, addToCart, updateQuantity } = useCart();

  const [products, setProducts] = useState<ProductT[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setProducts(data);
            setLoading(false);
            return;
          }
        }

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE;
        if (!API_BASE_URL) throw new Error('API base URL not defined');

        const filters = [
          'category__slug=audio',
          'categories__slug=audio',
          'category_slug=audio',
          'category=audio',
        ];

        let finalProducts: ProductT[] = [];

        for (const filter of filters) {
          const res = await fetch(`${API_BASE_URL}/products/?${filter}`, {
            cache: 'no-store',
          });
          if (!res.ok) continue;

          const text = await res.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch {
            continue;
          }

          const list = Array.isArray(data)
            ? data
            : data.results || data.data || [];
          if (list.length > 0) {
            finalProducts = list;
            break;
          }
        }

        if (finalProducts.length === 0)
          throw new Error('No audio accessories found');

        setProducts(finalProducts);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: finalProducts, timestamp: Date.now() })
        );
      } catch (err: any) {
        console.error('Audio fetch failed:', err);
        setSnackbar({
          open: true,
          message: err.message || 'Failed to load audio accessories',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('wishlist');
      if (stored) setWishlist(new Set(JSON.parse(stored)));
    } catch (e) {
      console.error('Failed to load wishlist', e);
    }
  }, []);

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' = 'success'
  ) => setSnackbar({ open: true, message, severity });

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  const handleWishlistToggle = (id: number) => {
    setWishlist((prev) => {
      const updated = new Set(prev);
      updated.has(id) ? updated.delete(id) : updated.add(id);
      localStorage.setItem('wishlist', JSON.stringify(Array.from(updated)));
      return updated;
    });
  };

  const handleAddToCart = (product: ProductT) => {
    if (product.stock <= 0) return showSnackbar('Out of stock', 'error');

    const existing = cart[product.id];
    const newQty = existing ? existing.quantity + 1 : 1;
    if (newQty > product.stock)
      return showSnackbar(`Only ${product.stock} available`, 'error');

    const priceToUse =
      product.final_price && product.discount ? product.final_price : product.price;

    addToCart({
      id: product.id,
      title: product.title,
      price: priceToUse,
      quantity: 1,
      stock: product.stock,
    });

    showSnackbar(
      existing ? `+1 ${product.title}` : `${product.title} added to cart!`
    );
  };

  const handleDecreaseQuantity = (id: number) => {
    const item = cart[id];
    if (!item) return;
    if (item.quantity <= 1) {
      updateQuantity(id, -1);
      showSnackbar(`${item.title} removed`);
    } else {
      updateQuantity(id, -1);
      showSnackbar('Quantity updated');
    }
  };

  const handleViewCart = () => {
    if (Object.keys(cart).length === 0)
      return showSnackbar('Your cart is empty', 'error');
    router.push('/cart');
  };

  const getCartItemCount = () =>
    Object.values(cart).reduce((sum, i) => sum + i.quantity, 0);

  const getImageUrl = (img: ProductImage | undefined): string => {
    if (!img) return '/images/fallback.jpg';
    if (typeof img === 'string')
      return img.startsWith('http')
        ? img
        : `${process.env.NEXT_PUBLIC_MEDIA_BASE}${img}`;
    if ('url' in img)
      return img.url.startsWith('http')
        ? img.url
        : `${process.env.NEXT_PUBLIC_MEDIA_BASE}${img.url}`;
    if ('image' in img) return getImageUrl(img.image);
    return '/images/fallback.jpg';
  };

  const renderSkeletonCard = (_: any, index: number) => (
    <Card
      key={index}
      sx={{
        width: 260,
        height: 380,
        flex: '0 0 auto',
        bgcolor: '#fff',
        mr: 2,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}
    >
      <Skeleton variant="rectangular" width="100%" height={160} />
      <CardContent sx={{ p: 2 }}>
        <Skeleton width="85%" height={24} sx={{ mb: 1 }} />
        <Skeleton width="70%" height={18} sx={{ mb: 1.5 }} />
        <Skeleton width="50%" height={28} />
      </CardContent>
    </Card>
  );

  const renderCard = (product: ProductT) => {
    const imageSrc = getImageUrl(product.cover_image);
    const galleryImages = product.images?.map(getImageUrl).filter(Boolean) || [];
    const cartItem = cart[product.id];
    const hasDiscount = product.discount && product.discount > 0;
    const displayPrice = hasDiscount && product.final_price ? product.final_price : product.price;

    return (
      <Card
        key={product.id}
        sx={{
          width: 260,
          height: 400,
          flex: '0 0 auto',
          bgcolor: '#fff',
          mr: 2,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Wishlist */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 10,
            bgcolor: '#fff',
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleWishlistToggle(product.id);
          }}
        >
          <Favorite
            sx={{
              color: wishlist.has(product.id) ? '#e91e63' : '#bbb',
              fontSize: 18,
            }}
          />
        </Box>

        {/* Cover Image */}
        <Box
          sx={{
            width: '100%',
            height: 160,
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
          }}
          onClick={() => router.push(`/product/${product.id}`)}
        >
          <CardMedia
            component="img"
            image={imageSrc}
            alt={product.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: '0.4s',
            }}
          />
          {hasDiscount && (
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                left: 10,
                bgcolor: '#e91e63',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.75rem',
                px: 1.2,
                py: 0.4,
                borderRadius: 1,
                boxShadow: '0 3px 10px rgba(233,30,99,0.4)',
              }}
            >
              {product.discount}% OFF
            </Box>
          )}
        </Box>

        <CardContent sx={{ p: 2, pb: 1.5 }}>
          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: '#1a1a1a',
              mb: 0.5,
              fontSize: '0.95rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {product.title}
          </Typography>

          {/* Brand */}
          {product.brand && (
            <Stack direction="row" alignItems="center" gap={0.8} mb={1}>
              <Headset sx={{ fontSize: 15, color: '#999' }} />
              <Typography
                variant="body2"
                sx={{ color: '#444', fontWeight: 600, fontSize: '0.8rem' }}
              >
                {product.brand.name}
              </Typography>
            </Stack>
          )}

          {/* Specs */}
          <Stack spacing={0.8} mb={1.5}>
            {Array.isArray(product.type) && product.type.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                <Typography
                  sx={{ fontSize: '0.75rem', color: '#666', fontWeight: 600, mr: 0.5 }}
                >
                  Type:
                </Typography>
                {product.type.map((t, i) => (
                  <Chip
                    key={i}
                    label={t.value}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      bgcolor: alpha('#DC1A8A', 0.12),
                      color: '#DC1A8A',
                      fontWeight: 600,
                    }}
                  />
                ))}
              </Box>
            )}

            {Array.isArray(product.connectivity) && product.connectivity.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                <Typography
                  sx={{ fontSize: '0.75rem', color: '#666', fontWeight: 600, mr: 0.5 }}
                >
                  Connectivity:
                </Typography>
                {product.connectivity.map((c, i) => (
                  <Chip
                    key={i}
                    label={c.value}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      bgcolor: alpha('#1e88e5', 0.12),
                      color: '#1e88e5',
                      fontWeight: 600,
                    }}
                  />
                ))}
              </Box>
            )}

            {Array.isArray(product.colors) && product.colors.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography
                  sx={{ fontSize: '0.75rem', color: '#666', fontWeight: 600, mr: 0.5 }}
                >
                  Color:
                </Typography>
                {product.colors.map((col, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: col.value.toLowerCase(),
                      border: '1.5px solid #ddd',
                    }}
                  />
                ))}
              </Box>
            )}
          </Stack>

          <Divider sx={{ my: 1 }} />

          {/* Price */}
          <Box sx={{ mb: 1.5 }}>
            {hasDiscount ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  sx={{
                    textDecoration: 'line-through',
                    color: '#999',
                    fontSize: '0.8rem',
                  }}
                >
                  was KES {product.price.toLocaleString()}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: '#e91e63',
                    fontSize: '1rem',
                  }}
                >
                  now KES {displayPrice.toLocaleString()}
                </Typography>
              </Stack>
            ) : (
              <Typography
                sx={{
                  fontWeight: 800,
                  color: '#1a1a1a',
                  fontSize: '1rem',
                }}
              >
                KES {displayPrice.toLocaleString()}
              </Typography>
            )}
          </Box>

          {/* Cart */}
          {cartItem ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDecreaseQuantity(product.id);
                }}
                sx={{ color: '#e91e63', width: 30, height: 30 }}
              >
                <Remove sx={{ fontSize: 14 }} />
              </IconButton>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', minWidth: 20, textAlign: 'center' }}>
                {cartItem.quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
                disabled={cartItem.quantity >= product.stock}
                sx={{
                  color: '#e91e63',
                  width: 30,
                  height: 30,
                  '&[disabled]': { color: '#ccc' },
                }}
              >
                <Add sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ) : (
            <Button
              fullWidth
              size="small"
              startIcon={<ShoppingCart sx={{ fontSize: 16 }} />}
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
              disabled={product.stock === 0}
              sx={{
                bgcolor: '#e91e63',
                color: '#fff',
                fontWeight: 700,
                textTransform: 'none',
                py: 0.8,
                fontSize: '0.8rem',
                '&[disabled]': { bgcolor: '#eee', color: '#999' },
              }}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          )}
        </CardContent>

        {/* Gallery Preview */}
        {galleryImages.length > 0 && (
          <Box sx={{ px: 1.5, pb: 1.5 }}>
            <Stack direction="row" spacing={0.8}>
              {galleryImages.slice(0, 3).map((src, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 40,
                    height: 40,
                    overflow: 'hidden',
                    border: '1.5px solid #eee',
                    cursor: 'pointer',
                    transition: '0.2s',
                  }}
                  onClick={() => router.push(`/product/${product.id}`)}
                >
                  <img
                    src={src}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              ))}
              {galleryImages.length > 3 && (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  +{galleryImages.length - 3}
                </Box>
              )}
            </Stack>
          </Box>
        )}
      </Card>
    );
  };

  return (
    <Box sx={{ bgcolor: '#fdfdfd', py: { xs: 2.5, md: 4 }, px: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Headset sx={{ fontSize: 32, color: '#e91e63' }} />
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: '#1a1a1a' }}
          >
            Audio Accessories
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<ShoppingCart sx={{ fontSize: 16 }} />}
          onClick={handleViewCart}
          sx={{
            bgcolor: '#000',
            color: '#fff',
            fontWeight: 700,
            textTransform: 'none',
            px: 2.5,
            py: 1,
            fontSize: '0.85rem',
          }}
          disabled={getCartItemCount() === 0}
        >
          Cart ({getCartItemCount()})
        </Button>
      </Box>

      {/* Scrollable Cards */}
      <Box
        sx={{
          display: 'flex',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          pb: 1,
        }}
      >
        {loading
          ? Array.from({ length: 4 }).map(renderSkeletonCard)
          : products.length === 0
          ? (
              <Typography
                color="text.secondary"
                sx={{ textAlign: 'center', py: 5, width: '100%' }}
              >
                No audio accessories available right now.
              </Typography>
            )
          : products.filter(p => p.stock > 0).map(renderCard)}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            fontWeight: 600,
            ...(snackbar.severity === 'success' && {
              bgcolor: '#4caf50',
              color: '#fff',
            }),
            ...(snackbar.severity === 'error' && {
              bgcolor: '#f44336',
              color: '#fff',
            }),
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AudioAccessoriesSection;