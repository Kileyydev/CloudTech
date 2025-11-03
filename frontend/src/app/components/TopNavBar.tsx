// src/components/TopNavBar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Divider,
  Button,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Phone as PhoneIcon,
  FeedbackOutlined as FeedbackIcon,
  Menu as MenuIcon,
  Build as BuildIcon,
  Close as CloseIcon,
  SwapHoriz as TradeInIcon,
  ReceiptLong as ReceiptLongIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/hooks/useCart';

const PinkCloud = styled('span')({ color: '#DC1A8A', fontWeight: 'bold' });

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(180deg, #fff 40%, #9a979fff 100%)',
  backgroundColor: '#FFFFFF',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  padding: theme.spacing(0.75),
  [theme.breakpoints.down('sm')]: { display: 'none' },
  [theme.breakpoints.up('sm')]: { padding: theme.spacing(1) },
  [theme.breakpoints.up('lg')]: { padding: theme.spacing(1.2, 2.5) },
}));

const MobileAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  padding: theme.spacing(0.75),
  display: 'none',
  [theme.breakpoints.down('sm')]: { display: 'flex' },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  transition: 'all 0.2s ease',
  [theme.breakpoints.up('sm')]: { padding: theme.spacing(0.6) },
}));

const ActionText = styled('span')(({ theme }) => ({
  color: '#DC1A8A',
  fontWeight: '500',
  fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)',
  marginLeft: theme.spacing(0.6),
  display: 'none',
  [theme.breakpoints.up('lg')]: { display: 'inline', fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)' },
}));

const SearchDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '100%',
    maxWidth: 420,
    padding: theme.spacing(3),
    backgroundColor: '#fff',
  },
}));

const TopNavBar = () => {
  const theme = useTheme();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cart } = useCart();
  const [orderCount, setOrderCount] = useState(0);

  const cartItemCount = Object.values(cart).reduce((s, i) => s + (i.quantity || 0), 0);

  const getLatestOrderId = () => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    return orders.length ? orders[0].id : '';
  };

  useEffect(() => {
    const update = () => setOrderCount(JSON.parse(localStorage.getItem('orders') || '[]').length);
    update();
    const id = setInterval(update, 3000);
    return () => clearInterval(id);
  }, []);

  const toggleMobile = () => setMobileOpen(v => !v);
  const toggleSearch = () => setSearchOpen(v => !v);

  const performSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const drawerContent = (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src="/images/logo.jpeg" alt="CloudTech" onError={e => ((e.target as HTMLImageElement).src = '/images/fallback-logo.png')} style={{ height: 'clamp(24px,6vw,30px)', objectFit: 'contain' }} />
          <Typography variant="h6" sx={{ ml: 1, color: '#000', fontWeight: 'bold', fontSize: 'clamp(0.9rem,2vw,1rem)' }}>
            <PinkCloud>CLOUD</PinkCloud>TECH
          </Typography>
        </Link>
        <IconButton onClick={toggleMobile}><CloseIcon sx={{ color: '#000' }} /></IconButton>
      </Box>

      <List>
        {[
          { text: 'Contact Us', icon: <PhoneIcon />, href: '/contact-us' },
          { text: 'Repair', icon: <BuildIcon />, href: '/repair' },
          { text: 'Feedback', icon: <FeedbackIcon />, href: '/testimonials' },
          { text: 'Trade-in', icon: <TradeInIcon />, href: '/trade-in' },
          { text: 'Orders', icon: <ReceiptLongIcon />, href: orderCount ? `/orders/${getLatestOrderId()}` : '/orders', badge: orderCount },
          { text: 'Cart', icon: <ShoppingCartIcon />, href: '/cart', badge: cartItemCount },
        ].map(item => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={Link} href={item.href} onClick={toggleMobile}>
              <ListItemIcon>
                <Badge badgeContent={item.badge} color="error" invisible={!item.badge}>
                  <Box sx={{ color: '#000', fontSize: 'clamp(1.2rem,2.8vw,1.4rem)' }}>{item.icon}</Box>
                </Badge>
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 'clamp(0.9rem,2vw,1rem)', fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {/* === DESKTOP === */}
      <StyledAppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <img src="/images/logo.jpeg" alt="CloudTech" onError={e => ((e.target as HTMLImageElement).src = '/images/fallback-logo.png')} style={{ height: 'clamp(22px,5.5vw,28px)', objectFit: 'contain' }} />
              <Typography variant="h6" sx={{ ml: { sm: 1 }, color: '#000', fontWeight: 'bold', fontSize: 'clamp(0.85rem,1.8vw,0.95rem)' }}>
                <PinkCloud>CLOUD</PinkCloud>TECH
              </Typography>
            </Link>
          </Box>

          {/* RIGHT SIDE: Search + All Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { sm: 0.5, md: 1, lg: 1.2 } }}>
            {/* SEARCH ICON (now with the squad) */}
            <ActionButton onClick={toggleSearch}>
              <SearchIcon sx={{ color: '#DC1A8A' }} />
              <ActionText>Search</ActionText>
            </ActionButton>

            <Link href="/contact-us" style={{ textDecoration: 'none' }}>
              <ActionButton><PhoneIcon sx={{ color: '#DC1A8A' }} /><ActionText>Contact Us</ActionText></ActionButton>
            </Link>
            <Link href="/repair" style={{ textDecoration: 'none' }}>
              <ActionButton><BuildIcon sx={{ color: '#DC1A8A' }} /><ActionText>Repair</ActionText></ActionButton>
            </Link>
            <Link href="/testimonials" style={{ textDecoration: 'none' }}>
              <ActionButton><FeedbackIcon sx={{ color: '#DC1A8A' }} /><ActionText>Feedback</ActionText></ActionButton>
            </Link>
            <Link href="/trade-in" style={{ textDecoration: 'none' }}>
              <ActionButton><TradeInIcon sx={{ color: '#DC1A8A' }} /><ActionText>Trade-in</ActionText></ActionButton>
            </Link>

            <Link href={orderCount ? `/orders/${getLatestOrderId()}` : '/orders'} style={{ textDecoration: 'none' }}>
              <ActionButton>
                <Badge badgeContent={orderCount} color="error" invisible={!orderCount}>
                  <ReceiptLongIcon sx={{ color: '#DC1A8A' }} />
                </Badge>
                <ActionText>Orders</ActionText>
              </ActionButton>
            </Link>

            <Link href="/cart" style={{ textDecoration: 'none' }}>
              <ActionButton>
                <Badge badgeContent={cartItemCount} color="error" invisible={!cartItemCount}>
                  <ShoppingCartIcon sx={{ color: '#DC1A8A' }} />
                </Badge>
                <ActionText>Cart</ActionText>
              </ActionButton>
            </Link>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* === MOBILE === */}
      <MobileAppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img src="/images/logo.jpeg" alt="CloudTech" onError={e => ((e.target as HTMLImageElement).src = '/images/fallback-logo.png')} style={{ height: 'clamp(20px,5vw,24px)', objectFit: 'contain' }} />
            <Typography sx={{ ml: 1, color: '#000', fontWeight: 'bold', fontSize: 'clamp(0.8rem,2vw,0.9rem)' }}>
              <PinkCloud>CLOUD</PinkCloud>TECH
            </Typography>
          </Link>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Mobile Search Icon */}
            <IconButton onClick={toggleSearch}>
              <SearchIcon sx={{ color: '#DC1A8A', fontSize: 26 }} />
            </IconButton>
            <IconButton onClick={toggleMobile} sx={{ color: '#000' }}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </MobileAppBar>

      {/* MENU DRAWER */}
      <Drawer anchor="left" open={mobileOpen} onClose={toggleMobile}>
        {drawerContent}
      </Drawer>

      {/* SEARCH DRAWER */}
      <SearchDrawer anchor="top" open={searchOpen} onClose={toggleSearch}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#DC1A8A', fontWeight: 600 }}>
            What are you looking for?
          </Typography>
          <TextField
            autoFocus
            fullWidth
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && performSearch()}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#DC1A8A' }} /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={performSearch}><SearchIcon sx={{ color: '#DC1A8A' }} /></IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: '30px', bgcolor: '#f0f0f0', px: 2 },
            }}
            variant="outlined"
            size="medium"
          />
          <Divider sx={{ my: 3 }} />
          <Button variant="text" onClick={toggleSearch} sx={{ color: '#666' }}>
            Cancel
          </Button>
        </Box>
      </SearchDrawer>
    </>
  );
};

export default TopNavBar;