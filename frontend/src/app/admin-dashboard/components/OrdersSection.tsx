// src/app/admin/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Inventory,
  AccessTime,
  LocalShipping,
  DoneAll,
  CheckCircle,
} from '@mui/icons-material';
import axios from 'axios';
import TickerBar from '../../components/TickerBar';
import TopNavBar from '../../components/TopNavBar';
import MainNavBar from '../../components/MainNavBar';

const API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/api'
    : 'https://api.cloudtechstore.net/api';

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
  subtotal: number;
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextUrl, setNextUrl] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // --------------------------------------------------------------
  // 1. FETCH (ALL) ORDERS – admin token only, no device_id filter
  // --------------------------------------------------------------
  const fetchOrders = async (url: string = `${API_BASE}/purchases/`) => {
    if (!token) {
      setError('Admin token missing – please log in.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const headers = { Authorization: `Token ${token}` };

      const res = await axios.get(url, { headers });

      const raw = res.data;
      const newOrders: OrderData[] = Array.isArray(raw)
        ? raw
        : raw.results || [];

      // Append if paginating, otherwise replace
      setOrders((prev) => (url.includes('page=') ? [...prev, ...newOrders] : newOrders));

      // Pagination handling
      setNextUrl(raw.next || null);
      setHasMore(!!raw.next);
    } catch (err: any) {
      console.error('Failed to fetch admin orders:', err);
      setError(
        err.response?.data?.detail ||
          'Failed to load orders. Check your connection or token.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, []);

  // Load more (if API uses pagination)
  const loadMore = () => {
    if (nextUrl && !loading) fetchOrders(nextUrl);
  };

  // --------------------------------------------------------------
  // 2. UPDATE STATUS – PATCH /purchases/:id/
  // --------------------------------------------------------------
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!token) return;

    try {
      setUpdating(orderId);
      const headers = { Authorization: `Token ${token}` };

      await axios.patch(
        `${API_BASE}/purchases/${orderId}/`,
        { status: newStatus },
        { headers }
      );

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error('Status update error:', err);
      alert('Could not update status. Try again.');
    } finally {
      setUpdating(null);
    }
  };

  // --------------------------------------------------------------
  // 3. Helpers
  // --------------------------------------------------------------
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getStep = (status: string) =>
    STATUS_STEPS.find((s) => s.key === status) ?? STATUS_STEPS[0];

  // --------------------------------------------------------------
  // 4. UI
  // --------------------------------------------------------------
  if (loading && orders.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', textAlign: 'center', pt: 10 }}>
        <CircularProgress size={60} />
        <Typography sx={{ mt: 2 }}>Loading all orders…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9f9f9' }}>
      <TickerBar />
      <TopNavBar />
      <MainNavBar />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: '#e91e63' }}>
          Admin Dashboard — Orders Management
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {orders.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography>No orders found in the database.</Typography>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {orders.map((order) => {
              const step = getStep(order.status);

              return (
                <Card
                  key={order.id}
                  sx={{
                    borderRadius: 2,
                    boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                    transition: '0.2s',
                    '&:hover': { boxShadow: '0 6px 18px rgba(0,0,0,0.15)' },
                  }}
                >
                  <CardContent>
                    {/* Header – ID, date, customer */}
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', md: 'center' }}
                      spacing={2}
                    >
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Order #{order.id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(order.date)}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>{order.name}</strong> — {order.phone}
                          <br />
                          {order.city}, {order.address}
                        </Typography>
                      </Box>

                      <Box textAlign={{ xs: 'left', md: 'right' }}>
                        <Typography variant="h6" sx={{ color: '#e91e63', fontWeight: 700 }}>
                          KES {order.total.toLocaleString()}
                        </Typography>
                        <Chip
                          label={step.label}
                          icon={step.icon}
                          sx={{
                            bgcolor: `${step.color}20`,
                            color: step.color,
                            fontWeight: 600,
                            mt: 1,
                          }}
                        />
                      </Box>
                    </Stack>

                    {/* Items + payment */}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {order.items.length} item{order.items.length > 1 ? 's' : ''} •{' '}
                      Payment: {order.payment.toUpperCase()}
                    </Typography>

                    {/* Status dropdown */}
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel>Update Order Status</InputLabel>
                      <Select
                        value={order.status}
                        label="Update Order Status"
                        onChange={(e) => handleStatusChange(order.id, e.target.value as string)}
                        disabled={updating === order.id}
                      >
                        {STATUS_STEPS.map((s) => (
                          <MenuItem key={s.key} value={s.key}>
                            {s.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Refresh button (per card) */}
                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => fetchOrders()}
                      >
                        Refresh
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}

            {/* Load-more if paginated */}
            {hasMore && (
              <Box textAlign="center" mt={2}>
                <Button
                  variant="contained"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : 'Load More'}
                </Button>
              </Box>
            )}
          </Stack>
        )}
      </Container>
    </Box>
  );
}