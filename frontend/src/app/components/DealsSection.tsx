"use client";
import { Box, Grid, Typography, Card, CardContent, Button, IconButton, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import React from 'react';

// Styled Box for the section
const SectionBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  padding: theme.spacing(4, 0), // Removed side padding to eliminate edge spaces
  color: '#000000',
  textAlign: 'left',
  position: 'relative',
}));

// Styled Title for the section
const Title = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  color: '#333333',
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  textTransform: 'uppercase',
  letterSpacing: '2px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.75rem',
    marginBottom: theme.spacing(2),
  },
}));

// Styled Card for product layout
const ProductCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  borderRadius: 16,
  height: 200,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
  },
}));

// Styled Image Box for background
const ImageBox = styled(Box)(({ theme }) => ({
  height: 400,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  '& img': {
    width: '380%', // Increased width to 120% to make it larger
    height: '100%',
    objectFit: 'cover',
  },
}));

// Styled Category Icon Box
const CategoryIconBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
  position: 'relative',
  zIndex: 1,
}));

// Styled Navigation Buttons
const NavButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: '#FFFFFF',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
}));

const DealsSection = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const categories = [
    { name: 'Phones', icon: 'https://via.placeholder.com/40?text=Phones' },
    { name: 'Gaming', icon: 'https://via.placeholder.com/40?text=Gaming' },
    { name: 'Headphones', icon: 'https://via.placeholder.com/40?text=Headphones' },
  ];

  const products = {
    Phones: [
      { name: 'iPhone 14 - 128GB', price: '£699.00', oldPrice: '£799.00-new', rating: '4.7/5 (1200)', image: 'https://via.placeholder.com/200?text=iPhone+14' },
      { name: 'Samsung Galaxy S23', price: '£649.00', oldPrice: '£749.00-new', rating: '4.6/5 (950)', image: 'https://via.placeholder.com/200?text=Galaxy+S23' },
    ],
    Gaming: [
      { name: 'PlayStation 5', price: '£449.00', oldPrice: '£499.00-new', rating: '4.8/5 (800)', image: 'https://via.placeholder.com/200?text=PS5' },
      { name: 'Xbox Series X', price: '£429.00', oldPrice: '£479.00-new', rating: '4.7/5 (700)', image: 'https://via.placeholder.com/200?text=Xbox+Series+X' },
    ],
    Headphones: [
      { name: 'AirPods Pro', price: '£199.00', oldPrice: '£249.00-new', rating: '4.6/5 (600)', image: 'https://via.placeholder.com/200?text=AirPods+Pro' },
      { name: 'Sony WH-1000XM5', price: '£329.00', oldPrice: '£379.00-new', rating: '4.9/5 (450)', image: 'https://via.placeholder.com/200?text=Sony+WH-1000XM5' },
    ],
  };

  return (
    <SectionBox>
      <Title>Best Deals</Title>
      <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
        <Grid item xs={12} md={5}> {/* Increased from md={4} to md={5} for wider image */}
          <ImageBox>
            <img src="/images/apple.jpg" alt="Product" />
          </ImageBox>
        </Grid>
        <Grid item xs={12} md={7}> {/* Adjusted to md={7} to balance with wider image */}
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4, color: '#000000' }}>
            Shop our best deals
          </Typography>
          <CategoryIconBox>
            <Tabs value={value} onChange={handleChange} aria-label="product categories" sx={{ mb: 4 }}>
              {categories.map((category, index) => (
                <Tab key={index} label={category.name} icon={<img src={category.icon} alt={category.name} style={{ width: 40, height: 40, objectFit: 'contain' }} />} sx={{ minWidth: 100 }} />
              ))}
            </Tabs>
          </CategoryIconBox>
          <Grid container spacing={3} justifyContent="center" alignItems="stretch">
            {products[Object.keys(products)[value]].map((product, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <ProductCard>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: 2 }}>
                    <Box sx={{ mb: 2, height: 150, overflow: 'hidden' }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ maxWidth: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#666666', mb: 1, fontSize: 14 }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#000000', mb: 1 }}>
                      {product.price} <span style={{ color: '#999999', textDecoration: 'line-through', fontWeight: 'normal' }}>{product.oldPrice}</span>
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666666', mb: 2 }}>
                      {product.rating}
                    </Typography>
                    <Button variant="contained" sx={{ backgroundColor: '#000000', color: '#FFFFFF', '&:hover': { backgroundColor: '#333333' }, padding: '6px 16px', fontSize: 12 }}>
                      Shop Now
                    </Button>
                  </CardContent>
                </ProductCard>
              </Grid>
            ))}
          </Grid>
          <NavButton sx={{ left: 16 }}>
            <ArrowBackIcon />
          </NavButton>
          <NavButton sx={{ right: 16 }}>
            <ArrowForwardIcon />
          </NavButton>
        </Grid>
      </Grid>
    </SectionBox>
  );
};

export default DealsSection;