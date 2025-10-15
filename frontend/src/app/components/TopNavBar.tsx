"use client";
import React from 'react';
import { AppBar, Toolbar, InputBase, IconButton, Badge, Typography, Box } from '@mui/material';
import { Search as SearchIcon, ShoppingCart as ShoppingCartIcon, HeadsetMic as HeadsetMicIcon, Person as PersonIcon } from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(1),
  display: 'none', // Hide on xs screens
  [theme.breakpoints.up('sm')]: {
    display: 'block', // Show on sm and larger screens
    padding: theme.spacing(2),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(2, 4),
  },
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  backgroundColor: '#DC1A8A',
  border: '2px solid #DC1A8A',
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: '#B31774',
  },
  marginLeft: theme.spacing(1),
  width: '100%',
  maxWidth: '600px',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(2),
    width: '40vw',
    maxWidth: '400px',
  },
  [theme.breakpoints.up('md')]: {
    width: '50vw',
    maxWidth: '500px',
  },
  [theme.breakpoints.up('lg')]: {
    width: '60vw',
    maxWidth: '600px',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 1),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(0, 2),
  },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'white',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(3)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontSize: '0.9rem',
    [theme.breakpoints.up('sm')]: {
      fontSize: '1rem',
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
    [theme.breakpoints.up('md')]: {
      width: '25ch',
      '&:focus': {
        width: '35ch',
      },
    },
  },
}));

const TopNavBar = () => {
  const theme = useTheme();

  return (
    <StyledAppBar position="static">
      <Toolbar sx={{ flexWrap: { sm: 'nowrap' }, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          <img
            src="/images/logo.jpeg"
            alt="Cloudtech"
            style={{
              height: 'clamp(30px, 8vw, 40px)',
              maxWidth: '100%',
              objectFit: 'contain',
            }}
          />
          <Typography
            variant="h6"
            sx={{
              ml: { sm: 2 },
              color: '#4A4A4A',
              fontWeight: 'bold',
              fontSize: { sm: '1.25rem', md: '1.5rem' },
              whiteSpace: 'nowrap',
            }}
          >
            Cloudtech
          </Typography>
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: { sm: 'auto' },
          }}
        >
          <Search>
            <SearchIconWrapper>
              <SearchIcon sx={{ color: 'white', fontSize: { sm: '1.5rem' } }} />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search for products…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'nowrap',
            gap: { sm: 2 },
          }}
        >
          <IconButton color="inherit" sx={{ p: { sm: 1 } }}>
            <HeadsetMicIcon sx={{ color: '#DC1A8A', fontSize: { sm: '1.8rem' } }} />
            <Typography
              variant="body2"
              sx={{
                ml: { sm: 1 },
                color: '#DC1A8A',
                fontWeight: '500',
                fontSize: { sm: '0.9rem' },
                display: { sm: 'inline' },
              }}
            >
              Need Help? 0726526375
            </Typography>
          </IconButton>
          <IconButton color="inherit" sx={{ p: { sm: 1 } }}>
            <Badge badgeContent={0} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', padding: '2px 6px' } }}>
              <PersonIcon sx={{ color: '#DC1A8A', fontSize: { sm: '1.8rem' } }} />
            </Badge>
          </IconButton>
          <IconButton color="inherit" sx={{ p: { sm: 1 } }}>
            <Badge badgeContent={0} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', padding: '2px 6px' } }}>
              <ShoppingCartIcon sx={{ color: '#DC1A8A', fontSize: { sm: '1.8rem' } }} />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default TopNavBar;