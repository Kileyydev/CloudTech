'use client';

import React from 'react';
import { Box, Typography, styled, IconButton } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import 'swiper/css';
import 'swiper/css/navigation';

const CategoriesContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 0),
  backgroundColor: '#000',
  position: 'relative',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.75, 0),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2, 0),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(2.5, 0),
  },
  [theme.breakpoints.up('xl')]: {
    padding: theme.spacing(3, 0),
  },
}));

const Title = styled(Typography)(({ theme }) => ({
  fontSize: 'clamp(1.6rem, 3.8vw, 1.8rem)',
  fontWeight: 700,
  color: '#FFFFFF',
  textAlign: 'center',
  marginBottom: theme.spacing(1.5),
  textTransform: 'uppercase',
  letterSpacing: '1.2px',
  [theme.breakpoints.down('sm')]: {
    fontSize: 'clamp(1.2rem, 3.3vw, 1.3rem)',
    marginBottom: theme.spacing(0.75),
  },
}));

const CategoryCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  width: 'clamp(80px, 28vw, 100px)',
  flexShrink: 0,
  padding: theme.spacing(0, 0.5),
  boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
  [theme.breakpoints.up('sm')]: {
    width: 'clamp(100px, 22vw, 120px)',
  },
  [theme.breakpoints.up('lg')]: {
    width: 'clamp(100px, 12vw, 120px)',
    padding: theme.spacing(0.5),
  },
}));

const CategoryImage = styled(Box)(({ theme }) => ({
  width: 'clamp(60px, 22vw, 80px)',
  height: 'clamp(60px, 22vw, 80px)',
  borderRadius: '50%',
  backgroundColor: '#333',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  marginBottom: theme.spacing(0.75),
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  [theme.breakpoints.up('sm')]: {
    width: 'clamp(70px, 18vw, 90px)',
    height: 'clamp(70px, 18vw, 90px)',
  },
  [theme.breakpoints.up('lg')]: {
    width: 'clamp(80px, 10vw, 100px)',
    height: 'clamp(80px, 10vw, 100px)',
  },
}));

const CategoryName = styled(Typography)(({ theme }) => ({
  fontSize: 'clamp(0.7rem, 1.7vw, 0.8rem)',
  fontWeight: 500,
  color: '#E0E0E0',
  marginBottom: theme.spacing(0.4),
}));

const ProductCount = styled(Typography)(({ theme }) => ({
  fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)',
  color: '#B0B0B0',
}));

const NavButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#FFFFFF',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  zIndex: 10,
  fontSize: 'clamp(1rem, 2.3vw, 1.2rem)',
  [theme.breakpoints.down('sm')]: {
    fontSize: 'clamp(0.9rem, 1.8vw, 1rem)',
  },
  [theme.breakpoints.up('lg')]: {
    display: 'none',
  },
}));

const NavButtonLeft = styled(NavButton)({
  left: 0,
});

const NavButtonRight = styled(NavButton)({
  right: 0,
});

const CategoriesWrapper = styled(Box)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.up('lg')]: {
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(0.25), // 2px gap
  },
}));

const TopCategoriesSection = () => {
  const categories = [
    { name: 'Headphones', image: '/images/headphones.jpg' },
    { name: 'Mobile Phones',  image: '/images/iphone17.webp' },
    { name: 'Mobile Accessories',  image: '/images/cables.png' },
    { name: 'Laptops',  image: '/images/mac.jpg' },
    { name: 'Audio',  image: '/images/oraimo.webp' },
    { name: 'Gaming Console', image: '/images/ps5.png' },
    { name: 'Watch',  image: '/images/watch.webp' },
    { name: 'iPads',  image: '/images/iPad.webp' },
  ];

  return (
    <CategoriesContainer>
      <Title>Top Categories</Title>
      <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
        <Swiper
          modules={[Navigation]}
          navigation={{
            prevEl: '.swiper-button-prev',
            nextEl: '.swiper-button-next',
          }}
          spaceBetween={2}
          slidesPerView={2.2}
          breakpoints={{
            600: { slidesPerView: 3.2, spaceBetween: 2 },
            960: { slidesPerView: 3.2, spaceBetween: 2 },
          }}
          style={{
            width: '100%',
            padding: '0 24px', // Extra padding for nav buttons
          }}
        >
          {categories.map((category, index) => (
            <SwiperSlide key={index} style={{ display: 'flex', justifyContent: 'center' }}>
              <CategoryCard>
                <CategoryImage sx={{ backgroundImage: `url(${category.image})` }} />
                <CategoryName>{category.name}</CategoryName>

              </CategoryCard>
            </SwiperSlide>
          ))}
          <NavButtonLeft className="swiper-button-prev">
            <ArrowBackIos />
          </NavButtonLeft>
          <NavButtonRight className="swiper-button-next">
            <ArrowForwardIos />
          </NavButtonRight>
        </Swiper>
      </Box>
      <CategoriesWrapper>
        {categories.map((category, index) => (
          <CategoryCard key={index}>
            <CategoryImage sx={{ backgroundImage: `url(${category.image})` }} />
            <CategoryName>{category.name}</CategoryName>
          </CategoryCard>
        ))}
      </CategoriesWrapper>
    </CategoriesContainer>
  );
};

export default TopCategoriesSection;