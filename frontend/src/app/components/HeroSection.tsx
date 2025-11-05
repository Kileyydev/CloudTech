// src/components/HeroSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, styled } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

const SLIDES = [
  '/images/gaming-headphone.jpg',
  '/images/laptop.jpg',
  '/images/galaxy.jpg',
];

const HeroWrapper = styled(Box)({
  position: 'relative',
  minHeight: 'clamp(480px, 80vh, 720px)',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
});

const Slider = styled(Box)({ position: 'absolute', inset: 0 });

const Slide = styled(Box)<{ active: boolean }>(({ active }) => ({
  position: 'absolute',
  inset: 0,
  opacity: active ? 1 : 0,
  transition: 'opacity 1.6s ease-in-out',
}));


const Content = styled(Container)({
  position: 'relative',
  zIndex: 2,
  textAlign: 'center',
});

const Pink = styled('span')({ color: '#DC1A8A' });
const Black = styled('span')({ color: '#000' });

const ShopNow = styled(Link)({
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

});

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
              alt="Hero slide"
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
            fontSize: { xs: '1rem', md: '1.35rem' },
            letterSpacing: '0.2em',
            color: '#000',
            textTransform: 'uppercase',
            mb: 4,
          }}
        >
          Premium Electronics | Trade-in | Nationwide Delivery
        </Typography>

        {/* BUTTON */}
        <ShopNow href="/shop">Shop Now</ShopNow>
      </Content>
    </HeroWrapper>
  );
}