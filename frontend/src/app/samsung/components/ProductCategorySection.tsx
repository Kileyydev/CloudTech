"use client";
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  styled,
  useTheme,
  CircularProgress,
} from '@mui/material';

const ProductCardStyled = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'light' ? '#f8f8f8' : '#333',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  textAlign: 'center',
  height: '100%',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  },
}));

const ProductImage = styled(CardMedia)(({ theme }) => ({
  height: 200,
  width: '100%',
  objectFit: 'contain',
  backgroundColor: theme.palette.mode === 'light' ? '#f0f0f0' : '#444',
}));

interface Product {
  id: number;
  title: string;
  price: number;
  discount?: number;
  cover_image?: string;
  description?: string;
}

const SamsungProductsSection = () => {
  const theme = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Make sure the backend expects `category` as query param
  const API_BASE = 'http://localhost:8000/api/products/?category=samsung';

  useEffect(() => {
    const fetchSamsungProducts = async () => {
      try {
        const res = await fetch(API_BASE); // NO AUTH
        if (res.ok) {
          const data = await res.json();
          setProducts(Array.isArray(data) ? data : data.results);
        } else {
          console.error('Failed to fetch Samsung products', await res.text());
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching Samsung products', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSamsungProducts();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: theme.spacing(4), backgroundColor: theme.palette.mode === 'light' ? '#fff' : '#1e1e1e' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
        Samsung Products
      </Typography>
      <Grid container spacing={3}>
        {products.length === 0 ? (
          <Typography variant="body1" sx={{ width: '100%', textAlign: 'center', mt: 4 }}>
            No Samsung products found.
          </Typography>
        ) : (
          products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <ProductCardStyled>
                <ProductImage
                  component="img"
                  image={product.cover_image ? `http://localhost:8000${product.cover_image}` : '/placeholder.png'}
                  alt={product.title}
                  sx={{ p: 2 }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                    {product.title}
                  </Typography>
                  <Typography variant="h5" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                    KES {product.price?.toLocaleString()}
                    {product.discount && (
                      <Typography variant="body2" color="error" sx={{ ml: 1, display: 'inline' }}>
                        ({product.discount}% off)
                      </Typography>
                    )}
                  </Typography>
                  {product.description && (
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {product.description}
                    </Typography>
                  )}
                </CardContent>
              </ProductCardStyled>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default SamsungProductsSection;
