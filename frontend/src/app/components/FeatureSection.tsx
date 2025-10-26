'use client';

import { Box, Typography, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BuildIcon from '@mui/icons-material/Build';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const SectionBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(180deg, #9a979fff 40%, #fff 100%)',
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
  height: 'clamp(140px, 30vw, 160px)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  [theme.breakpoints.up('sm')]: {
    height: 'clamp(150px, 25vw, 180px)',
  },
  [theme.breakpoints.up('lg')]: {
    height: 'clamp(160px, 20vw, 200px)',
  },
}));

const FeatureSection = () => {
  const features = [
    {
      icon: <LocalShippingIcon sx={{ fontSize: 'clamp(32px, 4.5vw, 36px)', color: '#000000' }} />,
      title: 'Fast Delivery',
      description: 'Get your gadgets delivered in 1-3 days across the country.',
    },
    {
      icon: <BuildIcon sx={{ fontSize: 'clamp(32px, 4.5vw, 36px)', color: '#000000' }} />,
      title: 'Device Repairs',
      description: 'Expert repairs for phones, tablets, and more.',
    },
    {
      icon: <SwapHorizIcon sx={{ fontSize: 'clamp(32px, 4.5vw, 36px)', color: '#000000' }} />,
      title: 'Trade-In Program',
      description: 'Trade in your old devices for store credit.',
    },
  ];

  return (
    <SectionBox>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'stretch',
          gap: { xs: 2, sm: 1, md: 1, lg: 1.5 },
          '& > *': {
            flex: { xs: '1 1 100%', sm: '1 1 calc(33.33% - 8px)', md: '1 1 calc(33.33% - 8px)', lg: '1 1 calc(33.33% - 12px)' },
            minWidth: 0,
          },
        }}
      >
        {features.map((feature, index) => (
          <StyledCard key={index}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Box sx={{ mb: 1.5 }}>{feature.icon}</Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 'bold', color: '#000000', mb: 0.75, fontSize: 'clamp(0.95rem, 2.2vw, 1.05rem)' }}
              >
                {feature.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#666666', flexGrow: 1, display: 'flex', alignItems: 'center', fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)' }}
              >
                {feature.description}
              </Typography>
            </CardContent>
          </StyledCard>
        ))}
      </Box>
    </SectionBox>
  );
};

export default FeatureSection;