// src/components/OfficeHoursWidget.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Slide,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Phone,
  AccessTime,
  Email,
  Close,
} from '@mui/icons-material';

interface OfficeHoursWidgetProps {
  heroSectionId?: string;
}

export default function OfficeHoursWidget({ heroSectionId = 'hero' }: OfficeHoursWidgetProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    heroRef.current = document.getElementById(heroSectionId);
    if (!heroRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setOpen(entry.isIntersecting),
      { root: null, threshold: 0.3 }
    );

    observer.observe(heroRef.current);
    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, [heroSectionId]);

  return (
    <Slide direction="down" in={open} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          top: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          maxWidth: { xs: 300, sm: 340 },
          p: { xs: 2.5, sm: 3 },
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: 'rgba(0, 0, 0, 0.75)', // Solid black glass
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.3),
            0 4px 16px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
          zIndex: 1300,
          color: '#fff',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'rgba(0, 0, 0, 0.85)',
            boxShadow: `
              0 12px 40px rgba(0, 0, 0, 0.4),
              0 6px 20px rgba(0, 0, 0, 0.25)
            `,
          },
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.05rem', sm: '1.15rem' },
              color: '#fff',
              letterSpacing: '0.5px',
            }}
          >
            Office Hours
          </Typography>
          <IconButton
            size="small"
            onClick={() => setOpen(false)}
            sx={{
              color: '#fff',
              bgcolor: 'rgba(255,255,255,0.12)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>

        {/* Phone */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.2 }}>
          <Phone sx={{ fontSize: { xs: 19, sm: 21 }, color: '#fff' }} />
          <Typography
            variant="body2"
            sx={{
              fontSize: { xs: '0.9rem', sm: '0.95rem' },
              fontWeight: 600,
              letterSpacing: '0.3px',
            }}
          >
            0722244482 / 0711357878
          </Typography>
        </Box>

        {/* Hours */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.2 }}>
          <AccessTime sx={{ fontSize: { xs: 19, sm: 21 }, color: '#bbb' }} />
          <Typography
            variant="body2"
            sx={{
              fontSize: { xs: '0.82rem', sm: '0.88rem' },
              color: '#e0e0e0',
            }}
          >
            Mon–Sat (8am – 8pm) |{' '}
            <Box component="span" sx={{ fontWeight: 600, color: '#fff' }}>
            Sun CLOSED
            </Box>
          </Typography>
        </Box>

        {/* Email */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Email sx={{ fontSize: { xs: 19, sm: 21 }, color: '#fff' }} />
          <Typography
            component="a"
            href="mailto:info@cloudtechstore.net"
            sx={{
              fontSize: { xs: '0.82rem', sm: '0.88rem' },
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 500,
              '&:hover': {
                textDecoration: 'underline',
                color: '#ccc',
              },
            }}
          >
            info@cloudtechstore.net
          </Typography>
        </Box>
      </Box>
    </Slide>
  );
}