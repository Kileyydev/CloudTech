// src/app/contact-us/page.tsx
'use client';

import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Link,
  Stack,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import {
  Twitter,
  Facebook,
  Instagram,
  WhatsApp,
  Phone,
  Email,
  LocationOn,
} from '@mui/icons-material';
import dynamic from 'next/dynamic';
import TopNavBar from '@/app/components/TopNavBar';
import MainNavBar from '@/app/components/MainNavBar';
import FooterBottom from '@/app/components/FooterSection';

const MapComponent = dynamic(() => import('@/app/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        height: 400,
        bgcolor: 'grey.200',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography color="text.secondary">Loading map…</Typography>
    </Box>
  ),
});

const ContactUsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const mapCenter: [number, number] = [-1.2838, 36.8208];
  const locations = [
    { name: 'CloudTech – Nairobi CBD', position: mapCenter, isHeadquarters: true },
  ];

  const shop = {
    name: 'CloudTech – Nairobi CBD',
    address: 'Kenya Cinema Building, Moi Avenue, Nairobi, Kenya',
    phone: '+254 716 265 661',
    email: 'info@cloudtech.co.ke',
    whatsapp: '254722244482',
  };

  const services = [
    { name: 'Phone Repairs', desc: 'Same-day fixes for all brands' },
    { name: 'Trade-Ins', desc: 'Upgrade with instant credit' },
    { name: 'Accessories', desc: 'Chargers, cases, screen protectors' },
    { name: 'Content Creator Kits', desc: 'Mics, lights, tripods' },
    { name: 'Storage Solutions', desc: 'SD cards, SSDs, cloud backup' },
    { name: 'Custom Builds', desc: 'Gaming PCs, workstations' },
  ];

  return (
    <>
      <TopNavBar />
      <MainNavBar />

      <Box
        sx={{
          bgcolor: 'grey.50',
          minHeight: '100vh',
          py: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box textAlign="center" mb={6}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, color: '#db1b88', mb: 2 }}
            >
              Contact Us
            </Typography>
            <Typography variant="h6" color="text.secondary">
              We are here to help! Reach out for repairs, trade-ins, or inquiries.
            </Typography>
          </Box>

          {/* Grid: Info + Map */}
          <Box
            sx={{
              display: 'grid',
              gap: 4,
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            }}
          >
            {/* LEFT: Contact Info */}
            <Box display="flex" flexDirection="column" gap={4}>
              {/* Shop Card */}
              <Card sx={{ p: 4, boxShadow: 3 }}>
                <Typography variant="h5" sx={{ mb: 3, color: '#db1b88', fontWeight: 600 }}>
                  Our Store
                </Typography>
                <Stack spacing={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationOn sx={{ color: '#db1b88' }} />
                    <Box>
                      <Typography fontWeight={600}>{shop.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {shop.address}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Phone sx={{ color: '#db1b88' }} />
                    <Link href={`tel:${shop.phone.replace(/[^0-9+]/g, '')}`} underline="none" color="inherit">
                      {shop.phone}
                    </Link>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Email sx={{ color: '#db1b88' }} />
                    <Link href={`mailto:${shop.email}`} underline="none" color="inherit">
                      {shop.email}
                    </Link>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <WhatsApp sx={{ color: '#25D366' }} />
                    <Link
                      href={`https://wa.me/${shop.whatsapp}?text=Hi%20CloudTech`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: '#25D366', display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      Chat Now
                    </Link>
                  </Box>
                </Stack>
              </Card>

              {/* Social Media */}
              <Card sx={{ p: 4, boxShadow: 3 }}>
                <Typography variant="h5" sx={{ mb: 3, color: '#db1b88', fontWeight: 600 }}>
                  Follow Us
                </Typography>
                <Stack direction="row" spacing={2}>
                  <IconButton href="https://twitter.com" target="_blank" sx={{ color: '#db1b88' }}>
                    <Twitter fontSize="large" />
                  </IconButton>
                  <IconButton href="https://facebook.com" target="_blank" sx={{ color: '#db1b88' }}>
                    <Facebook fontSize="large" />
                  </IconButton>
                  <IconButton href="https://instagram.com" target="_blank" sx={{ color: '#db1b88' }}>
                    <Instagram fontSize="large" />
                  </IconButton>
                </Stack>
              </Card>
            </Box>

            {/* RIGHT: Map */}
            <Card sx={{ p: 0, overflow: 'hidden', boxShadow: 3, height: 400 }}>
              <MapComponent mapCenter={mapCenter} locations={locations} />
            </Card>
          </Box>

          {/* Services */}
          <Box mt={8}>
            <Typography
              variant="h4"
              align="center"
              sx={{ mb: 4, fontWeight: 700, color: '#db1b88' }}
            >
              Our Services
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                },
              }}
            >
              {services.map((s, i) => (
                <Card key={i} sx={{ p: 3, boxShadow: 2}}>
                  <Typography variant="h6" sx={{ mb: 1, color: '#db1b88', fontWeight: 600 }}>
                    {s.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {s.desc}
                  </Typography>
                </Card>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      <FooterBottom />
    </>
  );
};

export default ContactUsPage;