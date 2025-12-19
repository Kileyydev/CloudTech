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
  Rating,
  Divider,
  alpha,
} from '@mui/material';
import {
  Favorite,
  ShoppingCart,
  Add,
  Remove,
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

const CACHE_KEY = 'samsung_products_cache_v4';
const CACHE_DURATION = 1000 * 60 * 10; // 10 mins

const SamsungProducts = () => {
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

        const slug = 'samsung';
        const res = await fetch(`${API_BASE_URL}/products/?categories__slug=${slug}`, {
          cache: 'no-store',
        });

        if (!res.ok) throw new Error('Failed to fetch Samsung products');
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('Invalid response');
        }
        const list = Array.isArray(data) ? data : data.results || data.data || [];
        if (list.length === 0) throw new Error('No Samsung products found');

        setProducts(list);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: list, timestamp: Date.now() })
        );
      } catch (err: any) {
        console.error('Samsung products fetch failed:', err);
        setSnackbar({
          open: true,
          message: err.message || 'Failed to load Samsung products',
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

  const handleWishlistToggle = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) => {
      const updated = new Set(prev);
      updated.has(id) ? updated.delete(id) : updated.add(id);
      localStorage.setItem('wishlist', JSON.stringify(Array.from(updated)));
      return updated;
    });
  };

  const handleAddToCart = (product: ProductT, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const getPriceDisplay = (p: ProductT) => {
    const hasDiscount = p.discount && p.discount > 0;
    const final = hasDiscount && p.final_price ? p.final_price : p.price;
    if (hasDiscount) {
      return `KSh ${final.toLocaleString()} - KSh ${p.price.toLocaleString()}`;
    }
    return `KSh ${final.toLocaleString()}`;
  };

  const renderSkeletonCard = () => (
    <Box sx={{ width: 290, height: 520, bgcolor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
      <Skeleton variant="rectangular" width="100%" height={200} />
      <Box sx={{ p: 1.5 }}>
        <Skeleton height={20} width="90%" sx={{ mb: 0.5 }} />
        <Skeleton height={18} width="70%" />
        <Skeleton height={40} width="100%" sx={{ mt: 2 }} />
      </Box>
      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <Stack direction="row" spacing={1} justifyContent="center">
          <Skeleton variant="rectangular" width={40} height={40} />
          <Skeleton variant="rectangular" width={40} height={40} />
          <Skeleton variant="rectangular" width={40} height={40} />
        </Stack>
      </Box>
    </Box>
  );

  const renderCard = (product: ProductT) => {
    const imageSrc = getImageUrl(product.cover_image);
    const galleryImages = product.images?.map(getImageUrl).filter(Boolean) || [];
    const hasDiscount = product.discount && product.discount > 0;
    const inCart = !!cart[product.id];

    return (
      <Card
        key={product.id}
        sx={{
          width: 290,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#fff',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          borderRadius: 0,
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
          },
          '&:hover .hover-overlay': { opacity: 1 },
        }}
        onClick={() => router.push(`/product/${product.id}`)}
      >
        {/* Wishlist */}
        <IconButton
          onClick={(e) => handleWishlistToggle(product.id, e)}
          sx={{ position: 'absolute', top: 6, right: 6, zIndex: 10, bgcolor: 'rgba(255,255,255,0.9)', width: 30, height: 30 }}
        >
          <Favorite sx={{ color: wishlist.has(product.id) ? '#e91e63' : '#ccc', fontSize: 17 }} />
        </IconButton>

        {/* Discount Badge */}
        {hasDiscount && (
          <Box sx={{ position: 'absolute', top: 6, left: 6, bgcolor: '#e91e63', color: '#fff', fontWeight: 800, fontSize: '0.65rem', px: 1, py: 0.3, zIndex: 10 }}>
            {product.discount}% OFF
          </Box>
        )}

        {/* Image + Hover Overlay */}
        <Box sx={{ position: 'relative', height: 200, bgcolor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CardMedia
            component="img"
            image={imageSrc}
            alt={product.title}
            loading="lazy"
            sx={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }}
          />

          {/* Hover Overlay with Specs */}
          {(product.type || product.connectivity || product.colors) && (
            <Box
              className="hover-overlay"
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'rgba(0,0,0,0.8)',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                p: 1.5,
                opacity: 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none',
              }}
            >
              <Stack spacing={1}>
                {product.type && product.type.length > 0 && (
                  <Box textAlign="center">
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Type</Typography>
                    <Stack direction="row" spacing={0.7} justifyContent="center" mt={0.3}>
                      {product.type.slice(0, 6).map((t, i) => (
                        <Chip
                          key={i}
                          label={t.value}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.65rem',
                            bgcolor: alpha('#DC1A8A', 0.3),
                            color: '#fff',
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
                {product.connectivity && product.connectivity.length > 0 && (
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>
                    Connectivity: {product.connectivity.map(c => c.value).join(' / ')}
                  </Typography>
                )}
                {product.colors && product.colors.length > 0 && (
                  <Box textAlign="center">
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Colors</Typography>
                    <Stack direction="row" spacing={0.7} justifyContent="center" mt={0.3}>
                      {product.colors.slice(0, 6).map((c, i) => (
                        <Box key={i} sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: c.value.toLowerCase(), border: '1.5px solid #fff' }} />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Box>
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 1.5, pb: '12px !important', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: '0.85rem',
                mb: 0.5,
                height: 36,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {product.title}
            </Typography>

            {/* Placeholder rating */}
            <Rating value={4.5} readOnly precision={0.5} size="small" sx={{ mb: 0.8 }} />

            <Typography sx={{ fontWeight: 800, color: hasDiscount ? '#e91e63' : '#1a1a1a', fontSize: '0.95rem', mb: 1 }}>
              {getPriceDisplay(product)}
            </Typography>
          </Box>

          {/* Add to Cart or Quantity Controls */}
          {inCart ? (
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, -1); }}
                sx={{ bgcolor: '#f0f0f0', width: 30, height: 30 }}
              >
                <Remove fontSize="small" />
              </IconButton>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
                {cart[product.id].quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => handleAddToCart(product, e)}
                disabled={cart[product.id].quantity >= product.stock}
                sx={{ bgcolor: '#e91e63', color: '#fff', width: 30, height: 30 }}
              >
                <Add fontSize="small" />
              </IconButton>
            </Stack>
          ) : (
            <Button
              fullWidth
              variant="contained"
              startIcon={<ShoppingCart sx={{ fontSize: 17 }} />}
              onClick={(e) => handleAddToCart(product, e)}
              disabled={product.stock === 0}
              sx={{
                bgcolor: '#e91e63',
                color: '#fff',
                fontWeight: 700,
                textTransform: 'none',
                py: 1.1,
                fontSize: '0.85rem',
                '&:hover': { bgcolor: '#c2185b' },
                '&[disabled]': { bgcolor: '#ddd', color: '#999' },
              }}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          )}
        </CardContent>

        {/* Gallery Preview */}
        {galleryImages.length > 0 && (
          <Box sx={{ px: 1.5, pb: 1.5 }}>
            <Stack direction="row" spacing={0.8} justifyContent="center">
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
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/product/${product.id}`);
                  }}
                >
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
  const cartCount = getCartItemCount();

  return (
    <>
      <Box sx={{ bgcolor: '#fdfdfd', py: { xs: 3, lg: 4 }, px: { xs: 2, lg: 3 } }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '1.8rem', md: '2.2rem' },
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              display: 'inline-block',
              borderBottom: '4px solid #000',
              pb: 1,
              color: '#000',
            }}
          >
            Samsung
          </Typography>
        </Box>

        <Divider sx={{ bgcolor: '#000', height: 2, mb: 4 }} />

        {/* Cart Button */}
        <Box sx={{ textAlign: 'right', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<ShoppingCart />}
            onClick={() => router.push('/cart')}
            sx={{ bgcolor: '#000', px: 3, py: 1 }}
            disabled={cartCount === 0}
          >
            Cart ({cartCount})
          </Button>
        </Box>

        {/* Mobile: Horizontal Scroll */}
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
                ? Array.from({ length: 8 }).map((_, i) => <Box key={i}>{renderSkeletonCard()}</Box>)
                : inStockProducts.length === 0
                ? <Typography sx={{ py: 5, pl: 2 }}>No Samsung products available right now.</Typography>
                : inStockProducts.map(renderCard)}
            </Box>
          </Box>
        </Box>

        {/* Desktop: Grid */}
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
              }}
            >
              {Array.from({ length: 12 }).map((_, i) => renderSkeletonCard())}
            </Box>
          ) : inStockProducts.length === 0 ? (
            <Typography sx={{ textAlign: 'center', py: 5 }}>
              No Samsung products available right now.
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
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>

      {/* Elegant Black Separator Line Below */}
      <Box
        sx={{
          height: 5,
          bgcolor: '#000',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          background: 'linear-gradient(to right, transparent, #000 15%, #000 85%, transparent)',
          borderRadius: '2px',
          mt: 6,
        }}
      />
    </>
  );
};

export default SamsungProducts;