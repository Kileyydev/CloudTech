// src/app/admin/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Box, Container, Paper, Typography, Table, TableHead, TableBody, TableCell,
  TableRow, TableContainer, Select, MenuItem, CircularProgress, Chip, Button, Stack
} from '@mui/material';
import axios from 'axios';
import TopNavBar from '../../components/TopNavBar';
import MainNavBar from '../../components/MainNavBar';
import TickerBar from '../../components/TickerBar';

const API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/api'
    : 'https://cloudtech-c4ft.onrender.com/api';

const STATUS_OPTIONS = [
  'Received',
  'Processing',
  'Packaging',
  'Dispatch',
  'Delivered'
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null); // order id being updated

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // auth token if needed
      const res = await axios.get(`${API_BASE}/purchases/`, {
        headers: token ? { Authorization: `Token ${token}` } : {},
      });
      setOrders(res.data.results || res.data); // handle pagination or plain array
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE}/purchases/${orderId}/`, { status: newStatus }, {
        headers: token ? { Authorization: `Token ${token}` } : {},
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <Box>
      

      <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <CircularProgress />
            </Box>
          ) : orders.length === 0 ? (
            <Typography>No orders found.</Typography>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Order ID</strong></TableCell>
                    <TableCell><strong>Customer</strong></TableCell>
                    <TableCell><strong>Phone</strong></TableCell>
                    <TableCell><strong>City</strong></TableCell>
                    <TableCell><strong>Total (KES)</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Items</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.name}</TableCell>
                      <TableCell>{order.phone}</TableCell>
                      <TableCell>{order.city}</TableCell>
                      <TableCell>{order.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status || 'Received'}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          size="small"
                          disabled={updating === order.id}
                        >
                          {STATUS_OPTIONS.map(status => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          {order.items.map((item: any) => (
                            <Chip
                              key={item.product_id || item.id}
                              label={`${item.title} × ${item.quantity}`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Box sx={{ mt: 3 }}>
            <Button variant="contained" sx={{ bgcolor: '#e91e63' }} onClick={fetchOrders}>
              Refresh Orders
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
