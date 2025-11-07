// src/app/warranty/page.tsx
'use client';

import { Box, Container, Typography, Stack } from '@mui/material';
import { 
  Shield, 
  CheckCircle, 
  Cancel, 
  AccessTime, 
  Warning, 
  Info,
  Receipt,
  Build,
  Block
} from '@mui/icons-material';
import TopNavBar from '../components/TopNavBar';
import MainNavBar from '../components/MainNavBar';
import TickerBar from '../components/TickerBar';

const WarrantyPolicy = () => {

  const policies = [
    {
      icon: <Shield sx={{ color: '#c2185b', fontSize: 36 }} />,
      title: '1-YEAR MANUFACTURER WARRANTY',
      desc: 'All electronics (mobile phones, TVs, laptops) are covered by a 1-year warranty from the date of purchase.',
    },
    {
      icon: <Block sx={{ color: '#c2185b', fontSize: 36 }} />,
      title: 'EXCLUSIONS FROM WARRANTY',
      desc: 'Warranty does not cover water damage, electrical faults, or physical damage (drops, cracks, impact).',
    },
    {
      icon: <Receipt sx={{ color: '#c2185b', fontSize: 36 }} />,
      title: 'PROOF OF PURCHASE REQUIRED',
      desc: 'Original receipt or invoice must be presented to validate any warranty claim.',
    },
    {
      icon: <AccessTime sx={{ color: '#c2185b', fontSize: 36 }} />,
      title: '24-HOUR ASSESSMENT PERIOD',
      desc: 'Device will be inspected within 24 hours before any warranty decision is made.',
    },
    {
      icon: <Build sx={{ color: '#c2185b', fontSize: 36 }} />,
      title: 'RESOLUTION TIMEFRAME',
      desc: 'Most repairs completed within 5 working days. Complex cases may take up to 21 working days.',
    },
    {
      icon: <Warning sx={{ color: '#c2185b', fontSize: 36 }} />,
      title: 'WARRANTY BECOMES VOID IF',
      desc: '• Device opened or repaired elsewhere\n• Jailbroken or rooted\n• Data loss during repair not covered',
    },
    {
      icon: <Cancel sx={{ color: '#c2185b', fontSize: 36 }} />,
      title: 'NO RETURNS POLICY',
      desc: 'Once sold, items cannot be returned. Warranty repair or replacement only.',
    },
  ];

  return (
    <>
   
      <TopNavBar />
      <MainNavBar />

      <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="md">

          {/* HEADER */}
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2.4rem', sm: '3.2rem', md: '3.8rem' },
                color: '#000000',
                mb: 3,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              WARRANTY POLICY
            </Typography>
            <Box sx={{ height: 6, bgcolor: '#c2185b', width: 120, mx: 'auto', mb: 3 }} />
            <Typography
              sx={{
                fontSize: { xs: '1.05rem', md: '1.2rem' },
                color: '#333333',
                lineHeight: 1.8,
                maxWidth: 720,
                mx: 'auto',
              }}
            >
              This warranty policy applies to all products purchased from CloudTech. 
              We stand behind our products and service with clear, transparent terms.
            </Typography>
          </Box>

          {/* POLICY LIST */}
          <Stack spacing={5}>
            {policies.map((policy, index) => (
              <Box
                key={index}
                sx={{
               
                  p: { xs: 4, md: 5 },
                  bgcolor: '#ffffff',
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={4}
                  alignItems="flex-start"
                >
                  {/* ICON */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 72,
                      height: 72,
                      bgcolor: '#ffffff',
                     
                      flexShrink: 0,
                    }}
                  >
                    {policy.icon}
                  </Box>

                  {/* CONTENT */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: '#000000',
                        fontSize: { xs: '1.35rem', md: '1.5rem' },
                        mb: 2,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {policy.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: '1.05rem', md: '1.15rem' },
                        color: '#000000',
                        lineHeight: 1.8,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {policy.desc}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ))}
          </Stack>

          {/* SUPPORT FOOTER */}
          <Box
            sx={{
              mt: 10,
              p: { xs: 5, md: 6 },
           
              textAlign: 'center',
              bgcolor: '#ffffff',
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                fontWeight: 700,
                color: '#000000',
                mb: 1,
              }}
            >
              NEED ASSISTANCE?
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '1.05rem', md: '1.15rem' },
                color: '#000000',
                lineHeight: 1.7,
              }}
            >
              Contact our support team at{' '}
              <Box component="span" sx={{ color: '#c2185b', fontWeight: 800 }}>
                +254 722 244 482
              </Box>{' '}
              or visit us at <strong>Cookie House, 3rd Floor, Shop 301, Nairobi CBD</strong>.
            </Typography>
          </Box>

          {/* COPYRIGHT */}
          <Box
            sx={{
              mt: 8,
              textAlign: 'center',
              color: '#666666',
              fontSize: '0.9rem',
              pb: 4,
            }}
          >
          </Box>

        </Container>
      </Box>
    </>
  );
};

export default WarrantyPolicy;