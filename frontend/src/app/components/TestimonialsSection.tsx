"use client";
import { Box, Typography, Card, CardContent, Rating } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRef, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import IconButton from '@mui/material/IconButton';

// Styled Box for the section with blurred background
const SectionBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: '400px', // Ensure minimum height to show background
  backgroundColor: '#FFFFFF', // White base to prevent black sections
  padding: theme.spacing(4),
  color: '#000000',
  textAlign: 'left',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'url(https://img.freepik.com/premium-photo/crystal-clear-headphones-with-transparent-casing_944420-74687.jpg) center/cover no-repeat',
    filter: 'blur(0.5px)', // Blur applied to the background image
    zIndex: 0, // Background stays behind
  },
}));

// Styled Container for cards to sit on top
const ContentContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1, // Cards and content above the blurred background
}));

// Styled Card for testimonial layout
const TestimonialCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  borderRadius: 16,
  height: 350,
  minWidth: 250,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
  },
  backgroundColor: '#FFFFFF', // Clear cards on top
}));

// Styled Image Box for product image
const ProductImageBox = styled(Box)(({ theme }) => ({
  height: 150,
  overflow: 'hidden',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '& img': {
    maxWidth: '100%',
    height: 'auto',
    objectFit: 'contain',
  },
}));

// Styled Slider Container
const SliderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  overflowX: 'hidden',
  scrollBehavior: 'smooth',
  position: 'relative',
  padding: theme.spacing(2),
}));

// Styled Navigation Buttons
const NavButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: '#FFFFFF',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  zIndex: 2, // Ensure buttons are above the blurred background
}));

const TestimonialsSection = () => {
  const sliderRef = useRef(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const testimonials = [
    {
      name: 'Vlad H.',
      comment: 'Great value, phone came quickly, and it was indeed as described: excellent condition. The one thing I was worried about was the battery...',
      rating: 5,
      product: 'iPhone 15 Pro Max 256GB - Black Titanium - Unlocked',
      image: 'https://via.placeholder.com/150?text=iPhone+15+Pro+Max',
    },
    {
      name: 'Ravi G.',
      comment: 'Bought a Samsung S22 green color - chose condition excellent - which it was - am very happy - took hours to install android...',
      rating: 5,
      product: 'Galaxy S22 5G 128GB - Green - Unlocked',
      image: 'https://via.placeholder.com/150?text=Galaxy+S22',
    },
    {
      name: 'Macy W.',
      comment: 'Such a good deal. I’m not much of a tech guru so I really can’t tell any difference from a new product. The sound quality is amazing and...',
      rating: 5,
      product: 'Apple AirPods Pro 2nd gen (2022) - MagSafe (Lightning) Charging case',
      image: 'https://via.placeholder.com/150?text=AirPods+Pro',
    },
    {
      name: 'Aleksandrs B.',
      comment: 'I’ve bought an iPad Pro for my wife. She loves it. Definitely will recommend this app to my friends. Thanks.',
      rating: 5,
      product: 'iPad Pro 11" (2020) 2nd gen 512 GB - Wi-Fi - Space Gray',
      image: 'https://via.placeholder.com/150?text=iPad+Pro',
    },
  ];

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      const handleWheel = (e) => {
        e.preventDefault();
        slider.scrollLeft += e.deltaY;
      };
      slider.addEventListener('wheel', handleWheel);
      return () => slider.removeEventListener('wheel', handleWheel);
    }
  }, []);

  return (
    <SectionBox>
      <ContentContainer>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4, color: '#000000' }}>
          Over 15M customers globally
        </Typography>
        <SliderContainer ref={sliderRef}>
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} sx={{ marginRight: 2, flexShrink: 0 }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 2 }}>
                <ProductImageBox>
                  <img src={testimonial.image} alt={testimonial.product} />
                </ProductImageBox>
                <Typography variant="body2" sx={{ color: '#666666', mb: 1, fontSize: 14 }}>
                  {testimonial.comment}
                </Typography>
                <Typography variant="caption" sx={{ color: '#000000', mb: 1 }}>
                  {testimonial.name}
                </Typography>
                <Rating name="read-only" value={testimonial.rating} readOnly />
                <Typography variant="body2" sx={{ color: '#000000', mt: 1, fontWeight: 'bold' }}>
                  {testimonial.product}
                </Typography>
              </CardContent>
            </TestimonialCard>
          ))}
        </SliderContainer>
        <NavButton sx={{ left: 16 }} onClick={scrollLeft}>
          <ArrowBackIcon />
        </NavButton>
        <NavButton sx={{ right: 16 }} onClick={scrollRight}>
          <ArrowForwardIcon />
        </NavButton>
      </ContentContainer>
    </SectionBox>
  );
};

export default TestimonialsSection;