'use client';

import { Box, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Link from 'next/link';
import { useMediaQuery, useTheme } from '@mui/material';

const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#000',
  color: '#e0e0e0',
  padding: theme.spacing(6, 2),
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(8, 4),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(10, 6),
  },
}));

const FooterContent = styled(Box)(({ theme }) => ({
  maxWidth: '1400px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
}));

const LogoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    marginBottom: 0,
    flex: '0 0 300px',
  },
}));

const Logo = styled('img')({
  height: '60px',
  width: 'auto',
});

const BrandName = styled(Typography)({
  fontSize: '1.5rem',
  fontWeight: 600,
  color: '#fff',
  fontFamily: 'cursive',
  marginTop: '-8px',
});

const Column = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
}));

const ColumnTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1.1rem',
  color: '#fff',
  marginBottom: theme.spacing(1),
}));

const FooterLink = styled(Typography)(({ theme }) => ({
  color: '#ccc',
  fontSize: '0.95rem',
  cursor: 'pointer',
  transition: 'color 0.2s ease',
  '&:hover': {
    color: '#fff',
  },
}));

const Copyright = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  color: '#888',
  fontSize: '0.85rem',
  paddingTop: theme.spacing(3),
  borderTop: '1px solid #333',
  marginTop: theme.spacing(4),
}));

const WhatsAppButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  bottom: 24,
  right: 24,
  backgroundColor: '#25D366',
  color: '#fff',
  padding: theme.spacing(1.5),
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  zIndex: 1000,
  '&:hover': {
    backgroundColor: '#1DA851',
    transform: 'scale(1.1)',
  },
  transition: 'all 0.3s ease',
  [theme.breakpoints.down('sm')]: {
    bottom: 16,
    right: 16,
  },
}));

const WhatsAppLabel = styled(Typography)({
  marginLeft: '8px',
  fontWeight: 600,
  fontSize: '1rem',
});

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const currentYear = new Date().getFullYear();

  return (
    <>
      <FooterContainer>
        <FooterContent>
          {/* Logo & Brand */}
          <LogoSection>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Logo
                src="/images/logo.jpeg" // Replace with actual logo path
                alt="CloudTech Logo"
              />
            </Box>
            <BrandName>CloudTech</BrandName>
          </LogoSection>

          {/* Quick Links */}
          <Column>
            <ColumnTitle>Quick links</ColumnTitle>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <FooterLink>Home</FooterLink>
            </Link>
            <Link href="/samsung" style={{ textDecoration: 'none' }}>
              <FooterLink>Samsung</FooterLink>
            </Link>
            <Link href="/apple" style={{ textDecoration: 'none' }}>
              <FooterLink>Apple</FooterLink>
            </Link>
            <Link href="/mobile-accessories" style={{ textDecoration: 'none' }}>
              <FooterLink>Mobile Accessories</FooterLink>
            </Link>
            <Link href="/storage" style={{ textDecoration: 'none' }}>
              <FooterLink> Storage</FooterLink>
            </Link>
            <Link href="/content-creator-kits" style={{ textDecoration: 'none' }}>
              <FooterLink> Content Creator Kits</FooterLink>

            <Link href="/conntact-us" style={{ textDecoration: 'none' }}>
              <FooterLink> Contact us</FooterLink>
            </Link>
            </Link>
          </Column>

          {/* Contact Us */}
          <Column>
            <ColumnTitle>Contact Us</ColumnTitle>
            <FooterLink>
              Call, Text or Whatsapp us on,
              <br />
              <strong style={{ color: '#fff' }}>+254 716 265 661</strong>
            </FooterLink>
            <FooterLink>
              Email:{' '}
              <a
                href="mailto:info@cloudtech.co.ke"
                style={{ color: '#ccc', textDecoration: 'none' }}
              >
                info@cloudtech.co.ke
              </a>
            </FooterLink>
          </Column>
        </FooterContent>

        {/* Copyright */}
        <Copyright>
          &copy; {currentYear}, CloudTech Created by Kim
        </Copyright>
      </FooterContainer>

      {/* Floating WhatsApp Button */}
      <Link href="https://wa.me/254722244482" target="_blank" rel="noopener noreferrer" passHref legacyBehavior>
        <a style={{ textDecoration: 'none' }}>
          <WhatsAppButton aria-label="Chat on WhatsApp">
            <WhatsAppIcon sx={{ fontSize: 28 }} />
            {!isMobile && <WhatsAppLabel>Reach us via Whatsapp</WhatsAppLabel>}
          </WhatsAppButton>
        </a>
      </Link>
    </>
  );
};

export default Footer;