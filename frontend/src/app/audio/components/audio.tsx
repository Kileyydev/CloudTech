'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  styled,
  useTheme,
  CircularProgress,
} from '@mui/material';
import Link from 'next/link';
import { CardMediaProps } from '@mui/material/CardMedia';

// Define interface for CardMedia to support component prop
interface CustomCardMediaProps extends CardMediaProps {
  component?: 'img';
  image?: string;
  alt?: string;
}

// Styled product card
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

const ProductImage = styled(CardMedia)<CustomCardMediaProps>(({ theme }) => ({
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
  cover_image?: string | null;
}

const categorySlug = 'audio';

const AudioAccessoriesSection = () => {
  const theme = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = `http://localhost:8000/api/products/?category=${categorySlug}`;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(API_BASE);
        if (res.ok) {
          const data = await res.json();
          // Support both paginated results or plain array
          const productList = Array.isArray(data) ? data : data.results;
          setProducts(productList);
        } else {
          console.error(`Failed to fetch ${categorySlug} products`, await res.text());
          setProducts([]);
        }
      } catch (err) {
        console.error(`Error fetching ${categorySlug} products`, err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [API_BASE]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: theme.spacing(4),
        backgroundColor: theme.palette.mode === 'light' ? '#fff' : '#1e1e1e',
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ fontWeight: 700, color: theme.palette.text.primary }}
      >
        Audio Accessories
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: theme.spacing(3), // Matches original Grid spacing={3}
          '& > *': {
            flex: {
              xs: '1 1 100%', // Full width on xs (xs={12})
              sm: '1 1 calc(50% - 24px)', // 2 columns on sm (sm={6})
              md: '1 1 calc(33.33% - 24px)', // 3 columns on md (md={4})
            },
            minWidth: 0,
          },
        }}
      >
        {products.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', width: '100%' }}>
            No Audio Accessories products found
          </Typography>
        ) : (
          products.map((product) => {
            // Properly construct full image URL
            const imageUrl =
              product.cover_image && product.cover_image.startsWith('http')
                ? product.cover_image
                : product.cover_image
                ? `http://localhost:8000${product.cover_image}`
                : '/placeholder.png';

            return (
              <ProductCardStyled key={product.id}>
                <ProductImage
                  component="img"
                  image={imageUrl}
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
                </CardContent>
                <CardActions sx={{ justifyContent: 'center' }}>
                  <Link href={`/products/${product.id}`} passHref>
                    <Button variant="outlined" color="primary">
                      View Product
                    </Button>
                  </Link>
                  <Button variant="contained" color="secondary">
                    Add to Cart
                  </Button>
                </CardActions>
              </ProductCardStyled>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default AudioAccessoriesSection;