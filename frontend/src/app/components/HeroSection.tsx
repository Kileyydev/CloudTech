"use client";
import React from 'react';
import { Box, styled } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, EffectFade } from 'swiper/modules';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

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
  backgroundColor: '#fff',
  width: '22.5vh',
  maxHeight: '22.5vh',
  boxShadow: '0 4.5px 9px rgba(0, 0, 0, 0.15), 0 2.2px 4.5px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-3.75px) scale(1.05)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.15)',
  },
  [theme.breakpoints.down('sm')]: {
    height: 'clamp(60px, 13.5vw, 90px)',
  },
}));

// Placeholder images (replace with actual paths)
const cardItems = [
  [
    { src: '/images/gaming-headphone.jpg', alt: 'Gaming Laptop' },
    { src: '/images/gaming-headphone.jpg', alt: 'Gaming Headphone' },
    { src: '/images/gaming-headphone.jpg', alt: 'Hero Image' },
    { src: '/images/gaming-headphone.jpg', alt: 'Mouse' },
  ],
  [
    { src: '/images/gaming-headphone.jpg', alt: 'Phone' },
    { src: '/images/gaming-headphone.jpg', alt: 'Slide 1' },
    { src: '/images/gaming-headphone.jpg', alt: 'Slide 2' },
    { src: '/images/gaming-headphone.jpg', alt: 'Slide 3' },
  ],
];

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
          modules={[Autoplay, Navigation, EffectFade]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          navigation
          loop
          effect="fade"
          spaceBetween={12}
          slidesPerView={1}
          style={{
            '--swiper-navigation-color': '#db1b88',
            '--swiper-navigation-size': 'clamp(1.2rem, 3vw, 1.4rem)',
          } as React.CSSProperties}
        >
          {cardItems.map((cardSet, index) => (
            <SwiperSlide key={index}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: 1.5,
                  '& > *': {
                    flex: {
                      xs: '1 1 100%',
                      sm: '1 1 calc(50% - 12px)',
                      md: '1 1 calc(25% - 18px)',
                    },
                    minWidth: 0,
                  },
                }}
              >
                {cardSet.map((card, cardIndex) => (
                  <Card key={cardIndex}>
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
                ))}
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </CardContainer>
    </HeroContainer>
  );
};

export default HeroSection;