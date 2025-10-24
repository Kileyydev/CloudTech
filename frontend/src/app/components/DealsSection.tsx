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

export default function DealsSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();

  const [products, setProducts] = useState<ProductT[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<Record<number, any>>({});
  const [currentIndexes, setCurrentIndexes] = useState<Record<number, number>>({});
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');

  const MEDIA_BASE = "http://localhost:8000";
  const API_PRODUCTS = "http://localhost:8000/api/products/";
  const API_CATEGORIES = "http://localhost:8000/api/categories/";

  // ✅ Fetch only discounted, active products
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

  // ✅ Persist cart in localStorage
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

  const handleTabChange = (_: any, newVal: number | 'all') =>
    setActiveCategory(newVal);

  const displayedProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p) =>
          p.categories?.some((c) => c.id === activeCategory)
        );

  return (
    <Box
      sx={{
        p: { xs: 1, md: 2 },
        background: 'linear-gradient(180deg, #fff 40%, #9a979fff 100%)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
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
      <Box
        sx={{
          display: 'flex',
          overflowX: 'auto',
          gap: 1.5,
          pb: 1.5,
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {displayedProducts.map((product) => {
          const images = [product.cover_image, ...(product.images || [])]
            .filter(Boolean)
            .slice(0, 3);
          const currentIndex = currentIndexes[product.id] || 0;
          const finalPrice = product.discount
            ? (product.price - product.price * (product.discount / 100)).toFixed(2)
            : product.price.toFixed(2);

          return (
            <Card
              key={product.id}
              sx={{
                minWidth: 180,
                maxWidth: 180,
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
                  image={
                    images[currentIndex]?.startsWith('http')
                      ? images[currentIndex]
                      : `${MEDIA_BASE}${images[currentIndex]}`
                  }
                  sx={{
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%',
                  }}
                />
              </Box>

              {/* Info */}
              <CardContent sx={{ flexGrow: 1, p: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: '#000' }}
                  noWrap
                >
                  {product.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#666' }}
                  noWrap
                >
                  {product.description}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    textDecoration: 'line-through',
                    color: '#888',
                  }}
                >
                  KES {product.price}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: '#000', mt: 0.5 }}
                >
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
        })}
      </Box>
    </Box>
  );
}
