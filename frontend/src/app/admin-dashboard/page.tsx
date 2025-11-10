// frontend/src/app/admin-dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Divider,
  useTheme,
  Container,
} from '@mui/material';
import {
  People,
  PhoneIphone,
  ShoppingCart,
  Discount,
  Star,
  TrendingUp,
  AccessTime,
  CheckCircle,
  Pending,
  Close,
} from '@mui/icons-material';
import MainNavBar from '@/app/admin-dashboard/components/MainNavBar';
import UsersSection from './components/UsersSection';
import ProductsSection from '@/app/admin-dashboard/components/ProductSection';
import DashboardSection from './components/DashboardSection';
import DiscountsSection from './components/DiscountSection';
import TestimonialsAdminPage from './components/TestimonialsSection';
import AdminRepairsPage from './components/RepairSection';
import OrdersSection from '@/app/admin-dashboard/components/OrdersSection';


export default function AdminDashboardPageComponent() {
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const theme = useTheme();

  // Mock real-time stats (replace with actual API calls in production)
  const [stats, setStats] = useState({
    totalUsers: 1247,
    totalProducts: 89,
    totalOrders: 312,
    totalRepairs: 47,
    pendingRepairs: 12,
    inProgressRepairs: 8,
    completedRepairs: 27,
    revenueToday: 284500,
    activeDiscounts: 5,
    pendingTestimonials: 3,
  });

  const currentTime = new Date().toLocaleString('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Nairobi',
  });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <TrendingUp /> },
    { id: 'users', label: 'Users', icon: <People /> },
    { id: 'products', label: 'Products', icon: <PhoneIphone /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart /> },
    { id: 'repairs', label: 'Repairs', icon: <AccessTime /> },
    { id: 'discounts', label: 'Discounts', icon: <Discount /> },
    { id: 'testimonials', label: 'Testimonials', icon: <Star /> },
  ];

  const getStatCard = (title: string, value: string | number, icon: React.ReactNode, color: string, bg: string) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid #ddd',
        bgcolor: '#fff',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2" sx={{ color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#000', mt: 1 }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 0,
            bgcolor: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#ffffffff',
        color: '#000',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        margin: 0,
        padding: 0,
      }}
    >
    

      {/* Navigation */}
      <Box sx={{ bgcolor: '#9a979fff', borderBottom: '1px solid #ddd' }}>
        <Box sx={{ px: { xs: 2, md: 4 } }}>
          <MainNavBar activeSection={activeSection} setActiveSection={setActiveSection} />
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1 }}>
        {activeSection === 'dashboard' ? (
          <>
            {/* Summary Stats Grid - Full Width */}
            {/* Active Sections Summary */}
            <Box sx={{ px: { xs: 2, md: 4 }, py: 5 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: '#000' }}>
                QUICK ACTIONS
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)',
                  },
                  gap: 3,
                }}
              >
                {menuItems.slice(1).map((item) => (
                  <Paper
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    sx={{
                      p: 4,
                      border: '1px solid #ddd',
                      _hover: { borderColor: '#000' },
                      cursor: 'pointer',
                      bgcolor: '#fff',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 0,
                        bgcolor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#000',
                        mb: 2,
                      }}
                    >
                      {React.cloneElement(item.icon, { sx: { fontSize: 40 } })}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#000' }}>
                      {item.label.toUpperCase()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                      Manage {item.label.toLowerCase()} settings and data
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Box>

            <Divider sx={{ borderColor: '#ddd' }} />
          </>
        ) : (
          <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
            {activeSection === 'products' && <ProductsSection />}
            {activeSection === 'discounts' && <DiscountsSection />}
            {activeSection === 'users' && <UsersSection />}
            {activeSection === 'testimonials' && <TestimonialsAdminPage />}
            {activeSection === 'repairs' && <AdminRepairsPage />}
            {activeSection === 'orders' && <OrdersSection />}
          </Box>
        )}
      </Box>
    </Box>
  );
}