"use client";
import { Box, Grid, Typography, Card, CardContent, styled, useTheme } from '@mui/material';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import LaptopIcon from '@mui/icons-material/Laptop';
import HeadsetIcon from '@mui/icons-material/Headset';
import TvIcon from '@mui/icons-material/Tv';
import React from 'react';

// Styled Box for the section
const SectionBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#fff',

  color: '#fff',
  textAlign: 'center',
  position: 'relative',
  margin: theme.spacing(4, 0),
}));

// Styled Title for the section
const Title = styled(Typography)(({ theme }) => ({
  fontSize: '3rem',
  fontWeight: 700,
  marginBottom: theme.spacing(6),
  textTransform: 'uppercase',
  letterSpacing: '2px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
    marginBottom: theme.spacing(4),
  },
}));

// Styled Subtitle
const Subtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  color: '#fff',
  marginBottom: theme.spacing(6),
  maxWidth: '700px',
  margin: '0 auto',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
    marginBottom: theme.spacing(4),
  },
}));

// Styled Card for repair services
const RepairCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#F9FAFB',
  padding: theme.spacing(3),
  height: 250,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
  },
  [theme.breakpoints.down('sm')]: {
    height: 200,
  },
}));

// Styled Icon
const ServiceIcon = styled(Box)(({ theme }) => ({
  fontSize: '2.5rem',
  color: '#4B5EAA',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
  },
}));

// Styled Grid for horizontal layout
const HorizontalGrid = styled(Grid)(({ theme }) => ({
  overflowX: 'auto',
  whiteSpace: 'nowrap',
  paddingBottom: theme.spacing(2),
  '& .MuiGrid-item': {
    display: 'inline-flex',
    verticalAlign: 'top',
  },
}));

const RepairSection = () => {
  const theme = useTheme();

  const repairServices = [
    {
      icon: <PhoneAndroidIcon />,
      title: 'Smartphone Repairs',
      description: 'Fix screens, batteries, and more with expert care.',
    },
    {
      icon: <LaptopIcon />,
      title: 'Laptop Repairs',
      description: 'Resolve hardware and software issues efficiently.',
    },
    {
      icon: <HeadsetIcon />,
      title: 'Headphone Repairs',
      description: 'Restore sound with specialized headphone fixes.',
    },
  ];

  return (
    <SectionBox>
      <Title>We Repair Gadgets</Title>
      <Subtitle>Trust our skilled technicians to restore your devices with precision and top-quality service.</Subtitle>
      <HorizontalGrid container spacing={4} justifyContent="center" alignItems="stretch">
        {repairServices.map((service, index) => (
          <Grid item key={index}>
            <RepairCard>
              <CardContent>
                <ServiceIcon>{service.icon}</ServiceIcon>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {service.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  {service.description}
                </Typography>
              </CardContent>
            </RepairCard>
          </Grid>
        ))}
      </HorizontalGrid>
    </SectionBox>
  );
};

export default RepairSection;