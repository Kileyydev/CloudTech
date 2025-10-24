'use client';

import { Box, Typography, Card, CardContent, Button, Tabs, Tab, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState, useEffect } from 'react';

// Compact section container
const SectionBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(180deg, #fff 40%, #9a979fff 100%)',
  padding: theme.spacing(2, 0), // reduced padding
  color: '#000',
  textAlign: 'left',
  position: 'relative',
}));

// Compact title
const Title = styled(Typography)(({ theme }) => ({
  fontSize: '1.8rem', // smaller font
  fontWeight: 700,
  color: '#333',
  textAlign: 'center',
  marginBottom: theme.spacing(2), // reduced margin
  letterSpacing: '1px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.5rem',
    marginBottom: theme.spacing(1),
  },
}));

// Compact product card
const ProductCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(1),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  borderRadius: 0,
  height: 200, // reduced height
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
  },
}));

// Compact image box
const ImageBox = styled(Box)(({ theme }) => ({
  height: 120, // smaller image height
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
}));

const DealsSection = () => {
  const [value, setValue] = useState(0);

  type Product = {
    name: string;
    image: string;
    price: string | number;
    oldPrice?: string | number;
    rating?: string | number;
    category: string;
  };

  type ProductsByCategory = {
    [key: string]: Product[];
  };

  const [products, setProducts] = useState<ProductsByCategory>({});
  const categories = ['All', 'Samsung', 'Apple', 'Smartphones', 'Audio', 'PowerBanks', 'Laptops', 'Mobile Accessories'];

  // Fetch products from backend
  useEffect(() => {
    fetch('http://localhost:8000/api/products/')
      .then((res) => res.json())
      .then((data) => {
        const productsByCategory: ProductsByCategory = {};

        categories.forEach((cat) => {
          if (cat === 'All') {
            productsByCategory[cat.toLowerCase()] = data;
          } else {
            productsByCategory[cat.toLowerCase()] = data.filter(
              (p: Product) => p.category?.toLowerCase() === cat.toLowerCase()
            );
          }
        });

        setProducts(productsByCategory);
      })
      .catch((err) => console.error('Error fetching products:', err));
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => setValue(newValue);
  const currentCategory = categories[value].toLowerCase();
  const displayedProducts = products[currentCategory] || [];

  return (
    <SectionBox>
      <Title>Best Deals</Title>

      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 1,
          '& .MuiTabs-indicator': { backgroundColor: '#db1b88', height: 3 },
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, color: '#666', '&.Mui-selected': { color: '#db1b88', fontWeight: 600 } },
        }}
      >
        {categories.map((cat, index) => (
          <Tab key={index} label={cat} />
        ))}
      </Tabs>

      <Grid container spacing={1} justifyContent="center" alignItems="stretch">
        {displayedProducts.length > 0 ? (
          displayedProducts.map((product, index) => (
            <Grid item xs={6} sm={3} md={3} key={index}>
              <ProductCard>
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1,
                  }}
                >
                  <ImageBox>
                    <img src={product.image || '/images/placeholder.png'} alt={product.name} />
                  </ImageBox>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5, fontSize: 12 }} noWrap>
                    {product.name}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#000', mb: 0.5, fontSize: 14 }}>
                    ${product.price}{' '}
                    {product.oldPrice && (
                      <span style={{ color: '#999', textDecoration: 'line-through', fontWeight: 'normal', fontSize: 12 }}>
                        ${product.oldPrice}
                      </span>
                    )}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#db1b88',
                      color: '#fff',
                      '&:hover': { backgroundColor: '#b1166f' },
                      padding: '4px 12px',
                      fontSize: 11,
                      textTransform: 'none',
                    }}
                  >
                    Shop Now
                  </Button>
                </CardContent>
              </ProductCard>
            </Grid>
          ))
        ) : (
          <Typography sx={{ color: '#666', textAlign: 'center', width: '100%' }}>No products available.</Typography>
        )}
      </Grid>
    </SectionBox>
  );
};

export default DealsSection;
