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
} from '@mui/material';
import { Favorite, ShoppingCart, Add, Remove } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

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

export default function ProductSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();

  const [products, setProducts] = useState<ProductT[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<Record<number, any>>({});
  const [currentIndexes, setCurrentIndexes] = useState<Record<number, number>>({});

  // Fetch featured products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/products/?is_featured=true');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        const list = data.results || data;

        // Initialize slider index for each product
        const indexes: Record<number, number> = {};
        list.forEach((p: ProductT) => {
          indexes[p.id] = 0;
        });
        setCurrentIndexes(indexes);

        setProducts(list);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart') || '{}');
    setCart(storedCart);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const handleWishlistToggle = (id: number) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleAddToCart = (product: ProductT) => {
    if (product.stock === 0) return;
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[product.id]) {
        if (newCart[product.id].quantity < product.stock) newCart[product.id].quantity += 1;
      } else {
        newCart[product.id] = {
          id: product.id,
          title: product.title,
          price: product.price,
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

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, background: 'linear-gradient(180deg, #9a979fff 40%, #fff 100%)', }}>
      <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#000' }}>
          Featured Products
        </Typography>
        <Button
          variant="contained"
          startIcon={<ShoppingCart />}
          onClick={handleViewCart}
          sx={{ backgroundColor: '#db1b88', color: '#fff', textTransform: 'none', fontSize: 12, '&:hover': { backgroundColor: '#b1166f' } }}
        >
          View Cart ({Object.keys(cart).length})
        </Button>
      </Box>

      <Box
        sx={{
          display: 'flex',
          overflowX: 'auto',
          gap: 1.5,
          pb: 1.5,
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {products
          .filter((p) => p.stock > 0)
          .map((product) => {
            const images = [product.cover_image, ...(product.images || [])].filter(Boolean).slice(0, 3);
            const currentIndex = currentIndexes[product.id] || 0;

            return (
              <Card
                key={product.id}
                sx={{
                  minWidth: 180,
                  maxWidth: 180,
                  flex: '0 0 auto',
                  display: 'flex',
                  flexDirection: 'column',
                  height: 280,
                  boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
                }}
              >
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
                  <Favorite sx={{ color: wishlist.has(product.id) ? '#db1b88' : '#666', fontSize: 14 }} />
                </Box>

                {/* Image */}
                <Box
                  sx={{ position: 'relative', cursor: 'pointer', height: 120 }}
                  onClick={() => router.push(`/product/${product.id}`)}
                >
                  <CardMedia
                    component="img"
                    image={
                      images[currentIndex]?.startsWith('http')
                        ? images[currentIndex]
                        : `http://localhost:8000${images[currentIndex]}`
                    }
                    alt={product.title}
                    sx={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                </Box>

                {/* Product Info */}
                <CardContent sx={{ flexGrow: 1, p: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#000' }} noWrap>
                    {product.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }} noWrap>
                    {product.description}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#000', mt: 0.5 }}>
                    ${product.price}
                  </Typography>

                  {!cart[product.id] ? (
                    <Button
                      variant="contained"
                      startIcon={<ShoppingCart />}
                      sx={{ backgroundColor: '#db1b88', color: '#fff', textTransform: 'none', fontSize: 12, mt: 0.5, '&:hover': { backgroundColor: '#b1166f' } }}
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                      <IconButton size="small" onClick={() => handleDecreaseQuantity(product.id)}>
                        <Remove sx={{ color: '#db1b88', fontSize: 16 }} />
                      </IconButton>
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{cart[product.id].quantity}</Typography>
                      <IconButton size="small" onClick={() => handleAddToCart(product)}>
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
