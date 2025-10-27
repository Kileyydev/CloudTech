'use client';

import { Box, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay'; // TikTok substitute
import TwitterIcon from '@mui/icons-material/X'; // Updated to X icon
import Link from 'next/link';
import { useMediaQuery, useTheme } from '@mui/material';

const FooterBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(180deg, #f5f5f5 40%, #fff 100%)',
  padding: theme.spacing(4, 2),
  color: '#222',
  textAlign: 'left',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(5, 3),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(6, 4),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(8, 4),
  },
}));

const SocialIconsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(1.5),
  '& .MuiSvgIcon-root': {
    fontSize: 'clamp(20px, 2.5vw, 24px)',
    transition: 'color 0.2s ease-in-out',
  },
  [theme.breakpoints.up('sm')]: {
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}));

const FooterLink = styled(Typography)(({ theme }) => ({
  color: '#222',
  fontSize: 'clamp(14px, 1.8vw, 16px)',
  lineHeight: '1.8',
  cursor: 'pointer',
  transition: 'color 0.2s ease-in-out',
  '&:hover': {
    color: '#DC1A8A',
  },
  '&:focus': {
    color: '#DC1A8A',
    outline: '2px solid #DC1A8A',
    outlineOffset: '2px',
  },
}));

const FooterTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: '#222',
  fontSize: 'clamp(16px, 2vw, 20px)',
  marginBottom: theme.spacing(1.5),
}));

const FooterCard = styled(Box)(({ theme }) => ({
  backgroundColor: '#fff',
  padding: theme.spacing(2),
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  borderRadius: 0, // No border radius
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const Footer = () => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.up('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.up('sm'));

  // Format current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <FooterBox>
      <Box
        sx={{
          maxWidth: '1200px',
          mx: 'auto',
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr', // 1 card per row
            sm: 'repeat(2, minmax(0, 1fr))', // 2 cards per row
            md: 'repeat(4, minmax(0, 1fr))', // 4 cards per row
          },
          gap: { xs: 2, sm: 2.5, md: 3 },
          '& > *': {
            minWidth: 0,
          },
        }}
      >
        {/* Company Info */}
        <FooterCard>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ mr: 1.5 }}>
              <img
                src="/images/logo.jpeg"
                alt="CloudTech Logo"
                style={{
                  height: 'clamp(32px, 5vw, 40px)',
                  maxWidth: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#222',
                fontSize: 'clamp(16px, 2.5vw, 20px)',
              }}
            >
              CloudTech
            </Typography>
          </Box>
          <FooterLink>Shop Location: Bazaar Plaza, Mezzanine 1 unit 5, Moi Avenue Nairobi</FooterLink>
          <FooterLink>Email: info@cloudtech.com</FooterLink>
          <SocialIconsBox>
            <IconButton
              component="a"
              href="https://facebook.com"
              aria-label="Facebook"
              sx={{ '&:hover .MuiSvgIcon-root': { color: '#DC1A8A' } }}
            >
              <FacebookIcon sx={{ color: '#222' }} />
            </IconButton>
            <IconButton
              component="a"
              href="https://instagram.com"
              aria-label="Instagram"
              sx={{ '&:hover .MuiSvgIcon-root': { color: '#DC1A8A' } }}
            >
              <InstagramIcon sx={{ color: '#222' }} />
            </IconButton>
            <IconButton
              component="a"
              href="https://tiktok.com"
              aria-label="TikTok"
              sx={{ '&:hover .MuiSvgIcon-root': { color: '#DC1A8A' } }}
            >
              <SmartDisplayIcon sx={{ color: '#222' }} />
            </IconButton>
            <IconButton
              component="a"
              href="https://x.com"
              aria-label="X"
              sx={{ '&:hover .MuiSvgIcon-root': { color: '#DC1A8A' } }}
            >
              <TwitterIcon sx={{ color: '#222' }} />
            </IconButton>
          </SocialIconsBox>
        </FooterCard>

        {/* Our Company */}
        <FooterCard>
          <FooterTitle>Our Company</FooterTitle>
          <Link href="/about" style={{ textDecoration: 'none' }}>
            <FooterLink>About Us</FooterLink>
          </Link>
          <Link href="/contact" style={{ textDecoration: 'none' }}>
            <FooterLink>Contact Us</FooterLink>
          </Link>
          <Link href="/privacy" style={{ textDecoration: 'none' }}>
            <FooterLink>Privacy Policy</FooterLink>
          </Link>
          <Link href="/terms" style={{ textDecoration: 'none' }}>
            <FooterLink>Terms and Conditions</FooterLink>
          </Link>
        </FooterCard>

        {/* Shop By Brands */}
        <FooterCard>
          <FooterTitle>Shop By Brands</FooterTitle>
          <Link href="/samsung" style={{ textDecoration: 'none' }}>
            <FooterLink>Samsung</FooterLink>
          </Link>
          <Link href="/apple" style={{ textDecoration: 'none' }}>
            <FooterLink>Apple</FooterLink>
          </Link>
          <Link href="/xiaomi" style={{ textDecoration: 'none' }}>
            <FooterLink>Xiaomi</FooterLink>
          </Link>
          <Link href="/google" style={{ textDecoration: 'none' }}>
            <FooterLink>Google</FooterLink>
          </Link>
        </FooterCard>

        {/* Contact Us */}
        <FooterCard>
          <FooterTitle>Contact Us</FooterTitle>
          <FooterLink>Sales: 0726 526375</FooterLink>
          <FooterLink>Repairs: 0745 063030</FooterLink>
        </FooterCard>
      </Box>

      {/* Horizontal Line */}
      <Box sx={{ width: '100%', height: '2px', backgroundColor: '#222', my: { xs: 3, md: 4 }, maxWidth: '1200px', mx: 'auto' }} />

      {/* Copyright */}
      <Box sx={{ textAlign: 'center', maxWidth: '1200px', mx: 'auto' }}>
        <Typography
          sx={{
            color: '#222',
            fontSize: 'clamp(12px, 1.5vw, 14px)',
            fontWeight: 500,
          }}
        >
          © {currentDate} @ CloudTech
        </Typography>
      </Box>
    </FooterBox>
  );
};

export default Footer;