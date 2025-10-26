'use client';

import React from 'react';
import { Box, styled } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';
import 'swiper/css';
import 'swiper/css/navigation';

const HeroContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  minHeight: 'clamp(300px, 60vh, 450px)',
  background: 'linear-gradient(180deg, #9a979fff 40%, #fff 100%)',
  padding: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4.5),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(6),
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
  [theme.breakpoints.down('md')]: {
    width: '100%',
    height: '100%',
    top: 0,
    order: 1,
  },
}));

const CardContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 'clamp(15px, 4vh, 30px)',
  width: '100%',
  padding: theme.spacing(1.5),
  zIndex: 3,
  display: 'flex',
  justifyContent: 'center',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2.2),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3),
  },
}));

const Card = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: 'clamp(75px, 15vw, 105px)',
  width: 'clamp(120px, 30vw, 150px)',
  backgroundColor: '#fff',
  boxShadow: '0 4.5px 9px rgba(0, 0, 0, 0.15), 0 2.2px 4.5px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border 0.3s ease-in-out',
  '@keyframes zoomIn': {
    '0%': { transform: 'scale(0.95)', opacity: 0.8 },
    '100%': { transform: 'scale(1)', opacity: 1 },
  },
  [theme.breakpoints.up('sm')]: {
    width: 'clamp(140px, 24vw, 170px)',
  },
  [theme.breakpoints.up('lg')]: {
    width: 'clamp(170px, 18vw, 200px)',
  },
}));

// Updated card items with 8 unique items linked to categories
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

// Group cards for middle and large screens
const cardGroups = {
  sm: [
    [cardItems[0], cardItems[1]],
    [cardItems[2], cardItems[3]],
    [cardItems[4], cardItems[5]],
    [cardItems[6], cardItems[7]],
  ],
  lg: [
    [cardItems[0], cardItems[1], cardItems[2], cardItems[3]],
    [cardItems[4], cardItems[5], cardItems[6], cardItems[7]],
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
          sizes="(max-width: 768px) 100vw, 60vw"
          onError={(e) => {
            e.currentTarget.src = '/images/fallback.jpg';
          }}
        />
      </ImageContainer>
      <CardContainer>
        <Swiper
          modules={[Autoplay, Navigation]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          navigation
          loop
          spaceBetween={12}
          slidesPerView={1}
          centeredSlides={true}
          breakpoints={{
            600: { slidesPerView: 2, spaceBetween: 6, centeredSlides: true, loop: false, autoplay: false },
            960: { slidesPerView: 2, spaceBetween: 6, centeredSlides: true, loop: false, autoplay: false },
            1280: { slidesPerView: 4, spaceBetween: 8, centeredSlides: true, loop: false, autoplay: false },
            1920: { slidesPerView: 4, spaceBetween: 8, centeredSlides: true, loop: false, autoplay: false },
          }}
          style={{
            '--swiper-navigation-color': '#DC1A8A',
            '--swiper-navigation-size': 'clamp(1rem, 2.5vw, 1.2rem)',
          } as React.CSSProperties}
        >
          {cardItems.map((card, index) => (
            <SwiperSlide key={index} style={{ display: 'flex', justifyContent: 'center' }}>
              <Link href={card.href} style={{ textDecoration: 'none' }}>
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
            </SwiperSlide>
          ))}
          {cardGroups.sm.map((group, index) => (
            <SwiperSlide
              key={`group-sm-${index}`}
              style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}
              className="sm-visible md-visible"
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
          {cardGroups.lg.map((group, index) => (
            <SwiperSlide
              key={`group-lg-${index}`}
              style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}
              className="lg-visible xl-visible"
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