// src/app/orders/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Stack, Chip, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import TopNavBar from '../components/TopNavBar';
import MainNavBar from '../components/MainNavBar';

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning'> = {
  received: 'default',
  processing: 'primary',
  packing: 'secondary',
  dispatched: 'warning',
  delivered: 'success',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('orders');
    if (saved) {
      setOrders(JSON.parse(saved));
    }
  }, []);

  return (
    <Box>
      <TopNavBar />
      <MainNavBar />
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: '#db1b88' }}>
          Your Orders
        </Typography>

        {orders.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No orders yet.</Typography>
            <Button
              variant="contained"
              sx={{ mt: 2, background: '#db1b88', '&:hover': { background: '#b1166f' } }}
              onClick={() => router.push('/')}
            >
              Start Shopping
            </Button>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {orders.map((order) => (
              <Paper
                key={order.id}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.1)' },
                }}
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight={600}>Order #{order.id}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(order.date).toLocaleDateString()} • {order.items.length} items
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography fontWeight={700} color="#db1b88">
                      KES {order.total.toLocaleString()}
                    </Typography>
                    <Chip
                      label={order.status}
                      size="small"
                      color={statusColors[order.status]}
                      sx={{ mt: 1, textTransform: 'capitalize' }}
                    />
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}