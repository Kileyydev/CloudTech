'use client';

import React, { useState } from 'react';
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
  Person as PersonIcon,
  FeedbackOutlined as FeedbackIcon,
  Menu as MenuIcon,
  Build as BuildIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import Link, { LinkProps } from 'next/link';
import { useCart } from '@/app/hooks/useCart';
import { IconButtonProps } from '@mui/material/IconButton';

interface LinkIconButtonProps extends IconButtonProps {
  component?: React.ComponentType<LinkProps>;
  href?: string;
}

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(0.75),
  display: 'flex',
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(1.2, 2.5),
  },
  [theme.breakpoints.up('xl')]: {
    padding: theme.spacing(1.5, 3),
  },
}));

const MobileAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(0.75),
  display: 'none',
  [theme.breakpoints.down('sm')]: {
    display: 'flex',
  },
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  backgroundColor: '#DC1A8A',
  border: '2px solid #DC1A8A',
  boxShadow: '0 0 8px rgba(220, 26, 138, 0.5)',
  '&:hover': {
    backgroundColor: '#B31774',
    boxShadow: '0 0 12px rgba(220, 26, 138, 0.7)',
  },
  marginLeft: theme.spacing(1),
  width: '100%',
  maxWidth: '400px',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(2),
    width: '28vw',
    maxWidth: '200px',
  },
  [theme.breakpoints.up('md')]: {
    width: '30vw',
    maxWidth: '240px',
  },
  [theme.breakpoints.up('lg')]: {
    width: '40vw',
    maxWidth: '350px',
  },
  [theme.breakpoints.up('xl')]: {
    width: '45vw',
    maxWidth: '450px',
  },
  [theme.breakpoints.down('sm')]: {
    margin: theme.spacing(2, 0),
    maxWidth: '100%',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 0.75),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(0, 1),
  },
}));

const PinkCloud = styled('span')({
  color: '#DC1A8A',
  fontWeight: 'bold',
});

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
      '&:focus': {
        width: '16ch',
      },
    },
    [theme.breakpoints.up('md')]: {
      width: '14ch',
      '&:focus': {
        width: '18ch',
      },
    },
    [theme.breakpoints.up('lg')]: {
      fontSize: 'clamp(0.75rem, 1.8vw, 0.9rem)',
    },
  },
  '& .MuiInputBase-input::placeholder': {
    color: '#FFFFFF',
    opacity: 0.8,
  },
}));

const ActionButton = styled(IconButton)<LinkIconButtonProps>(({ theme }) => ({
  padding: theme.spacing(0.5),
  borderRadius: '0',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(220, 26, 138, 0.1)',
    transform: 'scale(1.1)',
  },
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(0.6),
  },
}));

const ActionText = styled('span')(({ theme }) => ({
  color: '#DC1A8A',
  fontWeight: '500',
  fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)',
  marginLeft: theme.spacing(0.6),
  display: 'none',
  [theme.breakpoints.up('lg')]: {
    display: 'inline',
    fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)',
  },
  [theme.breakpoints.up('xl')]: {
    fontSize: 'clamp(0.75rem, 1.8vw, 0.9rem)',
  },
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
  const [searchValue, setSearchValue] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cart } = useCart();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img
            src="/images/logo.jpeg"
            alt="CloudTech"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/fallback-logo.png';
            }}
            style={{
              height: 'clamp(24px, 6vw, 30px)',
              maxWidth: '100%',
              objectFit: 'contain',
            }}
          />
          <Typography
            variant="h6"
            sx={{
              ml: 1,
              color: '#000000',
              fontWeight: 'bold',
              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
              whiteSpace: 'nowrap',
            }}
          >
            <PinkCloud>CLOUD</PinkCloud>TECH
          </Typography>
        </Link>
        <IconButton onClick={handleDrawerToggle} aria-label="close menu">
          <CloseIcon sx={{ color: '#000000' }} />
        </IconButton>
      </Box>
      <Search>
        <SearchIconWrapper>
          <SearchIcon sx={{ color: 'white', fontSize: 'clamp(1.1rem, 2.8vw, 1.2rem)' }} />
        </SearchIconWrapper>
        <StyledInputBase
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search products..."
          inputProps={{ 'aria-label': 'search' }}
        />
      </Search>
      <List>
        {[
          { text: 'Contact Us', icon: <PhoneIcon />, href: '/contact-us' },
          { text: 'Repair', icon: <BuildIcon />, href: '/repair' },
          { text: 'Trade-in', icon: <FeedbackIcon />, href: '/trade-in' },
          { text: 'Cart', icon: <ShoppingCartIcon />, href: '/cart', badge: cart.length },
          { text: 'Profile', icon: <PersonIcon />, href: '/profile', badge: 0 },
        ].map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={Link} href={item.href} onClick={handleDrawerToggle}>
              <ListItemIcon>
                <Badge
                  badgeContent={item.badge}
                  color="error"
                  sx={{ '& .MuiBadge-badge': { fontSize: '0.55rem', padding: '2px 4px' } }}
                >
                  <Box sx={{ color: '#000000', fontSize: 'clamp(1.2rem, 2.8vw, 1.4rem)' }}>
                    {item.icon}
                  </Box>
                </Badge>
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                  color: '#000000',
                  fontWeight: '500',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <StyledAppBar position="static">
        <Toolbar sx={{ flexWrap: { sm: 'nowrap' }, justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, mr: { sm: 2 } }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <img
                src="/images/logo.jpeg"
                alt="CloudTech"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/fallback-logo.png';
                }}
                style={{
                  height: 'clamp(22px, 5.5vw, 28px)',
                  maxWidth: '100%',
                  objectFit: 'contain',
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  ml: { sm: 1 },
                  color: '#000000',
                  fontWeight: 'bold',
                  fontSize: {
                    sm: 'clamp(0.85rem, 1.8vw, 0.95rem)',
                    md: 'clamp(0.95rem, 1.8vw, 1.1rem)',
                  },
                  whiteSpace: 'nowrap',
                }}
              >
                <PinkCloud>CLOUD</PinkCloud>TECH
              </Typography>
            </Link>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { sm: 'auto' },
              maxWidth: { sm: '50%', md: '60%' },
            }}
          >
            <Search>
              <SearchIconWrapper>
                <SearchIcon sx={{ color: 'white', fontSize: { sm: 'clamp(1rem, 2.5vw, 1.1rem)' } }} />
              </SearchIconWrapper>
              <StyledInputBase
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search products..."
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'nowrap',
              gap: { sm: 0.5, md: 1, lg: 1.2 },
            }}
          >
            <ActionButton component={Link} href="/contact-us" aria-label="contact us">
              <PhoneIcon sx={{ color: '#DC1A8A', fontSize: { sm: 'clamp(1.1rem, 2.5vw, 1.2rem)' } }} />
              <ActionText>Contact Us</ActionText>
            </ActionButton>
            <ActionButton component={Link} href="/repair" aria-label="repair">
              <BuildIcon sx={{ color: '#DC1A8A', fontSize: { sm: 'clamp(1.1rem, 2.5vw, 1.2rem)' } }} />
              <ActionText>Repair</ActionText>
            </ActionButton>
            <ActionButton component={Link} href="/trade-in" aria-label="Trade-in">
              <FeedbackIcon sx={{ color: '#DC1A8A', fontSize: { sm: 'clamp(1.1rem, 2.5vw, 1.2rem)' } }} />
              <ActionText>Trade-in</ActionText>
            </ActionButton>
            <ActionButton component={Link} href="/cart" aria-label="cart">
              <Badge
                badgeContent={cart.length}
                color="error"
                sx={{ '& .MuiBadge-badge': { fontSize: '0.55rem', padding: '2px 4px' } }}
              >
                <ShoppingCartIcon sx={{ color: '#DC1A8A', fontSize: { sm: 'clamp(1.1rem, 2.5vw, 1.2rem)' } }} />
              </Badge>
              <ActionText>Cart</ActionText>
            </ActionButton>
            <ActionButton component={Link} href="/profile" aria-label="profile">
              <Badge
                badgeContent={0}
                color="error"
                sx={{ '& .MuiBadge-badge': { fontSize: '0.55rem', padding: '2px 4px' } }}
              >
                <PersonIcon sx={{ color: '#DC1A8A', fontSize: { sm: 'clamp(1.1rem, 2.5vw, 1.2rem)' } }} />
              </Badge>
              <ActionText>Profile</ActionText>
            </ActionButton>
          </Box>
        </Toolbar>
      </StyledAppBar>
      <MobileAppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <img
                src="/images/logo.jpeg"
                alt="CloudTech"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/fallback-logo.png';
                }}
                style={{
                  height: 'clamp(20px, 5vw, 24px)',
                  maxWidth: '100%',
                  objectFit: 'contain',
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  ml: 1,
                  color: '#000000',
                  fontWeight: 'bold',
                  fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                  whiteSpace: 'nowrap',
                }}
              >
                <PinkCloud>CLOUD</PinkCloud>TECH
              </Typography>
            </Link>
          </Box>
          <IconButton
            color="inherit"
            aria-label="open menu"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{ color: '#000000' }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </MobileAppBar>
      <StyledDrawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
      >
        {drawerContent}
      </StyledDrawer>
    </>
  );
};

export default TopNavBar;