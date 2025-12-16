'use client';

import { Box, Typography, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BuildIcon from '@mui/icons-material/Build';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ShieldIcon from '@mui/icons-material/Shield';

const SectionBox = styled(Box)(({ theme }) => ({
  background: '#fff',
  padding: theme.spacing(6, 0),
  color: '#000',
  position: 'relative',
}));

// Thin black line on top
const TopLine = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '2px', // thin line
  backgroundColor: '#000',
});

const FeaturesRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: theme.spacing(3),
  flexWrap: 'wrap',

  [theme.breakpoints.up('lg')]: {
    flexWrap: 'nowrap',
  },
}));

const FeatureItem = styled(Box)(({ theme }) => ({
  flex: '1 1 180px',
  textAlign: 'center',
  padding: theme.spacing(2),
  transition: 'transform 0.25s ease',

  '&:hover': {
    transform: 'translateY(-6px)',
  },
}));

const FeatureSection = () => {
  const features = [
    {
      icon: <LocalShippingIcon sx={{ fontSize: 42 }} />,
      title: 'Fast Delivery',
      description: 'Get your gadgets delivered in 1–3 days.',
    },
    {
      icon: <BuildIcon sx={{ fontSize: 42 }} />,
      title: 'Device Repairs',
      description: 'Expert repairs for phones and tablets.',
    },
    {
      icon: <SwapHorizIcon sx={{ fontSize: 42 }} />,
      title: 'Trade-In',
      description: 'Trade old devices for store credit.',
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 42 }} />,
      title: '24/7 Support',
      description: 'We are always here to help.',
    },
    {
      icon: <ShieldIcon sx={{ fontSize: 42 }} />,
      title: 'Warranty',
      description: 'All products are fully covered.',
    },
  ];

  return (
    <SectionBox>
      <TopLine />
      <Container maxWidth="xl">
        <FeaturesRow>
          {features.map((feature, index) => (
            <FeatureItem key={index}>
              <Box sx={{ mb: 1 }}>{feature.icon}</Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                {feature.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#555', fontSize: '0.9rem' }}>
                {feature.description}
              </Typography>
            </FeatureItem>
          ))}
        </FeaturesRow>
      </Container>
    </SectionBox>
  );
};

export default FeatureSection;
