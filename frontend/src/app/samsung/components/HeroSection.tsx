"use client";
import React, { useState, useEffect } from 'react';
import { Box, styled, Typography } from '@mui/material';

const HeroSectionStyled = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff', // White background
  position: 'relative',
  width: '100%',
  height: '400px', // Adjustable height
  overflow: 'hidden',
  '& video': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 1,
  },
  '& .fallback': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 2,
    color: '#000000',
  },
}));

const VideoHero = () => {
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const video = document.querySelector('video');
    if (video) {
      video.addEventListener('error', () => setVideoError(true));
    }
    return () => {
      if (video) {
        video.removeEventListener('error', () => setVideoError(true));
      }
    };
  }, []);

  return (
    <HeroSectionStyled>
      <video
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/images/samsung/Galaxy-z-fold.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {videoError && (
        <Typography variant="h6" className="fallback">
          Video failed to load. Ensure the file is in /public/images/samsung/.
        </Typography>
      )}
    </HeroSectionStyled>
  );
};

export default VideoHero;
