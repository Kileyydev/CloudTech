import React from 'react';
import { Box, Typography, Container, Grid } from '@mui/material';

const Home = () => {
  return (
    <Container maxWidth={false} sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#E7E7E7'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        textAlign: 'center', 
        p: 4,
        backgroundImage: 'url(/images/headphones.jpg)', // Updated relative path
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left center',
        minHeight: '70vh',
        width: '100%',
      }}>
        <Box sx={{ ml: '20%', p: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
            Melodies that help you stay Focus
          </Typography>
          <Typography variant="h6" component="p" gutterBottom sx={{ color: '#666', mb: 4 }}>
            Charge Once and Listen for a Week
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: '#444', mb: 4 }}>
            If you are looking for the best price of Basses D02 Pro Bluetooth 5.0 Headphone NG02-C01 Black - 3 Months Warranty in BD, you have come to the right place. We offer the most competitive pricing with authentic products and warranty.
          </Typography>
          <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
            <Grid item>
              <Box sx={{ bgcolor: '#fff3e0', p: 2, borderRadius: 1 }}>
                <Typography variant="h6" sx={{ color: '#333' }}>Music time about</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>40h</Typography>
              </Box>
            </Grid>
            <Grid item>
              <Box sx={{ bgcolor: '#fff3e0', p: 2, borderRadius: 1 }}>
                <Typography variant="h6" sx={{ color: '#333' }}>Charging time about</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>1.5h</Typography>
              </Box>
            </Grid>
            <Grid item>
              <Box sx={{ bgcolor: '#fff3e0', p: 2, borderRadius: 1 }}>
                <Typography variant="h6" sx={{ color: '#333' }}>Standby time about</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>300h</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;