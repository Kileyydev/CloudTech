// src/app/admin/orders/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Stack,
  Paper,
  Divider,
  useTheme,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  Inventory,
  AccessTime,
  LocalShipping,
  DoneAll,
  Refresh,
  Phone,
  LocationOn,
  CreditCard,
  ShoppingCart,
  TrendingUp,
  Visibility,               // <-- NEW
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';   // <-- NEW

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/api'
    : 'https://api.cloudtechstore.net/api');
const ORDERS_URL = `${API_BASE}/purchases/`;

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
  { key: 'confirmed', label: 'CONFIRMED', icon: <CheckCircle sx={{ fontSize: 18 }} />, color: '#e91e63', bg: '#fce4ec' },
  { key: 'received', label: 'RECEIVED', icon: <Inventory sx={{ fontSize: 18 }} />, color: '#ff9800', bg: '#fff3e0' },
  { key: 'processing', label: 'PROCESSING', icon: <AccessTime sx={{ fontSize: 18 }} />, color: '#2196f3', bg: '#e3f2fd' },
  { key: 'packaging', label: 'PACKAGING', icon: <Inventory sx={{ fontSize: 18 }} />, color: '#9c27b0', bg: '#f3e5f5' },
  { key: 'dispatched', label: 'DISPATCHED', icon: <LocalShipping sx={{ fontSize: 18 }} />, color: '#4caf50', bg: '#e8f5e9' },
  { key: 'delivered', label: 'DELIVERED', icon: <DoneAll sx={{ fontSize: 18 }} />, color: '#2e7d32', bg: '#e8f5e9' },
];

export default function AdminOrdersPage() {
  const theme = useTheme();
  const router = useRouter();                         // <-- NEW
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    msg: '',
    severity: 'success',
  });
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const fetchOrders = async (url: string = ORDERS_URL) => {
    if (!token) {
      setSnack({ open: true, msg: 'Please log in as admin', severity: 'error' });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText || 'Unknown error'}`);
      }
      const raw = await res.json();
      let list: OrderData[] = [];
      if (Array.isArray(raw)) list = raw;
      else if (raw.results && Array.isArray(raw.results)) list = raw.results;
      else if (raw.id) list = [raw];
      setOrders((prev) => (url.includes('page=') ? [...prev, ...list] : list));
      setNextUrl(raw.next || null);
    } catch (err: any) {
      setSnack({ open: true, msg: err.message || 'Failed to load orders', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setSavingId(id);
    try {
      const res = await fetch(`${API_BASE}/purchases/${id}/`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error('Update failed');
      }
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
      setSnack({ open: true, msg: 'Status updated', severity: 'success' });
    } catch (err: any) {
      setSnack({ open: true, msg: err.message || 'Update failed', severity: 'error' });
    } finally {
      setSavingId(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Nairobi',
    });

  const getStep = (status: string) =>
    STATUS_STEPS.find((s) => s.key === status) ?? STATUS_STEPS[0];

  // ---------- NEW: View order details ----------
  const handleViewOrder = (orderId: string) => {
    router.push(`/order-confirmation?orderId=${orderId}`);
  };
  // -------------------------------------------

  // Summary Stats
  const stats = {
    total: orders.length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    dispatched: orders.filter((o) => o.status === 'dispatched').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#fff0f8',
        color: '#000',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        margin: 0,
        padding: 0,
      }}
    >

      {/* Summary Stats */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #ddd' }}>
        <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={3}
            divider={<Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />}
          >
            {[
              { label: 'TOTAL ORDERS', value: stats.total, icon: <ShoppingCart />, color: '#000' },
              { label: 'CONFIRMED', value: stats.confirmed, icon: <CheckCircle />, color: '#e91e63' },
              { label: 'PROCESSING', value: stats.processing, icon: <AccessTime />, color: '#2196f3' },
              { label: 'DISPATCHED', value: stats.dispatched, icon: <LocalShipping />, color: '#4caf50' },
              { label: 'DELIVERED', value: stats.delivered, icon: <DoneAll />, color: '#2e7d32' },
            ].map((stat) => (
              <Box key={stat.label} sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: stat.color, lineHeight: 1 }}>
                  {stat.value}
                </Typography>
                <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                    {stat.label}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Orders Table */}
      <Box sx={{ bgcolor: '#fff' }}>
        <Box sx={{ overflowX: 'auto' }}>
          {loading && orders.length === 0 ? (
            <Box sx={{ py: 12, textAlign: 'center' }}>
              <CircularProgress size={56} sx={{ color: '#e91e63' }} />
              <Typography sx={{ mt: 3, fontWeight: 600, color: '#666', fontSize: '1.1rem' }}>
                Loading orders...
              </Typography>
            </Box>
          ) : orders.length === 0 ? (
            <Box sx={{ py: 12, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#999', fontWeight: 500 }}>
                No orders found.
              </Typography>
            </Box>
          ) : (
            <Table sx={{ minWidth: 1200 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#fff' }}>
                  <TableCell sx={{ color: '#000', fontWeight: 700, fontSize: '1.05rem', py: 2.5, pl: 4 }}>
                    ORDER ID
                  </TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 700, fontSize: '1.05rem', py: 2.5 }}>
                    CUSTOMER
                  </TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 700, fontSize: '1.05rem', py: 2.5 }}>
                    DATE
                  </TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 700, fontSize: '1.05rem', py: 2.5 }}>
                    TOTAL
                  </TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 700, fontSize: '1.05rem', py: 2.5 }}>
                    ITEMS
                  </TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 700, fontSize: '1.05rem', py: 2.5 }}>
                    PAYMENT
                  </TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 700, fontSize: '1.05rem', py: 2.5 }}>
                    STATUS
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#000', fontWeight: 700, fontSize: '1.05rem', py: 2.5, pr: 4 }}>
                    ACTIONS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order, index) => {
                  const step = getStep(order.status);
                  return (
                    <TableRow
                      key={order.id}
                      onClick={(e) => {
                        // ignore clicks inside the status Select
                        if ((e.target as HTMLElement).closest('select')) return;
                        handleViewOrder(order.id);
                      }}
                      sx={{
                        bgcolor: index % 2 === 0 ? '#fff' : '#f8f8f8',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#fdf2f8' },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, py: 3, pl: 4 }}>
                        #{order.id}
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography sx={{ fontWeight: 700, color: '#000' }}>
                          {order.name}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5, fontSize: '0.9rem', color: '#666' }}>
                          <Phone fontSize="small" />
                          <Typography>{order.phone}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ fontSize: '0.9rem', color: '#666' }}>
                          <LocationOn fontSize="small" />
                          <Typography>{order.city}, {order.address}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ py: 3, color: '#444' }}>
                        {formatDate(order.date)}
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography sx={{ fontWeight: 700, color: '#e91e63', fontSize: '1.1rem' }}>
                          KSh {order.total.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Chip
                          label={`${order.items.length} item${order.items.length > 1 ? 's' : ''}`}
                          size="small"
                          sx={{ bgcolor: '#fff0f8', color: '#d81b60', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CreditCard sx={{ color: '#666', fontSize: 18 }} />
                          <Typography sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                            {order.payment}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* STATUS SELECT */}
                      <TableCell sx={{ py: 3 }}>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={order.status}
                            onChange={(e) => updateStatus(order.id, e.target.value as string)}
                            disabled={savingId === order.id}
                            onClick={(e) => e.stopPropagation()}   // prevent row navigation
                            sx={{
                              bgcolor: step.bg,
                              color: step.color,
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              '& .MuiSelect-select': {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              },
                            }}
                            startAdornment={step.icon}
                          >
                            {STATUS_STEPS.map((s) => (
                              <MenuItem key={s.key} value={s.key} sx={{ fontWeight: 600 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {s.icon}
                                  {s.label}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>

                      {/* ACTIONS (View button) */}
                      <TableCell align="center" sx={{ py: 3, pr: 4 }}>
                        <Tooltip title="View order confirmation">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewOrder(order.id);
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Box>

        {/* Load More */}
        {nextUrl && (
          <Box sx={{ textAlign: 'center', py: 3, bgcolor: '#fff', borderTop: '1px solid #ddd' }}>
            <Button
              variant="outlined"
              onClick={() => fetchOrders(nextUrl)}
              disabled={loading}
              sx={{
                borderColor: '#000',
                color: '#000',
                px: 5,
                py: 1.5,
                fontWeight: 700,
                textTransform: 'none',
                '&:disabled': { borderColor: '#ccc', color: '#999' },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#e91e63' }} /> : 'LOAD MORE ORDERS'}
            </Button>
          </Box>
        )}
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
          sx={{ width: '100%' }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}