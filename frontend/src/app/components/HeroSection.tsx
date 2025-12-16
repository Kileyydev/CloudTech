// src/components/HeroSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, styled } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

const SLIDES = [

  {
    image: '/images/mac.jpg', // PNG with transparent bg
    title: 'MacBook Pro 2025',
    subtitle: 'Experience power, speed and style',
    link: '/shop/mac',
    bgColor: '#000000',
    isMac: true,
  },
  {
    image: '/images/hero9.png',
    title: 'Premium Electronics',
    subtitle: 'Powering your everyday life',
    link: '/shop',
    bgColor: '#DC1A8A',
  },
  {
    image: '/images/hero6.png',
    title: 'Next-Gen Smartphones',
    subtitle: 'Stay ahead, stay connected',
    link: '/shop/phones',
    bgColor: '#fff',
  },
];

const SIDE_CARDS = [
  {
    image: '/images/pods.png',
    title: 'Work Smarter',
    subtitle: 'High-performance laptops',
    link: '/shop/laptops',
    bgColor: '#DC1A8A',
  },
  {
    image: '/images/watch6.jpg',
    title: 'Stay Connected',
    subtitle: 'Latest smartphones',
    link: '/shop/phones',
    bgColor: '#000',
  },
];

const HeroWrapper = styled(Box)({
  display: 'flex',
  minHeight: 'clamp(480px, 80vh, 720px)',
  overflow: 'hidden',
});

const SliderArea = styled(Box)({
  position: 'relative',
  flex: '0 0 72%',
  overflow: 'hidden',
  display: 'flex',
});

const Slide = styled(Box)<{ active: boolean; bgColor?: string }>(({ active, bgColor }) => ({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  backgroundColor: bgColor || '#000',
  transition: 'transform 1.2s ease-in-out',
  transform: active ? 'translateX(0)' : 'translateX(100%)',
}));

const SlideTextArea = styled(Box)<{ isMac?: boolean; bgColor?: string }>(({ isMac, bgColor }) => {
  const lightBg = ['#fff', '#FFE0F0', '#FFF0E0', '#f5f5f5'].includes(bgColor || '');
  return {
    flex: isMac ? '0 0 45%' : '0 0 40%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '40px',
    color: lightBg ? '#000' : '#fff', // dynamic text color
    zIndex: 2,
  };
});

const SlideImageArea = styled(Box)<{ isMac?: boolean }>(({ isMac }) => ({
  flex: isMac ? '0 0 55%' : '0 0 60%',
  position: 'relative',
  overflow: 'hidden',
}));

const StretchImage = styled(Image)({
  objectFit: 'contain', // ensures full image visible
  objectPosition: 'right center',
  width: '100%',
  height: '100%',
});

const SideColumn = styled(Box)({
  flex: '0 0 28%',
  display: 'flex',
  flexDirection: 'column',
});

const SideCard = styled(Box)<{ bgColor: string }>(({ bgColor }) => ({
  position: 'relative',
  flex: 1,
  display: 'flex',
  backgroundColor: bgColor,
  overflow: 'hidden',
}));

const SideTextArea = styled(Box)<{ bgColor?: string }>(({ bgColor }) => {
  const lightBg = ['#fff', '#FFE0F0', '#FFF0E0'].includes(bgColor || '');
  return {
    flex: '0 0 50%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '24px',
    color: lightBg ? '#000' : '#fff',
    zIndex: 2,
  };
});

const SideImageFrame = styled(Box)({
  flex: '0 0 50%',
  position: 'relative',
  width: '100%',
  height: '100%',
});

const ShopNow = styled(Link)<{ bgColor?: string }>(({ bgColor }) => {
  const lightBg = ['#fff', '#FFE0F0', '#FFF0E0'].includes(bgColor || '');
  return {
    display: 'inline-block',
    marginTop: '12px',
    padding: '10px 28px',
    background: lightBg ? '#000' : '#fff',
    color: lightBg ? '#fff' : '#000',
    fontWeight: 700,
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'transform .3s ease',
    '&:hover': { transform: 'translateY(-2px)' },
  };
});

export default function HeroSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <HeroWrapper>
      {/* LEFT SLIDER */}
      <SliderArea>
        {SLIDES.map((slide, i) => (
          <Slide key={slide.image} active={i === active} bgColor={slide.bgColor}>
            <SlideTextArea isMac={slide.isMac} bgColor={slide.bgColor}>
              <Typography variant={slide.isMac ? 'h3' : 'h4'} fontWeight={700}>
                {slide.title}
              </Typography>
              <Typography sx={{ mt: 2, opacity: 0.8 }}>{slide.subtitle}</Typography>
              <ShopNow href={slide.link} bgColor={slide.bgColor}>
                Shop Now
              </ShopNow>
            </SlideTextArea>
            <SlideImageArea isMac={slide.isMac}>
              <StretchImage src={slide.image} alt={slide.title} fill />
            </SlideImageArea>
          </Slide>
        ))}
      </SliderArea>

      {/* RIGHT CARDS */}
      <SideColumn>
        {SIDE_CARDS.map((card, i) => (
          <SideCard key={i} bgColor={card.bgColor}>
            <SideTextArea bgColor={card.bgColor}>
              <Typography variant="h5" fontWeight={700}>
                {card.title}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                {card.subtitle}
              </Typography>
              <ShopNow href={card.link} bgColor={card.bgColor}>
                Shop Now
              </ShopNow>
            </SideTextArea>
            <SideImageFrame>
              <StretchImage
                src={card.image}
                alt={card.title}
                fill
                style={{ objectFit: 'contain', objectPosition: 'right center' }}
              />
            </SideImageFrame>
          </SideCard>
        ))}
      </SideColumn>
    </HeroWrapper>
  );
}
