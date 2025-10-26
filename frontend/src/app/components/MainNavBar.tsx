'use client';

import React, { useState } from 'react';
import { Box, Typography, styled, IconButton } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import Link from 'next/link';

export const navCategories = [
  'Samsung',
  'Apple',
  'Smartphones',
  'Mobile Accessories',
  'Audio',
  'Gaming',
  'Storage',
  'PowerBank',
  'Content Creator Kit',
];

const Divider = styled(Box)(({ theme }) => ({
  height: '1.5px',
  backgroundColor: '#000000',
  width: '100%',
}));

const NavContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(1),
  backgroundColor: '#FFFFFF',
  [theme.breakpoints.up('lg')]: {
    flexDirection: 'row',
    padding: theme.spacing(1.5, 3),
  },
  [theme.breakpoints.up('xl')]: {
    padding: theme.spacing(1.5, 4),
  },
}));

const NavList = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  transition: 'opacity 0.3s ease-in-out, max-height 0.3s ease-in-out',
  overflow: 'hidden',
  [theme.breakpoints.up('lg')]: {
    flexDirection: 'row',
    justifyContent: 'center',
    opacity: 1,
    maxHeight: 'none',
  },
}));

const NavLinkWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  padding: theme.spacing(0.8, 1.5),
  margin: theme.spacing(0.3, 0),
  borderRadius: '8px',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: 'rgba(220, 26, 138, 0.1)',
    transform: 'scale(1.05)',
    '& .nav-item::after': {
      width: '100%',
    },
  },
  width: '100%',
  alignItems: 'center',
  justifyContent: 'flex-start',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1, 2),
    margin: theme.spacing(0.4, 0),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(1.2, 2.5),
    margin: theme.spacing(0.5, 0),
  },
  [theme.breakpoints.up('lg')]: {
    width: 'auto',
    margin: theme.spacing(0, 1.2),
    padding: theme.spacing(0.6, 1),
    border: 'none',
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: 'transparent',
      transform: 'none',
    },
  },
  [theme.breakpoints.up('xl')]: {
    margin: theme.spacing(0, 1.4),
    padding: theme.spacing(0.7, 1.2),
  },
}));

const NavItem = styled(Typography)(({ theme }) => ({
  color: '#000000',
  fontWeight: 500,
  fontSize: 'clamp(0.85rem, 2.2vw, 0.95rem)',
  lineHeight: '1.4',
  userSelect: 'none',
  transition: 'color 0.2s ease-in-out',
  position: 'relative',
  '&:hover': {
    color: '#DC1A8A',
  },
  '&:focus': {
    color: '#DC1A8A',
    outline: '1.5px solid #DC1A8A',
    outlineOffset: '1.5px',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-3px',
    left: 0,
    width: '0%',
    height: '3px',
    backgroundColor: '#DC1A8A',
    transition: 'width 0.2s ease-in-out',
  },
  whiteSpace: 'nowrap',
  [theme.breakpoints.up('sm')]: {
    fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: 'clamp(1.05rem, 1.8vw, 1.15rem)',
  },
  [theme.breakpoints.up('lg')]: {
    fontSize: 'clamp(0.85rem, 1.4vw, 0.95rem)',
  },
  [theme.breakpoints.up('xl')]: {
    fontSize: 'clamp(0.9rem, 1.4vw, 1rem)',
  },
}));

const ToggleButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: '#DC1A8A',
  color: '#000000',
  padding: theme.spacing(0.5),
  margin: theme.spacing(0.5),
  borderRadius: '50%',
  '&:hover': {
    backgroundColor: '#B31774',
    transform: 'scale(1.1)',
  },
  animation: 'bounce 2s ease-in-out infinite',
  '@keyframes bounce': {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-3px)' },
  },
  [theme.breakpoints.up('lg')]: {
    display: 'none',
  },
}));

const MainNavBar = () => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(true); // Default to open for visibility

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { href: '/samsung', label: 'Samsung' },
    { href: '/apple', label: 'Apple' },
    { href: '/smartphones', label: 'Smartphones' },
    { href: '/mobile-accessories', label: 'Mobile Accessories' },
    { href: '/audio', label: 'Audio' },
    { href: '/gaming', label: 'Gaming' },
    { href: '/storage', label: 'Storage' },
    { href: '/powerbank', label: 'PowerBank' },
    { href: '/content-creator-kit', label: 'Content Creator Kit' },
  ];

  return (
    <>
      <Divider />
      <NavContainer>
        <ToggleButton onClick={toggleMenu} aria-label={isOpen ? 'Close menu' : 'Open menu'}>
          {isOpen ? <RemoveIcon /> : <AddIcon />}
        </ToggleButton>
        <NavList sx={{ opacity: isOpen ? 1 : 0, maxHeight: isOpen ? '1000px' : '0px' }}>
          {navItems.map((item) => (
            <NavLinkWrapper key={item.href} tabIndex={0} role="button">
              <Link href={item.href} style={{ textDecoration: 'none', width: '100%', height: '100%' }}>
                <NavItem className="nav-item">{item.label}</NavItem>
              </Link>
            </NavLinkWrapper>
          ))}
        </NavList>
      </NavContainer>
    </>
  );
};

export default MainNavBar;