// src/components/Footer.tsx
'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Link as MuiLink,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Link from 'next/link';

const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#000',
  color: '#e0e0e0',
  padding: theme.spacing(6, 2),
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(8, 4),
  },
}));

const FooterGrid = styled(Box)(({ theme }) => ({
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
  flex: '0 0 280px',
}));

const Logo = styled('img')({
  height: '90px',
  width: 'auto',
});

const BrandName = styled(Typography)(({ theme }) => ({
  fontSize: '1.9rem',
  fontWeight: 800,
  letterSpacing: '0.5px',
  lineHeight: 1,
  marginTop: '-10px',
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.7rem',
    marginTop: '-8px',
  },
}));

const CloudText = styled('span')({
  color: '#db1b88',
});

const TechText = styled('span')({
  color: '#fff',
});

const Column = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  flex: 1,
  minWidth: 200,
}));

const ColumnTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.1rem',
  color: '#fff',
  marginBottom: theme.spacing(1.5),
}));

const FooterLink = styled(Typography)(({ theme }) => ({
  color: '#ccc',
  fontSize: '0.95rem',
  cursor: 'pointer',
  transition: 'color 0.2s ease',
  '&:hover': {
    color: '#db1b88',
  },
}));

const WhatsAppCTA = styled(Box)(({ theme }) => ({
  backgroundColor: '#111',
  padding: theme.spacing(3),
  border: '1px solid #333',
  flex: 1,
  minWidth: 300,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: theme.spacing(2),
}));

const Copyright = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  color: '#666',
  fontSize: '0.8rem',
  paddingTop: theme.spacing(3),
  borderTop: '1px solid #333',
  marginTop: theme.spacing(5),
}));

const WhatsAppButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  bottom: 24,
  right: 24,
  backgroundColor: '#25D366',
  color: '#fff',
  padding: theme.spacing(1.8),
  boxShadow: '0 6px 16px rgba(37, 211, 102, 0.4)',
  zIndex: 1000,
  '&:hover': {
    backgroundColor: '#1DA851',
    transform: 'scale(1.1)',
  },
  transition: 'all 0.3s ease',
  [theme.breakpoints.down('sm')]: {
    bottom: 16,
    right: 16,
    padding: theme.spacing(1.5),
  },
}));

// Pre-filled WhatsApp message
const whatsappMessage = encodeURIComponent(
  "Hi CloudTech! I'm interested in your products and would like to know more. Could you assist me?"
);

const whatsappUrl = `https://wa.me/254722244482?text=${whatsappMessage}`;

export default function Footer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const currentYear = new Date().getFullYear();

  return (
    <>
      <FooterContainer>
        <FooterGrid>
          {/* Logo & Brand */}
          <LogoSection>
            <Logo
              src="/images/logo1.jpg"
              alt="CloudTech Logo"
            />
            <BrandName>
              <CloudText>CLOUD</CloudText>
              <TechText>TECH</TechText>
            </BrandName>
            <Typography variant="body2" color="#aaa" sx={{ maxWidth: 150, lineHeight: 1.6 }}>
              Premium Electronics | Trade-in | Nationwide Delivery
            </Typography>
          </LogoSection>

          {/* Quick Links */}
          <Column>
            <ColumnTitle>Quick Links</ColumnTitle>
            <Link href="/" passHref legacyBehavior>
              <MuiLink underline="none">
                <FooterLink>Home</FooterLink>
              </MuiLink>
            </Link>
            <Link href="/samsung" passHref legacyBehavior>
              <MuiLink underline="none">
                <FooterLink>Samsung</FooterLink>
              </MuiLink>
            </Link>
            <Link href="/apple" passHref legacyBehavior>
              <MuiLink underline="none">
                <FooterLink>Apple</FooterLink>
              </MuiLink>
            </Link>
            <Link href="/mobile-accessories" passHref legacyBehavior>
              <MuiLink underline="none">
                <FooterLink>Mobile Accessories</FooterLink>
              </MuiLink>
            </Link>
            <Link href="/storage" passHref legacyBehavior>
              <MuiLink underline="none">
                <FooterLink>Storage</FooterLink>
              </MuiLink>
            </Link>
            <Link href="/content-creator-kits" passHref legacyBehavior>
              <MuiLink underline="none">
                <FooterLink>Content Creator Kits</FooterLink>
              </MuiLink>
            </Link>
            <Link href="/trade-in" passHref legacyBehavior>
              <MuiLink underline="none">
                <FooterLink>Trade-in</FooterLink>
              </MuiLink>
            </Link>
            <Link href="/warranty" passHref legacyBehavior>
              <MuiLink underline="none">
                <FooterLink>Terms and Conditions</FooterLink>
              </MuiLink>
            </Link>
          </Column>

          {/* Contact Info */}
          <Column>
            <ColumnTitle>Contact Us</ColumnTitle>
            <FooterLink>
              <strong style={{ color: '#fff' }}>+254722244482 / +254711357878</strong>
              <br />
              Call, Text or WhatsApp
            </FooterLink>
            <FooterLink>
              Email:{' '}
              <MuiLink
                href="mailto:info@cloudtechstore.net"
                color="#ccc"
                underline="hover"
                sx={{ '&:hover': { color: '#db1b88' } }}
              >
                info@cloudtechstore.net
              </MuiLink>
            </FooterLink>
            <FooterLink>
              <strong style={{ color: '#db1b88' }}>Cookie House</strong>
              <br />
              3rd Floor, Shop 301, Nairobi CBD
            </FooterLink>
          </Column>

          {/* WhatsApp CTA (Replaces Contact Form) */}
          <WhatsAppCTA>
            <Typography variant="h6" sx={{ color: '#db1b88', fontWeight: 700 }}>
              Message Us on WhatsApp
            </Typography>
            <Typography variant="body2" color="#aaa" sx={{ mb: 1 }}>
              Get instant support! Tap below to chat.
            </Typography>
            <MuiLink
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
            >
              <Button
                variant="contained"
                startIcon={<WhatsAppIcon />}
                sx={{
                  bgcolor: '#25D366',
                  color: '#fff',
                  fontWeight: 600,
                  textTransform: 'none',
                  py: 1.2,
                  px: 3,
                  '&:hover': {
                    bgcolor: '#1DA851',
                  },
                }}
              >
                Chat on WhatsApp
              </Button>
            </MuiLink>
          </WhatsAppCTA>
        </FooterGrid>

        <Copyright>
          © {currentYear} CLOUDTECH • Created by Kim
        </Copyright>
      </FooterContainer>

      {/* Floating WhatsApp Button */}
      <MuiLink href={whatsappUrl} target="_blank" rel="noopener noreferrer" underline="none">
        <WhatsAppButton aria-label="Chat on WhatsApp">
          <WhatsAppIcon sx={{ fontSize: 32 }} />
        </WhatsAppButton>
      </MuiLink>
    </>
  );
}