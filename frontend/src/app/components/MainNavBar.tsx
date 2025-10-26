"use client";
import React, { useState } from 'react';
import { Box, Typography, styled, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import Link, { LinkProps } from 'next/link';
import { ListItemProps } from '@mui/material/ListItem';

// Define a type for the ListItem with Link component
interface LinkListItemProps extends ListItemProps {
  component: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>;
  href: string;
}

export const navCategories = [
  "Samsung",
  "Apple",
  "Smartphones",
  "Mobile Accessories",
  "Audio",
  "Gaming",
  "Storage",
  "PowerBank",
  "Content Creator Kit",
];

const Divider = styled(Box)(({ theme }) => ({
  height: '1.5px',
  backgroundColor: '#000000',
  width: '100%',
}));

const NavContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  padding: theme.spacing(1.2),
  background: 'linear-gradient(180deg, #fff 0%, #a29fa6 100%)',
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    padding: theme.spacing(1.5),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(1.5, 3),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(1.5, 4.5),
  },
  [theme.breakpoints.up('xl')]: {
    padding: theme.spacing(2, 5),
  },
}));

const NavLinkWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-flex',
  padding: theme.spacing(0.4, 0.75),
  margin: theme.spacing(0.4),
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: 'rgba(220, 26, 138, 0.1)',
    transform: 'translateY(-1px)',
  },
  minWidth: '36px',
  minHeight: '36px',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.up('sm')]: {
    margin: theme.spacing(0, 0.75),
    padding: theme.spacing(0.6, 1.2),
  },
  [theme.breakpoints.up('md')]: {
    margin: theme.spacing(0, 1.2),
    padding: theme.spacing(0.75, 1.5),
  },
  [theme.breakpoints.up('lg')]: {
    margin: theme.spacing(0, 1.5),
  },
}));

const NavItem = styled(Typography)(({ theme }) => ({
  color: '#4A4A4A',
  fontWeight: 500,
  fontSize: 'clamp(0.7rem, 1.9vw, 0.8rem)',
  lineHeight: '1.4',
  userSelect: 'none',
  transition: 'color 0.2s ease-in-out',
  '&:hover': {
    color: '#DC1A8A',
  },
  '&:focus': {
    color: '#DC1A8A',
    outline: '1.5px solid #DC1A8A',
    outlineOffset: '1.5px',
  },
  whiteSpace: 'nowrap',
  [theme.breakpoints.up('md')]: {
    fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)',
  },
  [theme.breakpoints.up('lg')]: {
    fontSize: 'clamp(0.85rem, 1.4vw, 0.9rem)',
  },
}));

const HamburgerContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  padding: theme.spacing(0.75),
  backgroundColor: '#FFFFFF',
  [theme.breakpoints.up('sm')]: {
    display: 'none',
  },
}));

const DrawerContent = styled(Box)(({ theme }) => ({
  width: '200px',
  padding: theme.spacing(1.5),
  backgroundColor: '#FFFFFF',
  height: '100%',
}));

const DrawerItem = styled(ListItem)<LinkListItemProps>(({ theme }) => ({
  padding: theme.spacing(1.2, 1.5),
  transition: 'background-color 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: 'rgba(220, 26, 138, 0.1)',
  },
}));

const MainNavBar = () => {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event.type === 'keydown' && ('key' in event) && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const navItems = [
    { href: "/samsung", label: "Samsung" },
    { href: "/apple", label: "Apple" },
    { href: "/smartphones", label: "Smartphones" },
    { href: "/mobile-accessories", label: "Mobile Accessories" },
    { href: "/audio", label: "Audio" },
    { href: "/gaming", label: "Gaming" },
    { href: "/storage", label: "Storage" },
    { href: "/tablets", label: "PowerBank" },
    { href: "/content-creator-kit", label: "Content Creator Kit" },
  ];

  return (
    <>
      <Divider />
      <HamburgerContainer>
        <IconButton
          color="inherit"
          aria-label="open menu"
          onClick={toggleDrawer(true)}
          sx={{ color: '#DC1A8A', fontSize: 'clamp(1.2rem, 4vw, 1.4rem)' }}
        >
          <MenuIcon />
        </IconButton>
      </HamburgerContainer>
      <NavContainer>
        {navItems.map((item) => (
          <NavLinkWrapper key={item.href} tabIndex={0} role="button">
            <Link href={item.href} style={{ textDecoration: 'none', width: '100%', height: '100%' }}>
              <NavItem>{item.label}</NavItem>
            </Link>
          </NavLinkWrapper>
        ))}
      </NavContainer>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box' } }}
      >
        <DrawerContent>
          <List>
            {navItems.map((item) => (
              <DrawerItem
                key={item.href}
                component={Link}
                href={item.href}
                onClick={toggleDrawer(false)}
              >
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        color: '#4A4A4A',
                        fontWeight: 500,
                        fontSize: 'clamp(0.7rem, 2.3vw, 0.8rem)',
                        '&:hover': { color: '#DC1A8A' },
                      }}
                    >
                      {item.label}
                    </Typography>
                  }
                />
              </DrawerItem>
            ))}
          </List>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default MainNavBar;