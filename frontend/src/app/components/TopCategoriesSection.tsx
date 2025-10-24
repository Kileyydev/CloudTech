"use client";
import React, { useState, useEffect } from 'react';
import { Box, Typography, styled, IconButton, Grid } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const CategoriesContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 0), // Further reduced from 2, 0
  backgroundColor: '#000',
  position: 'relative',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.75, 0), // Further reduced from 1, 0
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
  fontSize: 'clamp(1.6rem, 3.8vw, 1.8rem)', // Slightly smaller from 1.8rem, 2rem
  fontWeight: 700,
  color: '#FFFFFF',
  textAlign: 'center',
  marginBottom: theme.spacing(1.5), // Reduced from 2
  textTransform: 'uppercase',
  letterSpacing: '1.2px', // Reduced from 1.5px
  [theme.breakpoints.down('sm')]: {
    fontSize: 'clamp(1.2rem, 3.3vw, 1.3rem)', // Slightly smaller from 1.3rem, 1.4rem
    marginBottom: theme.spacing(0.75), // Reduced from 1
  },
}));

const CarouselWrapper = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  position: 'relative',
  [theme.breakpoints.up('lg')]: {
    display: 'none', // Hide carousel on lg+
  },
}));

const Carousel = styled(Box)(({ theme }) => ({
  display: 'flex',
  transition: 'transform 1s ease-in-out',
  '&.resetting': {
    transition: 'none', // Disable transition during reset
  },
  [theme.breakpoints.down('sm')]: {
    flexWrap: 'nowrap',
    transition: 'transform 1.5s ease-in-out', // Slower on xs
  },
}));

const GridWrapper = styled(Box)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.up('lg')]: {
    display: 'block', // Show grid on lg+
  },
}));

const CategoryCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  width: '140px', // Slightly smaller from 150px
  flexShrink: 0,
  padding: theme.spacing(0, 0.75), // Reduced from 0, 1
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    maxWidth: '120px', // Increased from 112px for visibility
  },
  [theme.breakpoints.up('lg')]: {
    width: 'clamp(110px, 11vw, 130px)', // Adjusted from 120px, 140px
    padding: theme.spacing(0.5),
  },
}));

const CategoryImage = styled(Box)(({ theme }) => ({
  width: '100px', // Slightly smaller from 112px
  height: '100px',
  borderRadius: '50%',
  backgroundColor: '#333',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  marginBottom: theme.spacing(0.75), // Reduced from 1
  [theme.breakpoints.down('sm')]: {
    width: '100px', // Increased from 90px
    height: '100px',
  },
  [theme.breakpoints.up('lg')]: {
    width: 'clamp(90px, 9vw, 100px)', // Adjusted from 100px, 110px
    height: 'clamp(90px, 9vw, 100px)',
  },
}));

const CategoryName = styled(Typography)(({ theme }) => ({
  fontSize: 'clamp(0.7rem, 1.7vw, 0.8rem)', // Slightly smaller from 0.75rem, 0.85rem
  fontWeight: 500,
  color: '#E0E0E0',
  marginBottom: theme.spacing(0.4), // Reduced from 0.5
}));

const ProductCount = styled(Typography)(({ theme }) => ({
  fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)', // Slightly smaller from 0.65rem, 0.75rem
  color: '#B0B0B0',
}));

const NavButtonLeft = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  left: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#FFFFFF',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  zIndex: 10,
  fontSize: 'clamp(1rem, 2.3vw, 1.2rem)', // Smaller from 1.2rem, 1.4rem
  [theme.breakpoints.down('sm')]: {
    fontSize: 'clamp(0.9rem, 1.8vw, 1rem)', // Smaller from 1rem, 1.2rem
  },
}));

const NavButtonRight = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#FFFFFF',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  zIndex: 10,
  fontSize: 'clamp(1rem, 2.3vw, 1.2rem)', // Smaller from 1.2rem, 1.4rem
  [theme.breakpoints.down('sm')]: {
    fontSize: 'clamp(0.9rem, 1.8vw, 1rem)', // Smaller from 1rem, 1.2rem
  },
}));

const TopCategoriesSection = () => {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  const categories = [
    { name: 'Headphones', count: '25+ Products', image: '/images/headphones.jpg' },
    { name: 'Mobile Phones', count: '25+ Products', image: '/images/mobile-phones.jpg' },
    { name: 'Mobile Accessories', count: '25+ Products', image: '/images/mobile-accessories.jpg' },
    { name: 'Laptops', count: '25+ Products', image: '/images/laptops.jpg' },
    { name: 'Pods', count: '25+ Products', image: '/images/pods.jpg' },
    { name: 'Gaming Console', count: '25+ Products', image: '/images/gaming-console.jpg' },
    { name: 'Watch', count: '25+ Products', image: '/images/watch.jpg' },
    { name: 'iPads', count: '25+ Products', image: '/images/ipads.jpg' },
  ];

  const itemsPerPage = theme.breakpoints.down('sm') ? 1 : 4;
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const extendedCategories = [...categories, ...categories.slice(0, itemsPerPage)]; // Duplicate for seamless looping

  useEffect(() => {
    if (currentIndex >= categories.length) {
      const resetTimeout = setTimeout(() => {
        setCurrentIndex(0);
      }, 50); // Short delay to allow transition to complete
      return () => clearTimeout(resetTimeout);
    } else if (currentIndex < 0) {
      const resetTimeout = setTimeout(() => {
        setCurrentIndex(categories.length - 1);
      }, 50);
      return () => clearTimeout(resetTimeout);
    }
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <CategoriesContainer>
      <Title>Top Categories</Title>
      <CarouselWrapper>
        <NavButtonLeft onClick={handlePrev} disabled={currentIndex === 0}>
          <ArrowBackIos />
        </NavButtonLeft>
        <NavButtonRight onClick={handleNext} disabled={currentIndex >= categories.length - itemsPerPage}>
          <ArrowForwardIos />
        </NavButtonRight>
        <Carousel
          className={currentIndex >= categories.length || currentIndex < 0 ? 'resetting' : ''}
          sx={{
            transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
            width: `${(extendedCategories.length / itemsPerPage) * 100}%`,
          }}
        >
          {extendedCategories.map((category, index) => (
            <CategoryCard key={index}>
              <CategoryImage
                sx={{
                  backgroundImage: `url(${category.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <CategoryName>{category.name}</CategoryName>
              <ProductCount>{category.count}</ProductCount>
            </CategoryCard>
          ))}
        </Carousel>
      </CarouselWrapper>
      <GridWrapper>
        <Grid container spacing={1} justifyContent="center" alignItems="center">
          {categories.map((category, index) => (
            <Grid item xs={12} sm={4} md={3} lg={2.4} key={index}>
              <CategoryCard>
                <CategoryImage
                  sx={{
                    backgroundImage: `url(${category.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <CategoryName>{category.name}</CategoryName>
                <ProductCount>{category.count}</ProductCount>
              </CategoryCard>
            </Grid>
          ))}
        </Grid>
      </GridWrapper>
    </CategoriesContainer>
  );
};

export default TopCategoriesSection;
