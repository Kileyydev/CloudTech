// src/components/Footer.tsx
'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Stack,
  Link as MuiLink,
  useTheme,
  useMediaQuery,
  Alert,
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
  gap: theme.spacing(1),
  flex: '0 0 280px',
}));

const Logo = styled('img')({
  height: '90px',
  width: 'auto',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(219, 27, 136, 0.3)',
});

const BrandName = styled(Typography)({
  fontSize: '2.2rem',
  fontWeight: 800,
  fontFamily: 'cursive',
  letterSpacing: '1px',
  marginTop: '-12px',
});

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
  marginBottom: theme.spacing(1),
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

const ContactForm = styled(Box)(({ theme }) => ({
  backgroundColor: '#111',
  padding: theme.spacing(3),
  borderRadius: 12,
  border: '1px solid #333',
  flex: 1,
  minWidth: 300,
}));

const Copyright = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  color: '#666',
  fontSize: '0.8rem',
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

export default function Footer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('idle');
    // Simulate send
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStatus('success');
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <>
      <FooterContainer>
        <FooterGrid>
          {/* Logo & Brand */}
          <LogoSection>
            <Logo
              src="/images/logo.jpeg"
              alt="CloudTech Logo"
            />
            <BrandName>
              <CloudText>CLOUD</CloudText>
              <TechText>TECH</TechText>
            </BrandName>
            <Typography variant="body2" color="#aaa" sx={{ maxWidth: 240 }}>
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
          </Column>

          {/* Contact Info */}
          <Column>
            <ColumnTitle>Contact Us</ColumnTitle>
            <FooterLink>
              <strong style={{ color: '#fff' }}>+254 716 265 661</strong>
              <br />
              Call, Text or WhatsApp
            </FooterLink>
            <FooterLink>
              Email:{' '}
              <MuiLink
                href="mailto:info@cloudtech.co.ke"
                color="#ccc"
                underline="hover"
                sx={{ '&:hover': { color: '#db1b88' } }}
              >
                info@cloudtech.co.ke
              </MuiLink>
            </FooterLink>
            <FooterLink>
              <strong style={{ color: '#db1b88' }}>Cookie House</strong>
              <br />
              3rd Floor, Shop 301, Nairobi CBD
            </FooterLink>
          </Column>

          {/* Contact Form */}
          {!isMobile && (
            <ContactForm>
              <Typography variant="h6" sx={{ color: '#db1b88', mb: 2, fontWeight: 600 }}>
                Get in Touch
              </Typography>
              {status === 'success' && (
                <Alert severity="success" sx={{ mb: 2, fontSize: '0.8rem' }}>
                  Message sent! We'll reply soon.
                </Alert>
              )}
              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    size="small"
                    fullWidth
                    variant="outlined"
                    InputProps={{ style: { color: '#fff', backgroundColor: '#222' } }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#444' },
                        '&:hover fieldset': { borderColor: '#666' },
                      },
                    }}
                  />
                  <TextField
                    name="email"
                    placeholder="Your Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    size="small"
                    fullWidth
                    variant="outlined"
                    InputProps={{ style: { color: '#fff', backgroundColor: '#222' } }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#444' },
                        '&:hover fieldset': { borderColor: '#666' },
                      },
                    }}
                  />
                  <TextField
                    name="message"
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    size="small"
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    InputProps={{ style: { color: '#fff', backgroundColor: '#222' } }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#444' },
                        '&:hover fieldset': { borderColor: '#666' },
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: '#db1b88',
                      '&:hover': { bgcolor: '#b1166f' },
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Send Message
                  </Button>
                </Stack>
              </form>
            </ContactForm>
          )}
        </FooterGrid>

        {/* Mobile Form */}
        {isMobile && (
          <ContactForm sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ color: '#db1b88', mb: 2 }}>
              Quick Message
            </Typography>
            <form onSubmit={handleSubmit}>
              <Stack spacing={1.5}>
                <TextField name="name" placeholder="Name" size="small" fullWidth required />
                <TextField name="email" placeholder="Email" type="email" size="small" fullWidth required />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ bgcolor: '#db1b88', '&:hover': { bgcolor: '#b1166f' } }}
                >
                  Send
                </Button>
              </Stack>
            </form>
          </ContactForm>
        )}

        <Copyright>
          © {currentYear} CLOUDTECH • Created by Kim
        </Copyright>
      </FooterContainer>

      {/* WhatsApp Button */}
      <MuiLink href="https://wa.me/254716265661" target="_blank" rel="noopener noreferrer" underline="none">
        <WhatsAppButton
          aria-label="Chat on WhatsApp"
        >
          <WhatsAppIcon sx={{ fontSize: 32 }} />
        </WhatsAppButton>
      </MuiLink>
    </>
  );
}