'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Stepper,
  Step,
  StepLabel,
  Stack,
  Divider,
  Button,
  Chip,
  Skeleton,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TopNavBar from '../components/TopNavBar';
import MainNavBar from '../components/MainNavBar';
import TickerBar from '../components/TickerBar';
import { useRouter } from 'next/navigation';
import { getDeviceId } from '@/app/utils/device';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://cloudtech-c4ft.onrender.com/api';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
  borderRadius: 12,
}));

const GradientButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  fontWeight: 600,
  textTransform: 'none',
  background: 'linear-gradient(45deg, #db1b88, #b1166f)',
  color: 'white',
  '&:hover': { background: 'linear-gradient(45deg, #b1166f, #db1b88)' },
}));

const steps = ['Received', 'Processing', 'Packing', 'Dispatched', 'Delivered'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const deviceId = getDeviceId();
        if (!deviceId) {
          setError('No device ID found. Please place an order first.');
          setOrders([]);
          setLoading(false);
          return;
        }

        // Backend fetch
        let fetchedOrders: any[] = [];
        try {
          const res = await fetch(`${API_BASE}/orders/?device_id=${deviceId}`, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            fetchedOrders = Array.isArray(data) ? data : data.results || [];
          }
        } catch (err) {
          console.warn('Backend offline, using local orders');
        }

        // LocalStorage fallback
        const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        const userLocalOrders = localOrders.filter((o: any) => o.device_id === deviceId);

        // Merge & dedupe
        const allOrders = [...fetchedOrders];
        userLocalOrders.forEach((local: any) => {
          if (!allOrders.find(o => o.id === local.id)) {
            allOrders.push(local);
          }
        });

        // Sort newest first
        allOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setOrders(allOrders);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load orders. Try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 8 }}>
        <TickerBar />
        <TopNavBar />
        <MainNavBar />
        <Container maxWidth="md">
          <StyledPaper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h5" color="text.secondary" mb={3}>
              Loading your orders...
            </Typography>
            <Stack spacing={3}>
              {[1, 2, 3].map(i => (
                <Skeleton key={i} variant="rectangular" height={180} sx={{ borderRadius: 3 }} />
              ))}
            </Stack>
          </StyledPaper>
        </Container>
      </Box>
    );
  }

  if (error || orders.length === 0) {
    return (
      <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 8 }}>
        <TickerBar />
        <TopNavBar />
        <MainNavBar />
        <Container maxWidth="sm">
          <StyledPaper sx={{ p: 6, textAlign: 'center' }}>
            {error ? (
              <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>
            ) : (
              <Typography variant="h5" color="text.secondary" mb={2}>No orders yet</Typography>
            )}
            <GradientButton onClick={() => router.push('/')}>Start Shopping</GradientButton>
          </StyledPaper>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <TickerBar />
      <TopNavBar />
      <MainNavBar />
      <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 800, color: '#db1b88', textAlign: 'center' }}>
            My Orders
          </Typography>
          <Stack spacing={4}>
            {orders.map((order) => {
              const stepIndex = steps.indexOf(order.status || 'Received');
              const activeStep = stepIndex >= 0 ? stepIndex : 0;

              return (
                <StyledPaper key={order.id}>
                  <Stack spacing={3}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Order {order.id}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(order.date).toLocaleDateString()} at{' '}
                          {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                      <Chip
                        label={`KES ${Number(order.total ?? 0).toLocaleString()}`}
                        color="secondary"
                        size="medium"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>

                    <Divider />

                    {/* Delivery */}
                    <Box>
                      <Typography fontWeight={600} gutterBottom>Delivery</Typography>
                      <Typography variant="body2">{order.name} • {order.phone}</Typography>
                      <Typography variant="body2" color="text.secondary">{order.address}, {order.city}</Typography>
                    </Box>

                    <Divider />

                    {/* Status */}
                    <Box>
                      <Typography fontWeight={600} gutterBottom>Status</Typography>
                      <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((label) => (
                          <Step key={label}>
                            <StepLabel StepIconProps={{ sx: { color: activeStep >= steps.indexOf(label) ? '#db1b88' : '#ccc' } }}>
                              {label}
                            </StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                    </Box>

                    <Divider />

                    {/* Items */}
                    <Box>
                      <Typography fontWeight={600} gutterBottom>Items ({order.items.length})</Typography>
                      {order.items.slice(0, 2).map((item: any, i: number) => (
                        <Box key={item.lineItemId || i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                          <Typography variant="body2">{item.title} × {Number(item.quantity)}</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            KES {(Number(item.price ?? 0) * Number(item.quantity ?? 0)).toLocaleString()}
                          </Typography>
                        </Box>
                      ))}
                      {order.items.length > 2 && (
                        <Typography variant="caption" color="text.secondary">+ {order.items.length - 2} more...</Typography>
                      )}
                    </Box>

                    <GradientButton fullWidth onClick={() => router.push(`/orders/${order.id}`)}>View Full Receipt</GradientButton>
                  </Stack>
                </StyledPaper>
              );
            })}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
