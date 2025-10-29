// src/components/TickerBar.tsx
'use client';

import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Sync,
  Shield,
  SwapHoriz,
  CardGiftcard,
  Support,
  LocalShipping,
  LocationOn,
  Phone,
  ShoppingBag,
} from '@mui/icons-material';

const TickerWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  color: '#fff',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  padding: theme.spacing(0.8, 0),
  fontSize: '0.85rem',
  position: 'relative',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
}));

const TickerContent = styled(Box)({
  display: 'inline-block',
  animation: 'ticker 45s linear infinite',
  paddingLeft: '100%',
  '&:hover': {
    animationPlayState: 'paused',
  },
  '@keyframes ticker': {
    '0%': { transform: 'translateX(0)' },
    '100%': { transform: 'translateX(-100%)' },
  },
});

const Item = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  marginRight: '24px',
  fontWeight: 500,
}));

export default function TickerBar() {
  const items = [
    { icon: <ShoppingBag fontSize="inherit" />, text: 'Premium All Electronics Dealer' },
    { icon: <Sync fontSize="inherit" />, text: 'Trade-in Accepted' },
    { icon: <Shield fontSize="inherit" />, text: 'Warranty' },
    { icon: <SwapHoriz fontSize="inherit" />, text: 'Data Transfer' },
    { icon: <CardGiftcard fontSize="inherit" />, text: 'Free glass protector' },
    { icon: <Support fontSize="inherit" />, text: 'Customer Support' },
    { icon: <LocalShipping fontSize="inherit" />, text: 'Delivery Country-wide' },
    { icon: <LocationOn fontSize="inherit" />, text: 'Cookie House 3rd Flr Shop 301' },
    { icon: <Phone fontSize="inherit" />, text: '0722244482 / 0711357878' },
    { icon: <ShoppingBag fontSize="inherit" />, text: 'Happy Shopping…' },
  ];

  return (
    <TickerWrapper>
      <TickerContent>
        {[...items, ...items].map((item, i) => (
          <Item key={i}>
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                color: '#fff',
                fontSize: '14px', // Smaller, clean icons
              }}
            >
              {item.icon}
            </Box>
            <Typography
              variant="body2"
              component="span"
              sx={{ fontSize: '0.85rem', letterSpacing: '0.2px' }}
            >
              {item.text}
            </Typography>
          </Item>
        ))}
      </TickerContent>
    </TickerWrapper>
  );
}