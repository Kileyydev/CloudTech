// src/components/HeroSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, styled } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

const SLIDES = [
  '/images/hero3.jpg',
  '/images/laptop.jpg',
  '/images/samsung2.jpg',
];

const HeroWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: 'clamp(480px, 80vh, 720px)',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'flex-end', // Push content to bottom
  justifyContent: 'center',
  paddingBottom: '60px', // Space for text + button

  // HIDE on md and smaller
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));

const Slider = styled(Box)({
  position: 'absolute',
  inset: 0,
});

const Slide = styled(Box)<{ active: boolean }>(({ active }) => ({
  position: 'absolute',
  inset: 0,
  opacity: active ? 1 : 0,
  transition: 'opacity 1.6s ease-in-out',
}));

const Content = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  textAlign: 'center',
  paddingBottom: theme.spacing(4),
}));

const Pink = styled('span')({ color: '#DC1A8A' });
const Black = styled('span')({ color: '#000' });

const ShopNow = styled(Link)(({ theme }) => ({
  display: 'inline-block',
  padding: '14px 52px',
  background: '#fff',
  color: '#000',
  fontWeight: 700,
  fontSize: '1.25rem',
  textDecoration: 'none',
  boxShadow: '0 8px 22px rgba(0,0,0,0.15)',

  transition: 'all .3s ease',
  position: 'relative',
  marginTop: theme.spacing(3),

  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: '12px',
    left: '50%',
    width: '65%',
    height: '3px',
    background: '#000',
    transform: 'translateX(-50%)',
  },

  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 28px rgba(0,0,0,0.2)',
  },
}));

export default function HeroSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <HeroWrapper id="hero">
      <Slider>
        {SLIDES.map((src, i) => (
          <Slide key={src} active={i === active}>
            <Image
              src={src}
              alt="Premium electronics hero"
              fill
              priority={i === 0}
              quality={95}
              sizes="100vw"
              style={{ objectFit: 'cover' }}
              onError={(e) => (e.currentTarget.src = '/images/fallback.jpg')}
            />
          </Slide>
        ))}
      </Slider>

      <Content maxWidth="lg">
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            fontSize: { lg: '1.35rem' },
            letterSpacing: '0.2em',
            color: '#000',
            bgcolor: '#fff',
            padding: '6px 16px',
            display: 'inline-block',
            textTransform: 'uppercase',
          
            mb: 2,
          }}
        >
          Premium Electronics | Trade-in | Nationwide Delivery
        </Typography>


      </Content>
    </HeroWrapper>
  );
}