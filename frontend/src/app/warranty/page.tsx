'use client';

import { Box, Container, Typography, Paper, Divider, Stack, useTheme, useMediaQuery } from '@mui/material';
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

const WarrantyPolicy = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const policies = [
    {
      icon: <Shield sx={{ color: '#1a5fb4', fontSize: 28 }} />,
      title: '1-Year Manufacturer Warranty',
      desc: 'All electronics (mobile phones, TVs, laptops) are covered by a 1-year warranty from the date of purchase.',
    },
    {
      icon: <Block sx={{ color: '#d32f2f', fontSize: 28 }} />,
      title: 'Exclusions from Warranty',
      desc: 'Warranty does not cover water damage, electrical faults, or physical damage (drops, cracks, impact).',
    },
    {
      icon: <Receipt sx={{ color: '#1a5fb4', fontSize: 28 }} />,
      title: 'Proof of Purchase Required',
      desc: 'Original receipt or invoice must be presented to validate any warranty claim.',
    },
    {
      icon: <AccessTime sx={{ color: '#f57c00', fontSize: 28 }} />,
      title: '24-Hour Assessment Period',
      desc: 'Device will be inspected within 24 hours before any warranty decision is made.',
    },
    {
      icon: <Build sx={{ color: '#f57c00', fontSize: 28 }} />,
      title: 'Resolution Timeframe',
      desc: 'Most repairs completed within 5 working days. Complex cases may take up to 21 working days.',
    },
    {
      icon: <Warning sx={{ color: '#d32f2f', fontSize: 28 }} />,
      title: 'Warranty Becomes Void If',
      desc: '• Device opened or repaired elsewhere\n• Jailbroken or rooted\n• Data loss during repair not covered',
    },
    {
      icon: <Cancel sx={{ color: '#d32f2f', fontSize: 28 }} />,
      title: 'No Returns Policy',
      desc: 'Once sold, items cannot be returned. Warranty repair or replacement only.',
    },
  ];

  return (
    <>
      <TopNavBar />
      <MainNavBar />

      <Box
        sx={{
          bgcolor: '#f5f7fa',
          minHeight: '100vh',
          py: { xs: 5, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Paper
            elevation={0}
            sx={{
              bgcolor: 'white',
              p: { xs: 3, md: 5 },
              mb: 6,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: '#1a1a1a',
                fontSize: { xs: '1.8rem', md: '2.5rem' },
                mb: 2,
                textAlign: 'center',
              }}
            >
              Warranty Policy
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                textAlign: 'center',
                fontSize: { xs: '0.95rem', md: '1.1rem' },
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.7,
              }}
            >
              This warranty policy applies to all products purchased from CloudTech. 
              We stand behind our products and service with clear, transparent terms.
            </Typography>
          </Paper>

          {/* Policy List */}
          <Stack spacing={3}>
            {policies.map((policy, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  bgcolor: 'white',
                  '&:hover': {
                    borderColor: '#1a5fb4',
                    boxShadow: '0 2px 8px rgba(26, 95, 180, 0.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Stack
                  direction={isMobile ? 'column' : 'row'}
                  spacing={3}
                  alignItems="flex-start"
                >
                  {/* Icon */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 56,
                      height: 56,
                      bgcolor: '#f0f4f8',
                      borderRadius: 2,
                      flexShrink: 0,
                    }}
                  >
                    {policy.icon}
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#1a1a1a',
                        fontSize: { xs: '1.1rem', md: '1.25rem' },
                        mb: 1,
                      }}
                    >
                      {policy.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.95rem', md: '1rem' },
                        lineHeight: 1.7,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {policy.desc}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>

          {/* Final Note */}
          <Paper
            elevation={0}
            sx={{
              mt: 6,
              p: { xs: 3, md: 4 },
              bgcolor: '#f0f4f8',
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
              }}
            >
              <strong>Need assistance?</strong> Contact our support team at{' '}
              <Box component="span" sx={{ color: '#1a5fb4', fontWeight: 600 }}>
                +254 722 244 482
              </Box>{' '}
              or visit us at <strong>Cookie House, 3rd Floor, Shop 301, Nairobi CBD</strong>.
            </Typography>
          </Paper>

          {/* Print Footer */}
          <Box
            sx={{
              mt: 6,
              textAlign: 'center',
              color: '#666',
              fontSize: '0.8rem',
              pb: 4,
            }}
          >
            <Typography variant="caption">
              © {new Date().getFullYear()} CloudTech. All warranty terms are subject to Kenyan consumer law.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default WarrantyPolicy;