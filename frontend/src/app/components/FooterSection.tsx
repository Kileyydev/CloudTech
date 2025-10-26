"use client";
import { Box, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay'; // TikTok substitute
import TwitterIcon from '@mui/icons-material/Twitter';
import Link from 'next/link';

const FooterBox = styled(Box)(({ theme }) => ({
  background: '#F5F5F5', // Neutral light gray background
  padding: theme.spacing(3),
  color: '#333333',
  textAlign: 'left',
  borderTop: '1px solid #E0E0E0',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(5),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(6),
  },
}));

const SocialIconsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(1.5),
  '& .MuiSvgIcon-root': {
    fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
    transition: 'color 0.2s ease-in-out',
  },
  [theme.breakpoints.up('sm')]: {
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}));

const FooterLink = styled(Typography)(({ theme }) => ({
  color: '#666666',
  fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
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
  [theme.breakpoints.up('md')]: {
    fontSize: 'clamp(0.9rem, 1.8vw, 1rem)',
  },
}));

const FooterTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: '#2E7D32',
  fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
  marginBottom: theme.spacing(1.5),
  [theme.breakpoints.up('md')]: {
    fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
  },
}));

const Footer = () => {
  return (
    <FooterBox>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 3,
          '& > *': {
            flex: {
              xs: '1 1 100%', // Full width on extra-small screens
              sm: '1 1 calc(50% - 12px)', // Two columns on small screens
              md: '1 1 calc(25% - 18px)', // Four columns on medium screens and up
            },
            minWidth: 0,
          },
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ mr: 1.5 }}>
              <img
                src="/images/logo.jpeg"
                alt="Phoneplace Kenya Logo"
                style={{
                  height: 'clamp(30px, 6vw, 40px)',
                  maxWidth: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: '#2E7D32',
                fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
              }}
            >
              Phoneplace Kenya
            </Typography>
          </Box>
          <FooterLink>Shop Location: Bazaar Plaza, Mezzanine 1 unit 5, Moi Avenue Nairobi</FooterLink>
          <FooterLink>Email: info@phoneplacekenya.com</FooterLink>
          <SocialIconsBox>
            <IconButton
              component="a"
              href="https://facebook.com"
              aria-label="Facebook"
              sx={{ '&:hover .MuiSvgIcon-root': { color: '#3b5998' } }}
            >
              <FacebookIcon />
            </IconButton>
            <IconButton
              component="a"
              href="https://instagram.com"
              aria-label="Instagram"
              sx={{ '&:hover .MuiSvgIcon-root': { color: '#E1306C' } }}
            >
              <InstagramIcon />
            </IconButton>
            <IconButton
              component="a"
              href="https://tiktok.com"
              aria-label="TikTok"
              sx={{ '&:hover .MuiSvgIcon-root': { color: '#000000' } }}
            >
              <SmartDisplayIcon />
            </IconButton>
            <IconButton
              component="a"
              href="https://twitter.com"
              aria-label="Twitter"
              sx={{ '&:hover .MuiSvgIcon-root': { color: '#1DA1F2' } }}
            >
              <TwitterIcon />
            </IconButton>
          </SocialIconsBox>
        </Box>
        <Box>
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
        </Box>
        <Box>
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
        </Box>
        <Box>
          <FooterTitle>Contact Us</FooterTitle>
          <FooterLink>Sales: 0726 526375</FooterLink>
          <FooterLink>Repairs: 0745 063030</FooterLink>
        </Box>
      </Box>
    </FooterBox>
  );
};

export default Footer;