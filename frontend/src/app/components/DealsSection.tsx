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
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Favorite, ShoppingCart, Add, Remove } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

type ProductT = {
  id: number;
  title: string;
  price: number;
  discount?: number;
  description: string;
  cover_image?: string;
  images?: string[];
  categories?: { id: number; name: string }[];
  stock: number;
  is_active?: boolean;
};

type CartItem = {
  id: number;
  title: string;
  price: number;
  discount?: number;
  quantity: number;
};

const DealsSection = () => {
  const theme = useTheme();
  const router = useRouter();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.up('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [products, setProducts] = useState<ProductT[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<Record<number, CartItem>>({});
  const [currentIndexes, setCurrentIndexes] = useState<Record<number, number>>({});
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');

  const MEDIA_BASE = 'http://localhost:8000';
  const API_PRODUCTS = 'http://localhost:8000/api/products/';
  const API_CATEGORIES = 'http://localhost:8000/api/categories/';

  // Fetch discounted, active products and categories
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(API_PRODUCTS);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        const allProducts: ProductT[] = Array.isArray(data) ? data : (data.results ?? []);
        const discounted = allProducts.filter(
          (p) => p.is_active && p.discount && p.discount > 0
        );

        const indexes: Record<number, number> = {};
        discounted.forEach((p) => (indexes[p.id] = 0));
        setCurrentIndexes(indexes);
        setProducts(discounted);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch(API_CATEGORIES);
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        const catsArray = Array.isArray(data) ? data : (data.results ?? []);
        setCategories(catsArray);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  // Persist cart in localStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '{}');
    setCart(savedCart);
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const handleWishlistToggle = (id: number) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handleAddToCart = (product: ProductT) => {
    if (product.stock === 0) return;
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[product.id]) {
        if (newCart[product.id].quantity < product.stock)
          newCart[product.id].quantity += 1;
      } else {
        newCart[product.id] = {
          id: product.id,
          title: product.title,
          price: product.price,
          discount: product.discount,
          quantity: 1,
        };
      }
      return newCart;
    });
  };

  const handleDecreaseQuantity = (id: number) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[id]?.quantity > 1) newCart[id].quantity -= 1;
      else delete newCart[id];
      return newCart;
    });
  };

  const handleViewCart = () => {
    router.push('/cart');
  };

  const handleTabChange = (_: any, newVal: number | 'all') => setActiveCategory(newVal);

  const displayedProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.categories?.some((c) => c.id === activeCategory));

  const renderCard = (product: ProductT) => {
    const images = [product.cover_image, ...(product.images || [])].filter(Boolean).slice(0, 3);
    const currentIndex = currentIndexes[product.id] || 0;
    const finalPrice = product.discount
      ? (product.price - product.price * (product.discount / 100)).toFixed(2)
      : product.price.toFixed(2);

    const imageSrc = images[currentIndex] && typeof images[currentIndex] === 'string'
      ? images[currentIndex].startsWith('http')
        ? images[currentIndex]
        : `${MEDIA_BASE}${images[currentIndex]}`
      : '/images/fallback.jpg';

    return (
      <Card
        key={product.id}
        sx={{
          width: 220, // Static width
          height: 360, // Static height
          flex: '0 0 220px', // Ensure fixed width in scrollable row
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          borderRadius: 0, // No border radius
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#fff',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: '#e91e63',
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: 700,
            px: 1,
            py: 0.5,
            borderRadius: 0,
          }}
        >
          {product.discount}% OFF
        </Box>

        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            backgroundColor: 'rgba(255,255,255,0.95)',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderRadius: '50%',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
          onClick={() => handleWishlistToggle(product.id)}
        >
          <Favorite
            sx={{
              color: wishlist.has(product.id) ? '#e91e63' : '#888',
              fontSize: 18,
            }}
          />
        </Box>

        <Box
          sx={{
            width: 220, // Static image width
            height: 180, // Static image height
            cursor: 'pointer',
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
              objectFit: 'cover',
            }}
          />
        </Box>

        <CardContent
          sx={{
            flexGrow: 1,
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: 180,
          }}
        >
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: '#222',
                fontSize: '1rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {product.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#666',
                fontSize: '0.85rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mt: 0.5,
              }}
            >
              {product.description}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  textDecoration: 'line-through',
                  color: '#888',
                  fontSize: '0.85rem',
                  mr: 1,
                }}
              >
                KES {product.price.toLocaleString()}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: '#222',
                  fontSize: '1rem',
                  display: 'inline',
                }}
              >
                KES {Number(finalPrice).toLocaleString()}
              </Typography>
            </Box>
          </Box>

          {!cart[product.id] ? (
            <Button
              variant="contained"
              startIcon={<ShoppingCart sx={{ fontSize: 16 }} />}
              fullWidth
              sx={{
                backgroundColor: '#e91e63',
                color: '#fff',
                textTransform: 'none',
                fontSize: '0.9rem',
                mt: 1.5,
                py: 0.75,
                borderRadius: 0,
                '&:hover': { backgroundColor: '#c2185b' },
                '&:disabled': { backgroundColor: '#ccc' },
              }}
              onClick={() => handleAddToCart(product)}
              disabled={product.stock === 0}
            >
              Add to Cart
            </Button>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 1.5,
                gap: 1.5,
              }}
            >
              <IconButton
                size="small"
                onClick={() => handleDecreaseQuantity(product.id)}
                sx={{
                  color: '#e91e63',
                  border: '1px solid #e91e63',
                  '&:hover': { backgroundColor: 'rgba(233, 30, 99, 0.1)' },
                  width: 32,
                  height: 32,
                }}
              >
                <Remove sx={{ fontSize: 16 }} />
              </IconButton>
              <Typography sx={{ fontWeight: 600, fontSize: '1rem', minWidth: 24, textAlign: 'center' }}>
                {cart[product.id].quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleAddToCart(product)}
                disabled={cart[product.id].quantity >= product.stock}
                sx={{
                  color: '#e91e63',
                  border: '1px solid #e91e63',
                  '&:hover': { backgroundColor: 'rgba(233, 30, 99, 0.1)' },
                  '&[disabled]': { color: '#ccc', borderColor: '#ccc' },
                  width: 32,
                  height: 32,
                }}
              >
                <Add sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, background: 'linear-gradient(180deg, #f5f5f5 40%, #fff 100%)' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#222', fontSize: '1.5rem' }}>
          Hot Deals
        </Typography>
        <Button
          variant="contained"
          startIcon={<ShoppingCart sx={{ fontSize: 16 }} />}
          onClick={handleViewCart}
          sx={{
            backgroundColor: '#e91e63',
            color: '#fff',
            textTransform: 'none',
            fontSize: '0.9rem',
            py: 0.75,
            px: 2,
            borderRadius: 0,
            '&:hover': { backgroundColor: '#c2185b' },
            '&:disabled': { backgroundColor: '#ccc' },
          }}
        >
          View Cart ({Object.keys(cart).length})
        </Button>
      </Box>

      <Tabs
        value={activeCategory}
        onChange={handleTabChange}
        variant={isSmallScreen ? 'scrollable' : 'standard'}
        scrollButtons
        allowScrollButtonsMobile
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: '#666',
            '&.Mui-selected': {
              color: '#e91e63',
              fontWeight: 700,
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#e91e63',
          },
        }}
      >
        <Tab label="All" value="all" />
        {categories.map((c) => (
          <Tab key={c.id} label={c.name} value={c.id} />
        ))}
      </Tabs>

      <Box
        sx={{
          maxWidth: '1200px',
          mx: 'auto',
          ...(isSmallScreen
            ? {
                display: 'flex',
                flexWrap: 'nowrap',
                overflowX: 'auto',
                gap: 2,
                pb: 2,
                scrollSnapType: 'x mandatory',
                msOverflowStyle: 'none', // Hide scrollbar in IE/Edge
                scrollbarWidth: 'none', // Hide scrollbar in Firefox
                '&::-webkit-scrollbar': {
                  display: 'none', // Hide scrollbar in WebKit browsers
                },
                '& > *': {
                  scrollSnapAlign: 'start',
                },
              }
            : {
                display: 'grid',
                gridTemplateColumns: {
                  md: 'repeat(4, minmax(220px, 1fr))', // 4 cards
                  lg: 'repeat(5, minmax(220px, 1fr))', // 5 cards
                },
                gap: { md: 3 },
              }),
        }}
      >
        {displayedProducts.map(renderCard)}
      </Box>
    </Box>
  );
};

export default DealsSection;