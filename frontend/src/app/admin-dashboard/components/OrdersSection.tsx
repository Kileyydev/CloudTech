// src/app/admin-dashboard/components/OrdersSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, Chip, Button } from '@mui/material';
import { LocalShipping, CheckCircle } from '@mui/icons-material';

export default function OrdersSection() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const loadOrders = () => {
      const saved = localStorage.getItem('adminOrders');
      if (saved) setOrders(JSON.parse(saved));
    };
    loadOrders();
    const interval = setInterval(loadOrders, 2000); // Auto-refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Live Orders</Typography>
      <Stack spacing={2}>
        {orders.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f9f9f9' }}>
            <Typography color="text.secondary">No orders yet.</Typography>
          </Paper>
        ) : (
          orders.map((order) => (
            <Paper key={order.id} sx={{ p: 3, borderRadius: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography fontWeight={600}>#{order.id}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.name} • {new Date(order.date).toLocaleTimeString()}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography fontWeight={700} color="#db1b88">
                    KES {order.total.toLocaleString()}
                  </Typography>
                  <Chip
                    label={order.status}
                    size="small"
                    icon={order.status === 'delivered' ? <CheckCircle /> : <LocalShipping />}
                    color={order.status === 'delivered' ? 'success' : 'warning'}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
            </Paper>
          ))
        )}
      </Stack>
    </Box>
  );
}