"use client";
import { Box, Grid, Typography, Card, CardContent, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Box for the section
const SectionBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  padding: theme.spacing(4, 0), // Removed side padding to eliminate edge spaces
  color: '#000000',
  textAlign: 'center',
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

// Styled Card for product layout with consistent size
const ProductCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  height: 400, // Fixed height for uniform size
  width: '100%', // Ensures cards take full available width
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
  },
}));

// Example component
const ProductSection = () => {
  const products = [
    { name: 'Asus Laptop', price: '$15,000', rating: '4.5k', image: '/images/Asus.jpg' },
    { name: 'Headphone', price: '$2000', rating: '4.5k', image: '/images/headphones.jpg' },
    { name: 'Smart Watch', price: '$1000', rating: '4.5k', image: '/images/watch.webp' },
    { name: 'Gaming Mouse', price: '$150', rating: '4.2k', image: '/images/mouse.webp' },
    { name: 'Keyboard', price: '$300', rating: '4.3k', image: '/images/keyboard.jpg' },
    { name: 'Monitor', price: '$800', rating: '4.6k', image: '/images/monitor.jpg' },
    { name: 'Speaker', price: '$250', rating: '4.4k', image: '/images/alexa.webp' },
    { name: 'Webcam', price: '$120', rating: '4.1k', image: '/images/webcam.jpg' },
  ];

  return (
    <SectionBox>
      <Title>Featured Products</Title>
      <Grid container spacing={3} justifyContent="center" alignItems="stretch">
        {products.map((product, index) => (
          <Grid item xs={12} sm={2.4} key={index}> {/* Adjusted to 2.4 to fit five cards */}
            <ProductCard>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: 1 }}>
                <Box sx={{ mb: 2, height: 200, overflow: 'hidden' }}> {/* Increased height for consistent image size */}
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ maxWidth: '100%', height: '100%', objectFit: 'cover' }} // Changed to cover to fill space
                  />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333333', mb: 1 }}>
                  {product.name}
                </Typography>
                <Typography variant="body1" sx={{ color: '#666666', mb: 1 }}>
                  {product.price} <span style={{ color: '#FF9800' }}>★ {product.rating}</span>
                </Typography>
                <Button variant="contained" sx={{ backgroundColor: '#000000', color: '#FFFFFF', '&:hover': { backgroundColor: '#333333' } }}>
                  Shop Now →
                </Button>
              </CardContent>
            </ProductCard>
          </Grid>
        ))}
      </Grid>
    </SectionBox>
  );
};

export default ProductSection;