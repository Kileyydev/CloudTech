"use client";
import React, { useState, useEffect } from 'react';
import { Box, Typography, styled, IconButton } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const CategoriesContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4, 0), // Removed side padding to eliminate edge spaces
  backgroundColor: '#000',
  position: 'relative',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 0),
  },
}));

const Title = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  color: '#FFFFFF',
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  textTransform: 'uppercase',
  letterSpacing: '2px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.75rem',
    marginBottom: theme.spacing(2),
  },
}));

const CarouselWrapper = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  position: 'relative',
}));

const Carousel = styled(Box)(({ theme }) => ({
  display: 'flex',
  transition: 'transform 0.5s ease-in-out',
  [theme.breakpoints.down('sm')]: {
    flexWrap: 'nowrap',
  },
}));

const CategoryCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  width: '200px',
  flexShrink: 0,
  padding: theme.spacing(0, 2), // Optional padding for card spacing
  [theme.breakpoints.down('sm')]: {
    width: '150px',
  },
}));

const CategoryImage = styled(Box)(({ theme }) => ({
  width: '150px',
  height: '150px',
  borderRadius: '50%',
  backgroundColor: '#333',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    width: '120px',
    height: '120px',
  },
}));

const CategoryName = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 500,
  color: '#E0E0E0',
  marginBottom: theme.spacing(1),
}));

const ProductCount = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
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
}));

const TopCategoriesSection = () => {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  const categories = [
    { name: 'Headphone', count: '25+ Product', image: '/images/headphones.jpg' },
    { name: 'Mobile Phone', count: '25+ Product', image: '/images/slide2.jpeg' },
    { name: 'Smart Watch', count: '25+ Product', image: '/images/watch1.png' },
    { name: 'Laptop', count: '25+ Product', image: '/images/iMac.jpeg' },
    { name: 'Tablet', count: '25+ Product', image: '/images/svmsang.jpg' },
    { name: 'Camera', count: '25+ Product', image: '/images/Camera.png' },
    { name: 'Gaming Console', count: '25+ Product', image: '/images/ps5.jpg' },
    { name: 'Speaker', count: '25+ Product', image: '/images/alexa.webp' },
  ];

  const itemsPerPage = 4;
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  return (
    <CategoriesContainer>
      <Title>Top Categories</Title>
      <CarouselWrapper>
        <NavButtonLeft onClick={handlePrev}>
          <ArrowBackIos />
        </NavButtonLeft>
        <NavButtonRight onClick={handleNext}>
          <ArrowForwardIos />
        </NavButtonRight>
        <Carousel
          sx={{
            transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
            width: `${(categories.length / itemsPerPage) * 100}%`,
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
        </Carousel>
      </CarouselWrapper>
    </CategoriesContainer>
  );
};

export default TopCategoriesSection;