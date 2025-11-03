// src/app/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, Stack, Chip, Button, CircularProgress } from '@mui/material';
import { LocalShipping, CheckCircle, AccessTime } from '@mui/icons-material';
import TopNavBar from '../../components/TopNavBar';
import MainNavBar from '../../components/MainNavBar';
import TickerBar from '../../components/TickerBar';

const STATUS_STEPS = [
  { key: 'received', label: 'Order Received', icon: <AccessTime /> },
  { key: 'processing', label: 'Processing', icon: <AccessTime /> },
  { key: 'packed', label: 'Packed', icon: <AccessTime /> },
  { key: 'dispatched', label: 'Dispatched', icon: <LocalShipping /> },
  { key: 'delivered', label: 'Delivered', icon: <CheckCircle /> },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = () => {
      const saved = localStorage.getItem('orders');
      if (saved) {
        const list = JSON.parse(saved);
        setOrders(list);
      }
      setLoading(false);
    };
    loadOrders();

    // Listen for admin updates
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIndex = (status: string) => {
    return STATUS_STEPS.findIndex(s => s.key === status);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
      <CircularProgress sx={{ color: '#e91e63' }} />
    </Box>;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9f9f9' }}>
      <TickerBar />
      <TopNavBar />
      <MainNavBar />

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#e91e63', mb: 4, textAlign: 'center' }}>
          Your Orders
        </Typography>

        {orders.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 0 }}>
            <Typography variant="h6" color="text.secondary">No orders yet</Typography>
            <Button variant="contained" sx={{ mt: 3, bgcolor: '#e91e63', borderRadius: 0 }} href="/">
              Start Shopping
            </Button>
          </Paper>
        ) : (
          <Stack spacing={4}>
            {orders.map((order) => {
              const currentIdx = getStatusIndex(order.status || 'received');
              return (
                <Paper key={order.id} sx={{
                  p: 4,
                  borderRadius: 0,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                  borderLeft: '5px solid #e91e63',
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{order.id}</Typography>
                      <Typography color="text.secondary">{new Date(order.date).toLocaleDateString()}</Typography>
                    </Box>
                    <Chip
                      label={order.status.replace('_', ' ')}
                      color={currentIdx >= 4 ? 'success' : 'primary'}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>

                  <Typography fontWeight={600} sx={{ mb: 2 }}>
                    KES {order.total.toLocaleString()} • {order.items.length} items
                  </Typography>

                  {/* PROGRESS BAR */}
                  <Box sx={{ position: 'relative', my: 4 }}>
                    <Box sx={{ position: 'absolute', top: 20, left: 0, right: 0, height: 4, bgcolor: '#eee', zIndex: 1 }} />
                    <Box sx={{
                      position: 'absolute',
                      top: 20,
                      left: 0,
                      width: `${(currentIdx / 4) * 100}%`,
                      height: 4,
                      bgcolor: '#e91e63',
                      transition: 'width 0.6s ease',
                      zIndex: 2,
                    }} />

                    <Stack direction="row" justifyContent="space-between" sx={{ position: 'relative', zIndex: 3 }}>
                      {STATUS_STEPS.map((step, i) => (
                        <Box key={i} sx={{ textAlign: 'center' }}>
                          <Box sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            bgcolor: i <= currentIdx ? '#e91e63' : '#fff',
                            border: '4px solid',
                            borderColor: i <= currentIdx ? '#e91e63' : '#ddd',
                            color: i <= currentIdx ? '#fff' : '#999',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24,
                            transition: 'all 0.4s',
                            boxShadow: i === currentIdx ? '0 0 20px rgba(233,30,99,0.6)' : 'none',
                          }}>
                            {i < currentIdx ? <CheckCircle /> : step.icon}
                          </Box>
                          <Typography sx={{ mt: 1, fontSize: '0.8rem', fontWeight: 600, color: i <= currentIdx ? '#e91e63' : '#999' }}>
                            {step.label}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="success.main" fontWeight={600}>
                      {currentIdx >= 4 ? 'Delivered! Enjoy your purchase!' : 'Estimated delivery: 2 hours'}
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Container>
    </Box>
  );
}