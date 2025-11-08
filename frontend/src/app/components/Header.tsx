'use client'; // For MUI client-side
import { AppBar, Toolbar, Box } from '@mui/material';
import Image from 'next/image';
import TickerBar from './TickerBar'; // Adjust path if needed (e.g., '@/components/TickerBar')
import TopNavBar from './TopNavBar';
import MainNavBar from './MainNavBar';

export default function Header() {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#000', color: '#fff' }}>
      {/* Ticker Section with Logo */}
      <Toolbar sx={{
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: { xs: 60, md: 70 }, // Room for ticker
        p: 0
      }}>
        {/* Fixed Logo on Left */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Image
            src="/logo1.jpg" // Your PNG in /public
            alt="CloudTech Logo"
            width={130}  // Adjust to your PNG's width
            height={60}  // Adjust to your PNG's height
            priority
            style={{ objectFit: 'contain' }}
          />
        </Box>
        {/* TickerBar */}
        <Box sx={{
          flexGrow: 1,
          ml: 2, // Margin left to avoid logo overlap
          maxWidth: '100%'
        }}>
          <TickerBar />
        </Box>
        {/* Optional: Right-side elements (e.g., cart icon) */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {/* Add nav/search here later if needed */}
        </Box>
      </Toolbar>
      {/* TopNavBar Section - Independent */}
      <Box sx={{ width: '100%', p: 0 }}>
        <TopNavBar />
      </Box>
      {/* MainNavBar Section - Independent */}
      <Box sx={{ width: '100%', p: 0 }}>
        <MainNavBar />
      </Box>
    </AppBar>
  );
}