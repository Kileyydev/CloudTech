"use client";
import React from 'react';
import { Box, Button } from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import Image from 'next/image';
import styles from './HeroSection.module.css';

const items = [
  {
    type: 'image',
    src: '/images/headphones.jpg',
    alt: 'Hero Image 1',
  },
  {
    type: 'video',
    src: '/images/samsung/Galaxy-z-fold.mp4',
  },
  {
    type: 'image',
    src: '/images/Slide1.jpeg',
    alt: 'Hero Image 2',
  },
];

const HeroSection: React.FC = () => {
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '80vh', overflow: 'hidden' }}>
      <Carousel
        autoPlay
        animation="slide"
        indicators
        navButtonsAlwaysVisible
        cycleNavigation
        interval={10000} // 10 seconds
        sx={{
          height: '100%',
          '& .MuiButtonBase-root': {
            color: '#db1b88', // Button color
          },
          '& .CarouselIndicator': {
            backgroundColor: '#db1b88', // Indicator color
          },
        }}
      >
        {items.map((item, index) => (
          <Box key={index} sx={{ position: 'relative', height: '80vh' }}>
            {item.type === 'image' ? (
              <Image
                src={item.src}
                alt={item.alt || 'Hero Image'}
                fill
                style={{ objectFit: 'cover' }}
                priority={index === 0}
              />
            ) : (
              <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              >
                <source src={item.src} type="video/mp4" />
              </video>
            )}
            <Box
              sx={{
                position: 'absolute',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <Button variant="contained" sx={{ backgroundColor: '#fff', '&:hover': { backgroundColor: '#b01570' } }} size="large">
                Shop Now
              </Button>
            </Box>
          </Box>
        ))}
      </Carousel>
    </Box>
  );
};

export default HeroSection;