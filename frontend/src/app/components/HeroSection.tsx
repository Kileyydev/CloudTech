"use client";
import React from 'react';
import { Box, styled } from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import Image from 'next/image';

const HeroContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  minHeight: 'clamp(300px, 60vh, 450px)', // Reduced from 400px, 80vh, 600px
  background: 'linear-gradient(180deg, #9a979fff 40%, #fff 100%)',
  padding: theme.spacing(1.5), // Reduced from 2
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3), // Reduced from 4
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4.5), // Reduced from 6
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(6), // Reduced from 8
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
  bottom: 'clamp(15px, 4vh, 30px)', // Reduced from 20px, 5vh, 40px
  width: '100%',
  padding: theme.spacing(1.5), // Reduced from 2
  zIndex: 3,
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2.2), // Reduced from 3
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3), // Reduced from 4
  },
}));

const Card = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: 'clamp(75px, 15vw, 105px)', // Reduced from 100px, 20vw, 140px
  backgroundColor: '#fff',
  width: '22.5vh', // Reduced from 30vh
  maxHeight: '22.5vh', // Reduced from 30vh
  boxShadow: '0 4.5px 9px rgba(0, 0, 0, 0.15), 0 2.2px 4.5px rgba(0, 0, 0, 0.1)', // Reduced from 6px, 12px, 3px, 6px
  overflow: 'hidden',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-3.75px) scale(1.05)', // Reduced from -5px
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.15)', // Reduced from 8px, 16px, 4px, 8px
  },
  [theme.breakpoints.down('sm')]: {
    height: 'clamp(60px, 13.5vw, 90px)', // Reduced from 80px, 18vw, 120px
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
          onError={(e) => {
            e.currentTarget.src = '/images/fallback.jpg';
          }}
        />
      </ImageContainer>
      <CardContainer>
        <Carousel
          autoPlay
          animation="fade"
          indicators={false}
          navButtonsAlwaysVisible
          cycleNavigation
          interval={5000}
          sx={{
            '& .MuiButtonBase-root': {
              color: '#db1b88',
              fontSize: 'clamp(1.2rem, 3vw, 1.4rem)', // Scaled for consistency
            },
          }}
        >
          {cardItems.map((cardSet, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 1.5, // Matches original Grid spacing={1.5}
                '& > *': {
                  flex: {
                    xs: '1 1 100%', // Full width on extra-small screens
                    sm: '1 1 calc(50% - 12px)', // Two columns on small screens
                    md: '1 1 calc(25% - 18px)', // Four columns on medium screens and up
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
          ))}
        </Carousel>
      </CardContainer>
    </HeroContainer>
  );
};

export default HeroSection;