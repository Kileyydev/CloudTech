"use client";
import React, { useState, useEffect } from 'react';
import { Box, Typography, styled, IconButton } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

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
    display: 'flex', // Changed to flex for grid replacement
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(1), // Matches original Grid spacing={1}
  },
}));

const CategoryCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  width: '140px',
  flexShrink: 0,
  padding: theme.spacing(0, 0.75),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    maxWidth: '120px',
  },
  [theme.breakpoints.up('lg')]: {
    width: 'clamp(110px, 11vw, 130px)',
    padding: theme.spacing(0.5),
    flex: '1 1 calc(20% - 8px)', // Mimics lg={2.4} (12 / 2.4 = 5 columns)
  },
}));

const CategoryImage = styled(Box)(({ theme }) => ({
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  backgroundColor: '#333',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  marginBottom: theme.spacing(0.75),
  [theme.breakpoints.down('sm')]: {
    width: '100px',
    height: '100px',
  },
  [theme.breakpoints.up('lg')]: {
    width: 'clamp(90px, 9vw, 100px)',
    height: 'clamp(90px, 9vw, 100px)',
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
  fontSize: 'clamp(1rem, 2.3vw, 1.2rem)',
  [theme.breakpoints.down('sm')]: {
    fontSize: 'clamp(0.9rem, 1.8vw, 1rem)',
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
  fontSize: 'clamp(1rem, 2.3vw, 1.2rem)',
  [theme.breakpoints.down('sm')]: {
    fontSize: 'clamp(0.9rem, 1.8vw, 1rem)',
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
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: theme.spacing(1), // Matches original Grid spacing={1}
            '& > *': {
              flex: {
                xs: '1 1 100%', // Full width on xs
                sm: '1 1 calc(33.33% - 8px)', // 3 columns on sm
                md: '1 1 calc(25% - 8px)', // 4 columns on md
                lg: '1 1 calc(20% - 8px)', // 5 columns on lg
              },
              minWidth: 0,
            },
          }}
        >
          {categories.map((category, index) => (
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
        </Box>
      </GridWrapper>
    </CategoriesContainer>
  );
};

export default TopCategoriesSection;