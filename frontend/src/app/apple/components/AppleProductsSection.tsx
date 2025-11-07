'use client';

import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Favorite, ShoppingCart, Add, Remove } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCart } from "@/app/components/cartContext";

type ProductT = {
  id: number;
  title: string;
  price: number;
  description: string;
  cover_image?: string;
  images?: string[];
  categories?: { id: number; name: string; slug?: string }[];
  stock: number;
};

const ProductCategorySection = () => {
  const theme = useTheme();
  const router = useRouter();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { cart, addToCart, updateQuantity } = useCart();
  const [products, setProducts] = useState<ProductT[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [currentIndexes, setCurrentIndexes] = useState<Record<number, number>>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState(true);

  const CACHE_KEY = 'apple_products_cache';
  const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

  useEffect(() => {
    const fetchProducts = async () => {
      console.log('FETCHING APPLE PRODUCTS...');

      try {
        // CLEAR CACHE FOR DEBUG (remove later)
        localStorage.removeItem(CACHE_KEY);
        console.log('Cache cleared for debug');

        // CHECK ENV VAR
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE;
        console.log('NEXT_PUBLIC_API_BASE:', API_BASE_URL);
        if (!API_BASE_URL) {
          throw new Error('NEXT_PUBLIC_API_BASE is not defined in .env');
        }

        // TRY MULTIPLE FILTERS
        const filters = [
          'category__slug=apple',
          'category_slug=apple',
          'categories__slug=apple',
          'category=apple',
          'category_name=apple',
        ];

        let finalProducts: ProductT[] = [];
        let usedFilter = '';

        for (const filter of filters) {
          const API_URL = `${API_BASE_URL}/products/?${filter}`;
          console.log(`Trying filter: ${filter} → ${API_URL}`);

          const res = await fetch(API_URL, { cache: 'no-store' });
          console.log(`Status: ${res.status} ${res.statusText}`);

          if (!res.ok) {
            console.log(`Failed with ${filter}`);
            continue;
          }

          const rawText = await res.text();
          console.log(`Raw response (${filter}):`, rawText.substring(0, 500));

          let data;
          try {
  data = JSON.parse(rawText);
} catch (e) {
  console.error(`JSON parse failed for ${filter}:`, e);
  continue;
}

          const list = Array.isArray(data) ? data : data.results || data.data || [];
          console.log(`Parsed ${list.length} products with ${filter}:`, list);

          if (list.length > 0) {
            finalProducts = list;
            usedFilter = filter;
            break;
          }
        }

        if (finalProducts.length === 0) {
          console.warn('No products found with any filter. Fetching ALL products to debug...');
          const allRes = await fetch(`${API_BASE_URL}/products/`, { cache: 'no-store' });
          const allData = await allRes.json();
          const allList = Array.isArray(allData) ? allData : allData.results || [];
          console.log('ALL PRODUCTS (for debug):', allList);

          // Show categories
          allList.forEach((p: ProductT) => {
            console.log(`Product ID ${p.id}: "${p.title}" → Categories:`, p.categories);
          });

          throw new Error('No Apple products found. Check category assignment.');
        }

        console.log(`SUCCESS! Using filter: ${usedFilter}`);
        console.log('Final products:', finalProducts);

        // Initialize image indexes
        const indexes: Record<number, number> = {};
        finalProducts.forEach((p: ProductT) => (indexes[p.id] = 0));
        setCurrentIndexes(indexes);
        setProducts(finalProducts);

        // Save to cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: finalProducts, timestamp: Date.now() }));
        console.log('Products cached');

      } catch (err: any) {
        console.error('FETCH FAILED:', err);
        console.error('Error stack:', err.stack);
        setSnackbar({ open: true, message: err.message || 'Failed to load products', severity: 'error' });
      } finally {
        setLoading(false);
        console.log('Loading state set to false');
      }
    };

    fetchProducts();
  }, []);

  // Load wishlist
  useEffect(() => {
    try {
      const stored = localStorage.getItem('wishlist');
      if (stored) {
        const parsed = JSON.parse(stored);
        setWishlist(new Set(parsed));
        console.log('Wishlist loaded:', parsed);
      }
    } catch (e) {
      console.error('Error loading wishlist:', e);
    }
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    console.log(`Snackbar: [${severity}] ${message}`);
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const handleWishlistToggle = (id: number) => {
    setWishlist((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) updated.delete(id);
      else updated.add(id);
      localStorage.setItem('wishlist', JSON.stringify(Array.from(updated)));
      console.log('Wishlist updated:', Array.from(updated));
      return updated;
    });
  };

  const handleAddToCart = (product: ProductT) => {
    console.log('Add to cart:', product.title, 'Stock:', product.stock);
    if (product.stock === 0) return showSnackbar('Out of stock', 'error');

    const cartItem = cart[product.id];
    if (cartItem && cartItem.quantity >= product.stock)
      return showSnackbar(`Only ${product.stock} items available`, 'error');

    const success = addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      stock: product.stock,
    });

    if (success)
      showSnackbar(cartItem ? `Added another ${product.title}` : `${product.title} added to cart!`);
  };

  const handleDecreaseQuantity = (id: number) => {
    const cartItem = cart[id];
    if (!cartItem) return;

    const success = updateQuantity(id, -1);
    if (success && cartItem.quantity <= 1)
      showSnackbar(`${cartItem.title} removed from cart`);
    else if (success)
      showSnackbar(`Updated ${cartItem.title}`);
  };

  const getCartItemCount = () =>
    Object.values(cart).reduce((total, item) => total + (item.quantity || 0), 0);

  const handleViewCart = () => {
    if (Object.keys(cart).length === 0) return showSnackbar('Cart is empty', 'error');
    router.push('/cart');
  };

  const renderCard = (product: ProductT) => {
    const images = [product.cover_image, ...(product.images || [])].filter(Boolean).slice(0, 3);
    const currentIndex = currentIndexes[product.id] || 0;
    const imageSrc =
      images[currentIndex]?.startsWith('http')
        ? images[currentIndex]
        : `${process.env.NEXT_PUBLIC_MEDIA_BASE}${images[currentIndex]}`;

    const cartItem = cart[product.id];

    return (
      <Card
        key={product.id}
        sx={{
          width: 220,
          height: 360,
          flex: '0 0 220px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          borderRadius: 0,
          overflow: 'hidden',
          position: 'relative',
          transition: 'transform 0.2s',
          '&:hover': { transform: 'translateY(-4px)' },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleWishlistToggle(product.id);
          }}
        >
          <Favorite sx={{ color: wishlist.has(product.id) ? '#e91e63' : '#888', fontSize: 18 }} />
        </Box>

        <Box sx={{ width: 220, height: 180, cursor: 'pointer' }} onClick={() => router.push(`/product/${product.id}`)}>
          <CardMedia component="img" image={imageSrc || '/images/fallback.jpg'} alt={product.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {product.stock < 5 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: '#fff',
                fontSize: '0.8rem',
                px: 1,
                py: 0.5,
              }}
            >
              Only {product.stock} left!
            </Box>
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#222', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem', mt: 0.5, overflow: 'hidden', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', display: '-webkit-box' }}>
              {product.description}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#222', fontSize: '1rem', mt: 1 }}>
              KES {product.price.toLocaleString()}
            </Typography>
          </Box>

          {cartItem ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1.5, gap: 1.5 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDecreaseQuantity(product.id);
                }}
                sx={{ color: '#e91e63', border: '1px solid #e91e63', width: 32, height: 32 }}
              >
                <Remove sx={{ fontSize: 16 }} />
              </IconButton>
              <Typography sx={{ fontWeight: 600, fontSize: '1rem', minWidth: 24, textAlign: 'center' }}>
                {cartItem.quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
                disabled={cartItem.quantity >= product.stock}
                sx={{ color: '#e91e63', border: '1px solid #e91e63', width: 32, height: 32 }}
              >
                <Add sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ) : (
            <Button
              variant="contained"
              startIcon={<ShoppingCart sx={{ fontSize: 16 }} />}
              fullWidth
              sx={{ backgroundColor: '#e91e63', textTransform: 'none', fontSize: '0.9rem', mt: 1.5, borderRadius: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
            >
              Add to Cart
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  const skeletons = Array.from({ length: 6 }).map((_, i) => (
    <Skeleton
      key={i}
      variant="rectangular"
      width={220}
      height={360}
      sx={{ bgcolor: '#fff', borderRadius: 0 }}
    />
  ));

  console.log('Rendering with products:', products.length, products);

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: '#fff' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#222' }}>
          Apple Products 
        </Typography>
        <Button
          variant="contained"
          startIcon={<ShoppingCart sx={{ fontSize: 16 }} />}
          onClick={handleViewCart}
          sx={{ backgroundColor: '#e91e63', textTransform: 'none', fontSize: '0.9rem' }}
          disabled={getCartItemCount() === 0}
        >
          View Cart ({getCartItemCount()})
        </Button>
      </Box>

      <Box
        sx={{
          maxWidth: '1200px',
          mx: 'auto',
          ...(isSmallScreen
            ? { display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: 2, pb: 2, '&::-webkit-scrollbar': { display: 'none' } }
            : { display: 'grid', gridTemplateColumns: { md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 3 }),
        }}
      >
        {loading ? skeletons : products.filter((p) => p.stock > 0).map(renderCard)}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductCategorySection;