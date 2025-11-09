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
  type?: { value: string }[];
  connectivity?: { value: string }[];
  colors?: { value: string }[];
}

const CACHE_KEY = 'apple_accessories_cache_v3';
const CACHE_DURATION = 1000 * 60 * 5; // 5 mins

const AppleAccessoriesSection = () => {
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
          'category__slug=apple',
          'categories__slug=apple',
          'category_slug=apple',
          'category=apple',
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
          throw new Error('No apple accessories found');
        setProducts(finalProducts);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: finalProducts, timestamp: Date.now() })
        );
      } catch (err: any) {
        console.error('Apple fetch failed:', err);
        setSnackbar({
          open: true,
          message: err.message || 'Failed to load apple accessories',
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

  const renderSkeletonCard = () => (
    <Box
      sx={{
        width: 290,
        height: 440,
        bgcolor: '#fff',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Skeleton variant="rectangular" width="100%" height={180} />
      <Box sx={{ p: 2, flexGrow: 1 }}>
        <Skeleton width="85%" height={30} sx={{ mb: 1 }} />
        <Skeleton width="70%" height={20} sx={{ mb: 1.5 }} />
        <Skeleton width="60%" height={34} />
      </Box>
    </Box>
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
          width: 290,
          height: 440,
          bgcolor: '#fff',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0,
        }}
      >
        {/* Wishlist */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            bgcolor: '#fff',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleWishlistToggle(product.id);
          }}
        >
          <Favorite
            sx={{
              color: wishlist.has(product.id) ? '#e91e63' : '#bbb',
              fontSize: 19,
            }}
          />
        </Box>

        {/* Cover Image */}
        <Box
          sx={{
            width: '100%',
            height: 180,
            p: 2.5,
            cursor: 'pointer',
            bgcolor: '#f9f9f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
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
              objectFit: 'contain',
            }}
          />
          {hasDiscount && (
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                bgcolor: '#e91e63',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.75rem',
                px: 1.2,
                py: 0.4,
                boxShadow: '0 3px 10px rgba(233,30,99,0.4)',
              }}
            >
              {product.discount}% OFF
            </Box>
          )}
        </Box>

        <CardContent sx={{ p: 2, pb: 1.8, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Title */}
          <Typography
            onClick={() => router.push(`/product/${product.id}`)}
            sx={{
              fontWeight: 800,
              color: '#1a1a1a',
              mb: 0.6,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.title}
          </Typography>

          {/* Brand */}
          {product.brand && (
            <Stack direction="row" alignItems="center" gap={0.8} mb={1}>
             
              <Typography sx={{ color: '#444', fontWeight: 600, fontSize: '0.8rem' }}>
                {product.brand.name}
              </Typography>
            </Stack>
          )}

          {/* Specs */}
          <Stack spacing={0.8} mb={1.5} sx={{ flexGrow: 1 }}>
            {Array.isArray(product.type) && product.type.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#666', fontWeight: 600, mr: 0.5 }}>
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
                <Typography sx={{ fontSize: '0.75rem', color: '#666', fontWeight: 600, mr: 0.5 }}>
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
                <Typography sx={{ fontSize: '0.75rem', color: '#666', fontWeight: 600, mr: 0.5 }}>
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
                sx={{ color: '#e91e63', width: 32, height: 32 }}
              >
                <Remove sx={{ fontSize: 15 }} />
              </IconButton>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', minWidth: 24, textAlign: 'center' }}>
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
                  width: 32,
                  height: 32,
                  '&[disabled]': { color: '#ccc' },
                }}
              >
                <Add sx={{ fontSize: 15 }} />
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
                py: 0.9,
                fontSize: '0.82rem',
                '&[disabled]': { bgcolor: '#eee', color: '#999' },
              }}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          )}
        </CardContent>

        {/* Gallery Preview */}
        {galleryImages.length > 0 && (
          <Box sx={{ px: 1.8, pb: 1.8 }}>
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

  const inStockProducts = products.filter(p => p.stock > 0);

  return (
    <Box sx={{ bgcolor: '#fdfdfd', py: { xs: 3, lg: 4 }, px: { xs: 2, lg: 3 } }}>
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
         
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a1a1a' }}>
            Apple Accessories
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

      {/* Mobile & Tablet: Horizontal Scroll */}
      <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
        <Box
          sx={{
            overflowX: 'auto',
            display: 'flex',
            pb: 2,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => renderSkeletonCard())
              : inStockProducts.length === 0
              ? (
                  <Typography color="text.secondary" sx={{ py: 5, pl: 2 }}>
                    No apple accessories available right now.
                  </Typography>
                )
              : inStockProducts.map(renderCard)}
          </Box>
        </Box>
      </Box>

      {/* Large Screens: 4 per row, UNLIMITED rows (GRID) */}
      <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
        {loading ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 290px)',
              gap: 2,
              justifyContent: 'center',
              maxWidth: 1240,
              mx: 'auto',
              px: { lg: 2 },
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => renderSkeletonCard())}
          </Box>
        ) : inStockProducts.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 5 }}>
            No apple accessories available right now.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 290px)',
              gap: 2,
              justifyContent: 'center',
              maxWidth: 1240,
              mx: 'auto',
              px: { lg: 2 },
            }}
          >
            {inStockProducts.map(renderCard)}
          </Box>
        )}
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

export default AppleAccessoriesSection;