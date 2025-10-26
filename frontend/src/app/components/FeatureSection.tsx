"use client";
import { Box, Typography, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BuildIcon from '@mui/icons-material/Build';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const SectionBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(180deg, #fff 0%, #a29fa6 100%)',
  padding: theme.spacing(3),
  color: '#000000',
  textAlign: 'center',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3.5),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(4.5),
  },
  [theme.breakpoints.up('xl')]: {
    padding: theme.spacing(5),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(1.5),
  boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s',
  height: 150,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 4.5px 9px rgba(0, 0, 0, 0.15)',
  },
  [theme.breakpoints.down('sm')]: {
    height: 120,
  },
}));

const FeatureSection = () => {
  return (
    <SectionBox>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'stretch',
          gap: 2,
          '& > *': {
            flex: { xs: '1 1 100%', sm: '1 1 calc(20% - 16px)' }, // Full width on xs, ~20% width on sm and up
            minWidth: 0,
          },
        }}
      >
        <StyledCard>
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Box sx={{ mb: 1.5 }}>
              <LocalShippingIcon sx={{ fontSize: 'clamp(30px, 4vw, 32px)', color: '#333333' }} />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 'bold', color: '#333333', mb: 0.75, fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}
            >
              Fast Delivery
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#666666', flexGrow: 1, display: 'flex', alignItems: 'center', fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)' }}
            >
              Get your gadgets delivered in 1-3 days across the country.
            </Typography>
          </CardContent>
        </StyledCard>

        <StyledCard>
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Box sx={{ mb: 1.5 }}>
              <BuildIcon sx={{ fontSize: 'clamp(30px, 4vw, 32px)', color: '#333333' }} />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 'bold', color: '#333333', mb: 0.75, fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}
            >
              Device Repairs
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#666666', flexGrow: 1, display: 'flex', alignItems: 'center', fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)' }}
            >
              Expert repairs for phones, tablets, and more.
            </Typography>
          </CardContent>
        </StyledCard>

        <StyledCard>
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Box sx={{ mb: 1.5 }}>
              <SwapHorizIcon sx={{ fontSize: 'clamp(30px, 4vw, 32px)', color: '#333333' }} />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 'bold', color: '#333333', mb: 0.75, fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}
            >
              Trade-In Program
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#666666', flexGrow: 1, display: 'flex', alignItems: 'center', fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)' }}
            >
              Trade in your old devices for store credit.
            </Typography>
          </CardContent>
        </StyledCard>
      </Box>
    </SectionBox>
  );
};

export default FeatureSection;