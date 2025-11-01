// src/components/TopNavBar.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  InputBase,
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
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Phone as PhoneIcon,
  FeedbackOutlined as FeedbackIcon,
  Menu as MenuIcon,
  Build as BuildIcon,
  Close as CloseIcon,
  SwapHoriz as TradeInIcon,
  ReceiptLong as ReceiptLongIcon,
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/hooks/useCart';
import { IconButtonProps } from '@mui/material/IconButton';

interface LinkIconButtonProps extends IconButtonProps {
  component?: React.ComponentType<LinkProps>;
  href?: string;
}

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(180deg, #fff 40%, #9a979fff 100%)',
  backgroundColor: '#FFFFFF',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(0.75),
  display: 'flex',
  [theme.breakpoints.down('sm')]: { display: 'none' },
  [theme.breakpoints.up('sm')]: { padding: theme.spacing(1) },
  [theme.breakpoints.up('lg')]: { padding: theme.spacing(1.2, 2.5) },
  [theme.breakpoints.up('xl')]: { padding: theme.spacing(1.5, 3) },
}));

const MobileAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(0.75),
  display: 'none',
  [theme.breakpoints.down('sm')]: { display: 'flex' },
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  backgroundColor: '#DC1A8A',
  border: '2px solid #DC1A8A',
  boxShadow: '0 0 8px rgba(220, 26, 138, 0.5)',
  marginLeft: theme.spacing(1),
  width: '100%',
  maxWidth: '400px',
  [theme.breakpoints.up('sm')]: { marginLeft: theme.spacing(2), width: '28vw', maxWidth: '200px' },
  [theme.breakpoints.up('md')]: { width: '30vw', maxWidth: '240px' },
  [theme.breakpoints.up('lg')]: { width: '40vw', maxWidth: '350px' },
  [theme.breakpoints.up('xl')]: { width: '45vw', maxWidth: '450px' },
  [theme.breakpoints.down('sm')]: { margin: theme.spacing(2, 0), maxWidth: '100%' },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 0.75),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.up('sm')]: { padding: theme.spacing(0, 1) },
}));

const PinkCloud = styled('span')({ color: '#DC1A8A', fontWeight: 'bold' });

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'white',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(0.6, 0.6, 0.6, 0),
    paddingLeft: `calc(1em + ${theme.spacing(2.2)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)',
    [theme.breakpoints.up('sm')]: {
      fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
      paddingLeft: `calc(1em + ${theme.spacing(2)})`,
      width: '12ch',
      '&:focus': { width: '16ch' },
    },
    [theme.breakpoints.up('md')]: { width: '14ch', '&:focus': { width: '18ch' } },
    [theme.breakpoints.up('lg')]: { fontSize: 'clamp(0.75rem, 1.8vw, 0.9rem)' },
  },
  '& .MuiInputBase-input::placeholder': { color: '#FFFFFF', opacity: 0.8 },
}));

const ActionButton = styled(IconButton)<LinkIconButtonProps>(({ theme }) => ({
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
  [theme.breakpoints.up('xl')]: { fontSize: 'clamp(0.75rem, 1.8vw, 0.9rem)' },
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '280px',
    backgroundColor: '#FFFFFF',
    padding: theme.spacing(2),
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

const TopNavBar = () => {
  const theme = useTheme();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cart } = useCart();
  const [orderCount, setOrderCount] = useState(0);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const cartItemCount = Object.values(cart).reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Helper: Get latest order ID
  const getLatestOrderId = () => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    return orders.length > 0 ? orders[0].id : '';
  };

  // Update order count
  useEffect(() => {
    const updateOrderCount = () => {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      setOrderCount(orders.length);
    };

    updateOrderCount();
    const interval = setInterval(updateOrderCount, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleSearch = (value: string) => {
    const query = value.trim();
    if (!query) return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setSearchValue('');
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch(searchValue);
  };

  const drawerContent = (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img
            src="/images/logo.jpeg"
            alt="CloudTech"
            onError={(e) => ((e.target as HTMLImageElement).src = '/images/fallback-logo.png')}
            style={{ height: 'clamp(24px, 6vw, 30px)', maxWidth: '100%', objectFit: 'contain' }}
          />
          <Typography
            variant="h6"
            sx={{ ml: 1, color: '#000000', fontWeight: 'bold', fontSize: 'clamp(0.9rem, 2vw, 1rem)', whiteSpace: 'nowrap' }}
          >
            <PinkCloud>CLOUD</PinkCloud>TECH
          </Typography>
        </Link>
        <IconButton onClick={handleDrawerToggle} aria-label="close menu">
          <CloseIcon sx={{ color: '#000000' }} />
        </IconButton>
      </Box>

      <Search sx={{ mb: 2 }}>
        <SearchIconWrapper>
          <SearchIcon sx={{ color: 'white', fontSize: 'clamp(1.1rem, 2.8vw, 1.2rem)' }} />
        </SearchIconWrapper>
        <StyledInputBase
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search products..."
          inputProps={{ 'aria-label': 'search' }}
        />
        {searchValue && (
          <IconButton
            size="small"
            onClick={() => handleSearch(searchValue)}
            sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'white' }}
          >
            <SearchIcon fontSize="small" />
          </IconButton>
        )}
      </Search>

      <List>
        {[
          { text: 'Contact Us', icon: <PhoneIcon />, href: '/contact-us' },
          { text: 'Repair', icon: <BuildIcon />, href: '/repair' },
          { text: 'Feedback', icon: <FeedbackIcon />, href: '/testimonials' },
          { text: 'Trade-in', icon: <TradeInIcon />, href: '/trade-in' },
          {
            text: 'Orders',
            icon: <ReceiptLongIcon />,
            href: orderCount > 0 ? `/orders/${getLatestOrderId()}` : '/orders',
            badge: orderCount,
          },
          { text: 'Cart', icon: <ShoppingCartIcon />, href: '/cart', badge: cartItemCount },
        ].map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              onClick={() => {
                handleDrawerToggle();
                if (item.text === 'Cart' && cartItemCount === 0) {
                  // Optional toast
                }
              }}
            >
              <ListItemIcon>
                <Badge
                  badgeContent={item.badge}
                  color="error"
                  invisible={!item.badge || item.badge === 0}
                  sx={{ '& .MuiBadge-badge': { fontSize: '0.55rem', padding: '2px 4px' } }}
                >
                  <Box sx={{ color: '#000000', fontSize: 'clamp(1.2rem, 2.8vw, 1.4rem)' }}>{item.icon}</Box>
                </Badge>
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', color: '#000000', fontWeight: '500' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {/* Desktop Nav */}
      <StyledAppBar position="static">
        <Toolbar sx={{ flexWrap: { sm: 'nowrap' }, justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, mr: { sm: 2 } }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <img
                src="/images/logo.jpeg"
                alt="CloudTech"
                onError={(e) => ((e.target as HTMLImageElement).src = '/images/fallback-logo.png')}
                style={{ height: 'clamp(22px, 5.5vw, 28px)', maxWidth: '100%', objectFit: 'contain' }}
              />
              <Typography
                variant="h6"
                sx={{
                  ml: { sm: 1 },
                  color: '#000000',
                  fontWeight: 'bold',
                  fontSize: { sm: 'clamp(0.85rem, 1.8vw, 0.95rem)', md: 'clamp(0.95rem, 1.8vw, 1.1rem)' },
                  whiteSpace: 'nowrap',
                }}
              >
                <PinkCloud>CLOUD</PinkCloud>TECH
              </Typography>
            </Link>
          </Box>

          {/* Search Bar */}
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: { sm: 'auto' }, maxWidth: { sm: '50%', md: '60%' } }}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon sx={{ color: 'white', fontSize: { sm: 'clamp(1rem, 2.5vw, 1.1rem)' } }} />
              </SearchIconWrapper>
              <StyledInputBase
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search products..."
                inputProps={{ 'aria-label': 'search' }}
              />
              {searchValue && (
                <IconButton
                  size="small"
                  onClick={() => handleSearch(searchValue)}
                  sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'white' }}
                >
                  <SearchIcon fontSize="small" />
                </IconButton>
              )}
            </Search>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: { sm: 0.5, md: 1, lg: 1.2 } }}>
            <ActionButton component={Link} href="/contact-us" aria-label="contact us">
              <PhoneIcon sx={{ color: '#DC1A8A', fontSize: { sm: 'clamp(1.1rem, 2.5vw, 1.2rem)' } }} />
              <ActionText>Contact Us</ActionText>
            </ActionButton>

            <ActionButton component={Link} href="/repair" aria-label="repair">
              <BuildIcon sx={{ color: '#DC1A8A', fontSize: { sm: 'clamp(1.1rem, 2.5vw, 1.2rem)' } }} />
              <ActionText>Repair</ActionText>
            </ActionButton>

            <ActionButton component={Link} href="/testimonials" aria-label="feedback">
              <FeedbackIcon sx={{ color: '#DC1A8A', fontSize: { sm: 'clamp(1.1rem, 2.5vw, 1.2rem)' } }} />
              <ActionText>Feedback</ActionText>
            </ActionButton>

            <ActionButton component={Link} href="/trade-in" aria-label="trade in">
              <TradeInIcon sx={{ color: '#DC1A8A', fontSize: { sm: 'clamp(1.1rem, 2.5vw, 1.2rem)' } }} />
              <ActionText>Trade-in</ActionText>
            </ActionButton>

            {/* ORDERS BUTTON → LATEST ORDER */}
            <ActionButton
              component={Link}
              href={orderCount > 0 ? `/orders/${getLatestOrderId()}` : '/orders'}
              aria-label="orders"
            >
              <Badge
                badgeContent={orderCount}
                color="error"
                invisible={orderCount === 0}
                sx={{ '& .MuiBadge-badge': { fontSize: '0.55rem', padding: '2px 4px' } }}
              >
                <ReceiptLongIcon sx={{ color: '#DC1A8A', fontSize: { sm: 'clamp(1.1rem, 2.5vw, 1.2rem)' } }} />
              </Badge>
              <ActionText>Orders</ActionText>
            </ActionButton>

            <ActionButton component={Link} href="/cart" aria-label="cart">
              <Badge
                badgeContent={cartItemCount}
                color="error"
                invisible={cartItemCount === 0}
                sx={{ '& .MuiBadge-badge': { fontSize: '0.55rem', padding: '2px 4px' } }}
              >
                <ShoppingCartIcon sx={{ color: '#DC1A8A', fontSize: { sm: 'clamp(1.1rem, 2.5vw, 1.2rem)' } }} />
              </Badge>
              <ActionText>Cart</ActionText>
            </ActionButton>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Mobile Nav */}
      <MobileAppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <img
                src="/images/logo.jpeg"
                alt="CloudTech"
                onError={(e) => ((e.target as HTMLImageElement).src = '/images/fallback-logo.png')}
                style={{ height: 'clamp(20px, 5vw, 24px)', maxWidth: '100%', objectFit: 'contain' }}
              />
              <Typography
                variant="h6"
                sx={{ ml: 1, color: '#000000', fontWeight: 'bold', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', whiteSpace: 'nowrap' }}
              >
                <PinkCloud>CLOUD</PinkCloud>TECH
              </Typography>
            </Link>
          </Box>
          <IconButton color="inherit" aria-label="open menu" edge="end" onClick={handleDrawerToggle} sx={{ color: '#000000' }}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </MobileAppBar>

      {/* Mobile Drawer */}
      <StyledDrawer variant="temporary" anchor="left" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }}>
        {drawerContent}
      </StyledDrawer>
    </>
  );
};

export default TopNavBar;