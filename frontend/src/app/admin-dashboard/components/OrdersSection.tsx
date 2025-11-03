'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  MenuItem,
  Select,
  CircularProgress,
} from '@mui/material';
import { CheckCircle, LocalShipping, AssignmentTurnedIn, HourglassEmpty } from '@mui/icons-material';
import axios from 'axios';
import TopNavBar from '@/app/components/TopNavBar';
import MainNavBar from '@/app/components/MainNavBar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cloudtech-c4ft.onrender.com/api/orders/';

const statusOptions = [
  { value: 'received', label: 'Order Received' },
  { value: 'processing', label: 'Processing' },
  { value: 'packing', label: 'Packing' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'delivered', label: 'Delivered' },
];

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'warning' | 'success'> = {
  received: 'default',
  processing: 'primary',
  packing: 'secondary',
  dispatched: 'warning',
  delivered: 'success',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  // 🧩 Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(API_URL);
        setOrders(res.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // 🧠 Update order status
  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      await axios.patch(`${API_URL}${selectedOrder.id}/`, { status: selectedStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: selectedStatus } : o))
      );
      setSelectedOrder({ ...selectedOrder, status: selectedStatus });
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress sx={{ color: '#db1b88' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
      <TopNavBar />
      <MainNavBar />
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#db1b88' }}>
          Admin Orders Dashboard
        </Typography>

        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedOrder(order);
                    setSelectedStatus(order.status);
                  }}
                >
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{order.name}</TableCell>
                  <TableCell>{order.phone}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleString()}</TableCell>
                  <TableCell>KES {order.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={statusColors[order.status] || 'default'}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        backgroundColor: '#db1b88',
                        '&:hover': { backgroundColor: '#b1166f' },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                        setSelectedStatus(order.status);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Order Detail Modal */}
        <Dialog
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, color: '#db1b88' }}>
            Order #{selectedOrder?.id}
          </DialogTitle>
          <DialogContent dividers>
            {selectedOrder && (
              <Stack spacing={2}>
                <Typography><strong>Customer:</strong> {selectedOrder.name}</Typography>
                <Typography><strong>Phone:</strong> {selectedOrder.phone}</Typography>
                <Typography><strong>Address:</strong> {selectedOrder.address}, {selectedOrder.city}</Typography>
                <Typography><strong>Payment:</strong> {selectedOrder.payment}</Typography>
                <Typography><strong>Total:</strong> KES {selectedOrder.total.toLocaleString()}</Typography>

                <Typography sx={{ mt: 2, fontWeight: 600 }}>Items:</Typography>
                {selectedOrder.items.map((item: any) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid #eee',
                      py: 0.5,
                    }}
                  >
                    <Typography sx={{ fontSize: 14 }}>{item.title} × {item.quantity}</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                      KES {(item.price * item.quantity).toLocaleString()}
                    </Typography>
                  </Box>
                ))}

                <Typography sx={{ mt: 3, fontWeight: 600 }}>Update Order Status:</Typography>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  fullWidth
                  sx={{ borderRadius: 2 }}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedOrder(null)}>Close</Button>
            <Button
              variant="contained"
              disabled={updating}
              sx={{
                background: '#db1b88',
                '&:hover': { background: '#b1166f' },
              }}
              onClick={handleStatusUpdate}
              startIcon={
                updating ? <HourglassEmpty fontSize="small" /> :
                selectedStatus === 'delivered' ? <CheckCircle /> :
                selectedStatus === 'dispatched' ? <LocalShipping /> :
                <AssignmentTurnedIn />
              }
            >
              {updating ? 'Updating...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
