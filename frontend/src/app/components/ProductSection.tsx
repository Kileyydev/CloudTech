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
} from '@mui/material';
import { Favorite, ShoppingCart, Add, Remove, ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

type ProductT = {
  id: number;
  title: string;
  price: number;
  description: string;
  cover_image?: string;
  images?: string[];
  categories?: { name: string }[];
  stock: number;
};

type CartItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
  stock: number;
};

const ProductSection = () => {
  const theme = useTheme();
  const router = useRouter();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  const [products, setProducts] = useState<ProductT[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<Record<number, CartItem>>({});
  const [currentIndexes, setCurrentIndexes] = useState<Record<number, number>>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch featured products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/products/?is_featured=true');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        const list = data.results || data;

        const indexes: Record<number, number> = {};
        list.forEach((p: ProductT) => (indexes[p.id] = 0));
        setCurrentIndexes(indexes);
        setProducts(list);
      } catch (err) {
        console.error('Error fetching products:', err);
        setSnackbar({ open: true, message: 'Failed to load products', severity: 'error' });
      }
    };
    fetchProducts();
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          const validCart: Record<number, CartItem> = {};
          Object.entries(parsedCart).forEach(([id, item]: [string, any]) => {
            if (item.quantity > 0 && item.id) {
              validCart[Number(id)] = {
                ...item,
                quantity: Math.max(1, Math.min(item.quantity, item.stock || 999)),
              };
            }
          });
          setCart(validCart);
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    };
    loadCart();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleWishlistToggle = (id: number) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      localStorage.setItem('wishlist', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const handleAddToCart = (product: ProductT) => {
    if (product.stock === 0) {
      showSnackbar('This product is out of stock', 'error');
      return;
    }

    setCart((prev) => {
      const existingItem = prev[product.id];
      let newQuantity = 1;
      if (existingItem) {
        newQuantity = existingItem.quantity + 1;
        if (newQuantity > product.stock) {
          showSnackbar(`Only ${product.stock} items available in stock`, 'error');
          return prev;
        }
      }

      const newCart = {
        ...prev,
        [product.id]: {
          id: product.id,
          title: product.title,
          price: product.price,
          quantity: newQuantity,
          stock: product.stock,
        },
      };

      showSnackbar(existingItem ? `Added another ${product.title} to cart` : `${product.title} added to cart!`);
      return newCart;
    });
  };

  const handleDecreaseQuantity = (id: number) => {
    setCart((prev) => {
      const existingItem = prev[id];
      if (!existingItem) return prev;

      const newQuantity = existingItem.quantity - 1;

      if (newQuantity <= 0) {
        const newCart = { ...prev };
        delete newCart[id];
        showSnackbar('Item removed from cart');
        return newCart;
      }

      return {
        ...prev,
        [id]: { ...existingItem, quantity: newQuantity },
      };
    });
  };

  const handleViewCart = () => {
    if (Object.keys(cart).length === 0) {
      showSnackbar('Your cart is empty', 'error');
      return;
    }
    router.push('/cart');
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const renderCard = (product: ProductT) => {
    const images = [product.cover_image, ...(product.images || [])].filter(Boolean).slice(0, 3);
    const currentIndex = currentIndexes[product.id] || 0;
    const cartItem = cart[product.id];

    // Ensure image is valid before using startsWith
    const imageSrc = images[currentIndex] && typeof images[currentIndex] === 'string'
      ? images[currentIndex].startsWith('http')
        ? images[currentIndex]
        : `http://localhost:8000${images[currentIndex]}`
      : '/images/fallback.jpg'; // Fallback image

    return (
      <Card
        key={product.id}
        sx={{
          minWidth: { xs: 'clamp(150px, 45vw, 170px)', sm: 'clamp(160px, 22vw, 180px)', lg: 'clamp(160px, 18vw, 180px)' },
          maxWidth: { xs: 170, sm: 180, lg: 180 },
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          height: 280,
          boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            right: 6,
            zIndex: 1,
            backgroundColor: 'rgba(255,255,255,0.9)',
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderRadius: '50%',
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleWishlistToggle(product.id);
          }}
        >
          <Favorite
            sx={{
              color: wishlist.has(product.id) ? '#db1b88' : '#666',
              fontSize: 14,
            }}
          />
        </Box>

        <Box
          sx={{ position: 'relative', cursor: 'pointer', height: 120 }}
          onClick={() => router.push(`/product/${product.id}`)}
        >
          <CardMedia
            component="img"
            image={imageSrc}
            alt={product.title}
            sx={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
          {product.stock < 5 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 4,
                left: 4,
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '2px 6px',
                borderRadius: 1,
                fontSize: '0.7rem',
              }}
            >
              Only {product.stock} left!
            </Box>
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#000' }} noWrap>
            {product.title}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }} noWrap>
            {product.description}
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#000', mt: 0.5 }}>
            KES {product.price.toLocaleString()}
          </Typography>

          {cartItem ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDecreaseQuantity(product.id);
                }}
                sx={{
                  color: '#db1b88',
                  '&:hover': { backgroundColor: 'rgba(219, 27, 136, 0.1)' },
                }}
              >
                <Remove sx={{ fontSize: 16 }} />
              </IconButton>
              <Typography sx={{ fontWeight: 600, fontSize: 14, minWidth: 20, textAlign: 'center' }}>
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
                  color: '#db1b88',
                  '&:hover': { backgroundColor: 'rgba(219, 27, 136, 0.1)' },
                  '&[disabled]': { color: '#ccc' },
                }}
              >
                <Add sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ) : (
            <Button
              variant="contained"
              startIcon={<ShoppingCart />}
              fullWidth
              sx={{
                backgroundColor: '#db1b88',
                color: '#fff',
                textTransform: 'none',
                fontSize: 12,
                mt: 0.5,
                py: 0.5,
                '&:hover': { backgroundColor: '#b1166f' },
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
              disabled={product.stock === 0}
            >
              Add to Cart
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, background: 'linear-gradient(180deg, #9a979fff 40%, #fff 100%)' }}>
      <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#000' }}>
          Featured Products
        </Typography>
        <Button
          variant="contained"
          startIcon={<ShoppingCart />}
          onClick={handleViewCart}
          sx={{
            backgroundColor: '#db1b88',
            color: '#fff',
            textTransform: 'none',
            fontSize: 12,
            '&:hover': { backgroundColor: '#b1166f' },
          }}
          disabled={getCartItemCount() === 0}
        >
          View Cart ({getCartItemCount()})
        </Button>
      </Box>

      {isLargeScreen ? (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'nowrap',
            justifyContent: 'center',
            gap: 0.25, // 2px
          }}
        >
          {products.filter((p) => p.stock > 0).slice(0, 5).map(renderCard)}
        </Box>
      ) : (
        <Box sx={{ position: 'relative', padding: '0 24px' }}>
          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: '.swiper-button-prev',
              nextEl: '.swiper-button-next',
            }}
            spaceBetween={2}
            slidesPerView={2}
            breakpoints={{
              600: { slidesPerView: 4, spaceBetween: 2 },
              960: { slidesPerView: 4, spaceBetween: 2 },
            }}
            style={{ width: '100%' }}
          >
            {products.filter((p) => p.stock > 0).map((product) => (
              <SwiperSlide key={product.id} style={{ display: 'flex', justifyContent: 'center' }}>
                {renderCard(product)}
              </SwiperSlide>
            ))}
          </Swiper>
          <IconButton
            className="swiper-button-prev"
            sx={{
              position: 'absolute',
              top: '50%',
              left: 0,
              transform: 'translateY(-50%)',
              color: '#FFFFFF',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
              zIndex: 10,
              fontSize: 'clamp(1rem, 2.3vw, 1.2rem)',
            }}
          >
            <ArrowBackIos />
          </IconButton>
          <IconButton
            className="swiper-button-next"
            sx={{
              position: 'absolute',
              top: '50%',
              right: 0,
              transform: 'translateY(-50%)',
              color: '#FFFFFF',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
              zIndex: 10,
              fontSize: 'clamp(1rem, 2.3vw, 1.2rem)',
            }}
          >
            <ArrowForwardIos />
          </IconButton>
        </Box>
      )}

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
  );
};

export default ProductSection;