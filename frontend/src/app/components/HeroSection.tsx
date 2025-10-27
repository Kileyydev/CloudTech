'use client';

import React from 'react';
import { Box, styled } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';
import 'swiper/css';
import 'swiper/css/navigation';

// Styled components
const HeroContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  minHeight: 'clamp(300px, 60vh, 450px)',
  background: 'linear-gradient(180deg, #9a979fff 40%, #fff 100%)',
  padding: theme.spacing(6),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  // Hide on small and medium screens
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
  [theme.breakpoints.up('xl')]: {
    padding: theme.spacing(7),
  },
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  width: '60%',
  height: '100%',
  zIndex: 1,
}));

const CardContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 'clamp(15px, 4vh, 30px)',
  width: '100%',
  padding: theme.spacing(3),
  zIndex: 3,
  display: 'flex',
  justifyContent: 'center',
}));

const Card = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: 'clamp(75px, 15vw, 105px)',
  width: 'clamp(170px, 18vw, 200px)',
  backgroundColor: '#fff',
  boxShadow: '0 4.5px 9px rgba(0, 0, 0, 0.15), 0 2.2px 4.5px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
  },
  '@keyframes zoomIn': {
    '0%': { transform: 'scale(0.95)', opacity: 0.8 },
    '100%': { transform: 'scale(1)', opacity: 1 },
  },
}));

// Card items
const cardItems = [
  { src: '/images/samsung.jpg', alt: 'Samsung', href: '/samsung' },
  { src: '/images/apple.jpg', alt: 'Apple', href: '/apple' },
  { src: '/images/smartphones.jpg', alt: 'Smartphones', href: '/smartphones' },
  { src: '/images/mobile-accessories.jpg', alt: 'Mobile Accessories', href: '/mobile-accessories' },
  { src: '/images/audio.jpg', alt: 'Audio', href: '/audio' },
  { src: '/images/gaming.jpg', alt: 'Gaming', href: '/gaming' },
  { src: '/images/storage.jpg', alt: 'Storage', href: '/storage' },
  { src: '/images/powerbank.jpg', alt: 'PowerBank', href: '/powerbank' },
];

// Group cards for large screens: two slides with 4 cards each
const cardGroups = {
  lg: [
    [cardItems[0], cardItems[1], cardItems[2], cardItems[3]], // Loose cards (12px gap)
    [cardItems[4], cardItems[5], cardItems[6], cardItems[7]], // Tight cards (4px gap)
  ],
};

const HeroSection: React.FC = () => {
  return (
    <HeroContainer>
      <ImageContainer>
        <Image
          src="/images/gaming-headphone.jpg"
          alt="Gaming Headphones"
          fill
          style={{ objectFit: 'contain', objectPosition: 'right' }}
          priority
          quality={85}
          sizes="(max-width: 1280px) 100vw, 60vw"
          onError={(e) => {
            e.currentTarget.src = '/images/fallback.jpg';
          }}
        />
      </ImageContainer>
      <CardContainer>
        <Swiper
          modules={[Navigation]}
          navigation
          loop={false}
          slidesPerView={1}
          spaceBetween={0}
          breakpoints={{
            1280: { slidesPerView: 1, spaceBetween: 0 }, // lg and above
          }}
          style={{
            '--swiper-navigation-color': '#DC1A8A',
            '--swiper-navigation-size': 'clamp(1rem, 2.5vw, 1.2rem)',
          } as React.CSSProperties}
        >
          {cardGroups.lg.map((group, index) => (
            <SwiperSlide
              key={`group-lg-${index}`}
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: index === 0 ? '12px' : '4px', // Loose (12px) for first slide, tight (4px) for second
              }}
            >
              {group.map((card) => (
                <Link key={card.alt} href={card.href} style={{ textDecoration: 'none' }}>
                  <Card>
                    <Image
                      src={card.src}
                      alt={card.alt}
                      fill
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.src = '/images/fallback.jpg';
                      }}
                    />
                  </Card>
                </Link>
              ))}
            </SwiperSlide>
          ))}
        </Swiper>
      </CardContainer>
    </HeroContainer>
  );
};

export default HeroSection;