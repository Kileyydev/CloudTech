"use client";
import { Box, Grid, Typography, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';

// Styled Box for the section
const SectionBox = styled(Box)(({ theme }) => ({
  background: '#ffffffff', // White background
  padding: theme.spacing(4),
  color: '#000000', // Black text
  textAlign: 'center',
}));

// Styled Card for shadow effect
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow
  borderRadius: 8,
  transition: 'transform 0.2s',
  height: 200, // Fixed height for even content distribution
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
  },
}));

// Example component
const FeatureSection = () => {
  return (
    <SectionBox>
      <Grid container spacing={3} justifyContent="center" alignItems="stretch">
        <Grid item xs={12} sm={3}>
          <StyledCard>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Box sx={{ mb: 2 }}>
                <LocalShippingIcon sx={{ fontSize: 40, color: '#333333' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333333', mb: 1 }}>
                Fast Delivery
              </Typography>
              <Typography variant="body2" sx={{ color: '#666666', flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                Lorem ipsum is a place commonly used.
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={3}>
          <StyledCard>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Box sx={{ mb: 2 }}>
                <ShoppingCartIcon sx={{ fontSize: 40, color: '#333333' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333333', mb: 1 }}>
                Free Delivery
              </Typography>
              <Typography variant="body2" sx={{ color: '#666666', flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                Lorem ipsum is a place commonly used.
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={3}>
          <StyledCard>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Box sx={{ mb: 2 }}>
                <HeadsetMicIcon sx={{ fontSize: 40, color: '#333333' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333333', mb: 1 }}>
                Online Support
              </Typography>
              <Typography variant="body2" sx={{ color: '#666666', flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                Lorem ipsum is a place commonly used.
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </SectionBox>
  );
};

export default FeatureSection;