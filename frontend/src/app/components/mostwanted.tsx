"use client";
import React from 'react';
import { Box, Typography, styled } from '@mui/material';
import Link from 'next/link';

const CategorySection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(180deg, #9a979fff 40%, #fff 100%)',
  padding: theme.spacing(2),
  textAlign: 'center',
}));

const Title = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  fontWeight: 600,
  color: '#333',
  marginBottom: theme.spacing(2),
}));

const CategoryGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(120px, 1fr))',
  gap: theme.spacing(2),
  justifyContent: 'center',
}));

const CategoryCard = styled(Box)(({ theme }) => ({
  backgroundColor: '#e6f3da',
  borderRadius: '12px',
  padding: theme.spacing(2),
  textAlign: 'center',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const CategoryName = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  fontWeight: 500,
  color: '#333',
  marginTop: theme.spacing(1),
}));

const CategoryImage = styled(Box)(({ theme }) => ({
  height: '80px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& img': {
    maxHeight: '100%',
    maxWidth: '100%',
  },
}));

const ShopSection = () => {
  const categories = [
    { name: 'iPhone', image: '/images/iphone.jpg' },
    { name: 'MacBook', image: '/images/macbook.jpg' },
    { name: 'iPad', image: '/images/ipad.jpg' },
    { name: 'Smartwatches', image: '/images/smartwatch.jpg' },
    { name: 'Android', image: '/images/android.jpg' },
    { name: 'Windows Laptops', image: '/images/windows.jpg' },
    { name: 'Airpods', image: '/images/airpods.jpg' },
    { name: 'Great Deals', image: '/images/deals.jpg' },
  ];

  return (
    <CategorySection>
      <Title>Shop our most wanted</Title>
      <CategoryGrid>
        {categories.map((category) => (
          <Link href={`/category/${category.name.toLowerCase().replace(' ', '-')}`} key={category.name} passHref>
            <CategoryCard>
              <CategoryImage>
                <img src={category.image} alt={category.name} />
              </CategoryImage>
              <CategoryName>{category.name}</CategoryName>
            </CategoryCard>
          </Link>
        ))}
      </CategoryGrid>
    </CategorySection>
  );
};

export default ShopSection;