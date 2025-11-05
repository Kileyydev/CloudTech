// src/app/order-confirmation/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Box, Container, Paper, Typography, Button, Divider, Stack,
  useTheme, useMediaQuery, IconButton
} from '@mui/material';
import { Print, CheckCircle, Inventory, AccessTime, LocalShipping, DoneAll } from '@mui/icons-material';
import TopNavBar from '../components/TopNavBar';
import MainNavBar from '../components/MainNavBar';
import TickerBar from '../components/TickerBar';
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
  payment: string;  // 'cod', 'paybill', 'withdraw'
  mpesa_code: string;
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
  { key: 'confirmed', label: 'Confirmed', icon: <CheckCircle /> },
  { key: 'received', label: 'Received', icon: <Inventory /> },
  { key: 'processing', label: 'Processing', icon: <AccessTime /> },
  { key: 'packaging', label: 'Packaging', icon: <Inventory /> },
  { key: 'dispatched', label: 'Dispatched', icon: <LocalShipping /> },
  { key: 'delivered', label: 'Delivered', icon: <DoneAll /> },
];

export default function OrderConfirmation() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isTemp, setIsTemp] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const temp = searchParams.get('temp');
    const orderId = searchParams.get('orderId');
    const pending = localStorage.getItem('pending_order');

    if (temp && pending) {
      // INSTANT DISPLAY FROM LOCAL STORAGE
      try {
        const data = JSON.parse(pending);
        setOrder(data);
        setIsTemp(true);
        localStorage.removeItem('pending_order'); // clear after use
      } catch (e) {
        console.error('Failed to parse pending order');
      }
    } else if (orderId) {
      // FETCH REAL ORDER FROM DJANGO
      axios.get(`${API_BASE}/purchases/order/${orderId}/`, {
        headers: {
          ...(localStorage.getItem('token') ? { Authorization: `Token ${localStorage.getItem('token')}` } : {}),
        },
      })
        .then(res => {
          setOrder(res.data);
          setIsTemp(false);
          localStorage.removeItem('pending_order'); // cleanup
        })
        .catch(err => {
          console.error('Failed to fetch order:', err);
          // Fallback to pending if exists
          if (pending) {
            try {
              const data = JSON.parse(pending);
              if (data.id.startsWith('TEMP')) {
                setOrder(data);
                setIsTemp(true);
              }
            } catch (e) {
              console.error('Fallback failed');
            }
          }
        });
    }
  }, [searchParams]);

  const handlePrint = () => window.print();

  if (!order) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f9f9f9' }}>
        <TickerBar /><TopNavBar /><MainNavBar />
        <Container sx={{ py: 6, textAlign: 'center' }}>
          <Typography color="error">Order not found.</Typography>
        </Container>
      </Box>
    );
  }

  const currentStep = STATUS_STEPS.findIndex(s => s.key === order.status);
  const progress = ((currentStep + 1) / STATUS_STEPS.length) * 100;

  const paymentLabel = order.payment === 'cod'
    ? 'Cash on Delivery'
    : order.payment === 'paybill'
    ? 'M-Pesa Paybill'
    : 'Agent Withdraw';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9f9f9' }}>
      <TickerBar />
      <TopNavBar />
      <MainNavBar />

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #printable, #printable * { visibility: visible; }
          #printable { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .progress-line { display: none; }
        }
      `}</style>

      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        <Paper id="printable" sx={{ p: { xs: 3, md: 5 }, borderRadius: 0, boxShadow: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#e91e63' }}>
              Order Confirmed!
            </Typography>
            <Typography variant="h6" sx={{ mt: 1 }}>
              Order ID: <strong>{order.id}</strong>
              {isTemp && (
                <Typography component="span" color="warning.main" sx={{ ml: 1 }}>
                  (Saving...)
                </Typography>
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(order.date).toLocaleString()}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Print />}
            onClick={handlePrint}
            className="no-print"
            sx={{ mb: 3, bgcolor: '#e91e63', borderRadius: 0 }}
          >
            Print Receipt
          </Button>

          <Divider sx={{ my: 3 }} />

          {/* Progress Bar */}
          <Box sx={{ mb: 5 }} className="no-print">
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Order Progress</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              {STATUS_STEPS.map((step, i) => (
                <Box key={i} sx={{ textAlign: 'center', flex: 1 }}>
                  <Box
                    sx={{
                      width: 40, height: 40, borderRadius: '50%', mx: 'auto',
                      bgcolor: i <= currentStep ? '#e91e63' : '#eee',
                      color: i <= currentStep ? 'white' : '#999',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem', zIndex: 2
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block', fontSize: '0.75rem' }}>
                    {step.label}
                  </Typography>
                  {i < STATUS_STEPS.length - 1 && (
                    <Box
                      className="progress-line"
                      sx={{
                        position: 'absolute', top: 20, left: '50%', width: '100%', height: 4,
                        bgcolor: '#eee', zIndex: 1, transform: 'translateX(-50%)'
                      }}
                    >
                      <Box
                        sx={{
                          width: i < currentStep ? '100%' : '0%',
                          height: '100%', bgcolor: '#e91e63', transition: 'width 0.5s'
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} mb={4}>
            <Box flex={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Delivery To</Typography>
              <Typography>{order.name}</Typography>
              <Typography>{order.phone}</Typography>
              <Typography>{order.address}, {order.city}</Typography>
            </Box>
            <Box flex={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Payment</Typography>
              <Typography>{paymentLabel}</Typography>
              {order.cash_amount > 0 && (
                <>
                  <Typography>Cash: KES {order.cash_amount.toLocaleString()}</Typography>
                  <Typography color="success.main">Change: KES {order.change.toLocaleString()}</Typography>
                </>
              )}
              {order.mpesa_code && (
                <Typography>M-Pesa Code: {order.mpesa_code}</Typography>
              )}
            </Box>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Items</Typography>
          {order.items.map((item, i) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
              <Typography>{item.title} × {item.quantity}</Typography>
              <Typography>KES {(item.price * item.quantity).toLocaleString()}</Typography>
            </Box>
          ))}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'right' }}>
            <Typography>Subtotal: KES {order.subtotal.toLocaleString()}</Typography>
            <Typography>Shipping: KES {order.shipping.toLocaleString()}</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#e91e63' }}>
              Total: KES {order.total.toLocaleString()}
            </Typography>
          </Box>

          <Box className="no-print" sx={{ mt: 5, textAlign: 'center' }}>
            <Button variant="outlined" href="/orders" sx={{ borderRadius: 0, mr: 1 }}>
              View Orders
            </Button>
            <Button variant="contained" href="/" sx={{ borderRadius: 0, bgcolor: '#e91e63' }}>
              Continue Shopping
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}