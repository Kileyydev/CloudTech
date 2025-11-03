// src/app/orders/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Stack, Chip, Button, Divider, Tabs, Tab } from '@mui/material';
import { useRouter } from 'next/navigation';
import TopNavBar from '../components/TopNavBar';
import MainNavBar from '../components/MainNavBar';
import TickerBar from '@/app/components/TickerBar';

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'warning' | 'success'> = {
  received: 'default',
  processing: 'primary',
  packing: 'secondary',
  dispatched: 'warning',
  delivered: 'success',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('orders');
    if (saved) {
      const parsed = JSON.parse(saved);
      setOrders(parsed.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  }, []);

  const activeOrders = orders.filter(o => o.status !== 'delivered');
  const pastOrders = orders.filter(o => o.status === 'delivered');

  const currentOrders = activeTab === 0 ? activeOrders : pastOrders;

  return (
    <Box sx={{ bgcolor: 'white', minHeight: '100vh' }}>
      <TickerBar />
      <TopNavBar />
      <MainNavBar />
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: '#db1b88' }}>
          My Orders
        </Typography>

        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            mb: 4,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              color: '#666',
            },
            '& .MuiTab-root.Mui-selected': {
              color: '#db1b88',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#db1b88',
            },
          }}
        >
          <Tab label={`Active (${activeOrders.length})`} />
          <Tab label={`Past (${pastOrders.length})`} />
        </Tabs>

        {currentOrders.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, bgcolor: 'white' }}>
            <Typography color="text.secondary" gutterBottom>
              {activeTab === 0 ? 'No active orders.' : 'No past orders yet.'}
            </Typography>
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
            {currentOrders.map((order) => (
              <Paper
                key={order.id}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                  transition: '0.3s',
                  '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.1)' },
                  bgcolor: 'white',
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
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
                      label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      size="small"
                      color={statusColors[order.status]}
                      sx={{ mt: 1, textTransform: 'capitalize' }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => router.push(`/orders/${order.id}`)}
                  sx={{ borderRadius: 2 }}
                >
                  View Details
                </Button>
              </Paper>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}