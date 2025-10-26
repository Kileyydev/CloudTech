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
  discount?: number;
  description: string;
  cover_image?: string;
  images?: string[];
  categories?: { id: number; name: string }[];
  stock: number;
  is_active?: boolean;
};

const DealsSection = () => {
  const theme = useTheme();
  const router = useRouter();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [products, setProducts] = useState<ProductT[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<Record<number, any>>({});
  const [currentIndexes, setCurrentIndexes] = useState<Record<number, number>>({});
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');

  const MEDIA_BASE = 'http://localhost:8000';
  const API_PRODUCTS = 'http://localhost:8000/api/products/';
  const API_CATEGORIES = 'http://localhost:8000/api/categories/';

  // Fetch discounted, active products
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

    // Ensure image is valid before using startsWith
    const imageSrc = images[currentIndex] && typeof images[currentIndex] === 'string'
      ? images[currentIndex].startsWith('http')
        ? images[currentIndex]
        : `${MEDIA_BASE}${images[currentIndex]}`
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
          height: 300,
          position: 'relative',
          boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
        }}
      >
        {/* Discount Tag */}
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            left: 6,
            backgroundColor: '#dc1a8a',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            px: 0.5,
            py: 0.3,
            borderRadius: 1,
          }}
        >
          {product.discount}% OFF
        </Box>

        {/* Wishlist */}
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
          }}
          onClick={() => handleWishlistToggle(product.id)}
        >
          <Favorite
            sx={{
              color: wishlist.has(product.id) ? '#db1b88' : '#666',
              fontSize: 14,
            }}
          />
        </Box>

        {/* Image */}
        <Box
          sx={{
            position: 'relative',
            cursor: 'pointer',
            height: 120,
          }}
          onClick={() => router.push(`/product/${product.id}`)}
        >
          <CardMedia
            component="img"
            image={imageSrc}
            sx={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
            }}
          />
        </Box>

        {/* Info */}
        <CardContent sx={{ flexGrow: 1, p: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#000' }} noWrap>
            {product.title}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }} noWrap>
            {product.description}
          </Typography>
          <Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#888' }}>
            KES {product.price}
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#000', mt: 0.5 }}>
            KES {finalPrice}
          </Typography>

          {!cart[product.id] ? (
            <Button
              variant="contained"
              startIcon={<ShoppingCart />}
              sx={{
                backgroundColor: '#db1b88',
                color: '#fff',
                textTransform: 'none',
                fontSize: 12,
                mt: 0.5,
                '&:hover': { backgroundColor: '#b1166f' },
              }}
              onClick={() => handleAddToCart(product)}
            >
              Add to Cart
            </Button>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mt: 0.5,
              }}
            >
              <IconButton
                size="small"
                onClick={() => handleDecreaseQuantity(product.id)}
              >
                <Remove sx={{ color: '#db1b88', fontSize: 16 }} />
              </IconButton>
              <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                {cart[product.id].quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleAddToCart(product)}
              >
                <Add sx={{ color: '#db1b88', fontSize: 16 }} />
              </IconButton>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, background: 'linear-gradient(180deg, #fff 40%, #9a979fff 100%)' }}>
      {/* Header */}
      <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#000' }}>
          Hot Deals
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
        >
          View Cart ({Object.keys(cart).length})
        </Button>
      </Box>

      {/* Category Tabs */}
      <Tabs
        value={activeCategory}
        onChange={handleTabChange}
        variant={isMobile ? 'scrollable' : 'standard'}
        scrollButtons
        allowScrollButtonsMobile
        sx={{ mb: 1 }}
      >
        <Tab label="All" value="all" />
        {categories.map((c) => (
          <Tab key={c.id} label={c.name} value={c.id} />
        ))}
      </Tabs>

      {/* Product Cards */}
      {isLargeScreen ? (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'nowrap',
            justifyContent: 'center',
            gap: 0.25, // 2px
          }}
        >
          {displayedProducts.slice(0, 5).map(renderCard)}
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
            {displayedProducts.map((product) => (
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
    </Box>
  );
};

export default DealsSection;