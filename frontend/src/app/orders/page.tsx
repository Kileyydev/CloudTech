// src/app/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Box, Container, Paper, Typography, Button, Stack, CircularProgress,
  Alert, Card, CardContent, Chip, useTheme, useMediaQuery
} from '@mui/material';
import { Print, CheckCircle, Inventory, AccessTime, LocalShipping, DoneAll } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import TopNavBar from '../components/TopNavBar';
import MainNavBar from '../components/MainNavBar';
import TickerBar from '../components/TickerBar';
import { useCart } from '../components/cartContext';
import axios from 'axios';

const API_BASE = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8000/api'
  : 'https://cloudtech-c4ft.onrender.com/api';

interface OrderItem {
  product_id: string;
  title: string;
  price: number;
  quantity: number;
}

interface OrderData {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  payment: string;
  cash_amount: number;
  change: number;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  date: string;
  items: OrderItem[];
}

const STATUS_STEPS = [
  { key: 'confirmed', label: 'Confirmed', icon: <CheckCircle />, color: '#e91e63' },
  { key: 'received', label: 'Received', icon: <Inventory />, color: '#ff9800' },
  { key: 'processing', label: 'Processing', icon: <AccessTime />, color: '#2196f3' },
  { key: 'packaging', label: 'Packaging', icon: <Inventory />, color: '#9c27b0' },
  { key: 'dispatched', label: 'Dispatched', icon: <LocalShipping />, color: '#4caf50' },
  { key: 'delivered', label: 'Delivered', icon: <DoneAll />, color: '#2e7d32' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // GET deviceId FROM CART CONTEXT
  const { deviceId } = useCart();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');

        const params: any = {};
        const headers: any = {};

        // GUEST: Use device_id
        if (deviceId && !token) {
          params.device_id = deviceId;
        }
        // LOGGED IN: Send token → Django filters by user
        if (token) {
          headers.Authorization = `Token ${token}`;
        }

        const res = await axios.get(`${API_BASE}/purchases/`, {
          params,
          headers,
        });

        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        setOrders(data);
      } catch (err: any) {
        console.error('Failed to load orders:', err);
        setError('Could not load orders. Try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [deviceId, token]);

  const handleViewOrder = (orderId: string) => {
    router.push(`/order-confirmation?orderId=${orderId}`);
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.print();
  };

  const getStatusStep = (status: string) => {
    return STATUS_STEPS.findIndex(s => s.key === status);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f9f9f9' }}>
      
        <Container sx={{ py: 6, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography sx={{ mt: 2 }}>Loading your orders...</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9f9f9' }}>
   
   

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: '#e91e63', textAlign: 'center' }}>
          My Orders
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {orders.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 0 }}>
            <Typography variant="h6" color="text.secondary">
              {deviceId || token ? 'No orders found' : 'Sign in or place an order'}
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2, bgcolor: '#e91e63', borderRadius: 0 }}
              onClick={() => router.push('/')}
            >
              Start Shopping
            </Button>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {orders.map((order) => {
              const currentStep = getStatusStep(order.status);
              const step = STATUS_STEPS[currentStep] || STATUS_STEPS[0];

              return (
                <Card
                  key={order.id}
                  sx={{
                    borderRadius: 0,
                    boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: '0.2s',
                    '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.15)' }
                  }}
                  onClick={() => handleViewOrder(order.id)}
                >
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      spacing={2}
                    >
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Order #{order.id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(order.date)}
                        </Typography>
                      </Box>

                      <Box textAlign={{ xs: 'left', sm: 'right' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#e91e63' }}>
                          KES {order.total.toLocaleString()}
                        </Typography>
                        <Chip
                          label={step.label}
                          icon={step.icon}
                          size="small"
                          sx={{
                            mt: 0.5,
                            bgcolor: `${step.color}20`,
                            color: step.color,
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    </Stack>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        {' • '}
                        {order.payment === 'cod' ? 'Cash on Delivery' : 'M-Pesa'}
                      </Typography>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      {STATUS_STEPS.map((s, i) => (
                        <Box key={i} sx={{ flex: 1, position: 'relative' }}>
                          {i > 0 && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: 0,
                                right: 0,
                                height: 4,
                                bgcolor: i <= currentStep ? s.color : '#eee',
                                transform: 'translateY(-50%)',
                                zIndex: 1
                              }}
                            />
                          )}
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: i <= currentStep ? s.color : '#eee',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1rem',
                              zIndex: 2,
                              mx: 'auto'
                            }}
                          >
                            {s.icon}
                          </Box>
                        </Box>
                      ))}
                    </Box>

                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                      <Button
                        size="small"
                        startIcon={<Print />}
                        onClick={handlePrint}
                        sx={{ color: '#666' }}
                      >
                        Print
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>
    </Box>
  );
}