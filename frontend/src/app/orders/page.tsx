'use client';
import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Container, Stack, Divider, Chip, useTheme, useMediaQuery,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import TopNavBar from '../components/TopNavBar';
import MainNavBar from '../components/MainNavBar';
import TickerBar from '../components/TickerBar';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
  background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
}));

const StatusChip = styled(Chip)(({ theme, status }: { theme: any; status: string }) => {
  let color;
  switch (status) {
    case 'Order Received':
      color = 'info';
      break;
    case 'Order Processing':
      color = 'primary';
      break;
    case 'Order Packaging':
      color = 'warning';
      break;
    case 'Order Dispatched':
      color = 'secondary';
      break;
    case 'Order Delivered':
      color = 'success';
      break;
    default:
      color = 'default';
  }
  return {
    backgroundColor: theme.palette[color].main,
    color: 'white',
    fontWeight: 600,
  };
});

export default function OrdersPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(storedOrders);
  }, []);

  const stages = ['Order Received', 'Order Processing', 'Order Packaging', 'Order Dispatched', 'Order Delivered'];

  if (orders.length === 0) {
    return (
      <Box>
        <TickerBar />
        <TopNavBar />
        <MainNavBar />
        <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
          <Container maxWidth="md">
            <StyledPaper sx={{ textAlign: 'center', p: 6 }}>
              <Typography variant="h5" color="text.secondary">
                No orders found.
              </Typography>
              <Button
                variant="outlined"
                sx={{ mt: 3, borderRadius: 12, padding: theme.spacing(1.5, 4) }}
                onClick={() => router.push('/')}
              >
                Back to Shop
              </Button>
            </StyledPaper>
          </Container>
        </Box>
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
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#db1b88', mb: 4, textAlign: 'center' }}>
            My Orders
          </Typography>
          <Stack spacing={4}>
            {orders.map((order: any, index: number) => {
              const status = stages[index % stages.length]; // Simulate stage based on order position (newest first)
              return (
                <StyledPaper key={order.id}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Order ID: {order.id}
                      </Typography>
                      <StatusChip label={status} status={status} theme={undefined} />
                    </Box>
                    <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      Date: {new Date(order.date).toLocaleString()}
                    </Typography>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Items
                      </Typography>
                      {order.items.map((item: any) => (
                        <Box
                          key={item.id}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            py: 0.5,
                            borderBottom: index < order.items.length - 1 ? '1px dashed #ddd' : 'none',
                          }}
                        >
                          <Typography sx={{ fontSize: '0.875rem' }}>
                            {item.title} × {item.quantity}
                          </Typography>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                            KES {(item.price * item.quantity).toLocaleString()}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Divider />

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontSize: '0.875rem' }}>Subtotal:</Typography>
                        <Typography sx={{ fontSize: '0.875rem' }}>KES {order.subtotal.toLocaleString()}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontSize: '0.875rem' }}>Shipping:</Typography>
                        <Typography sx={{ fontSize: '0.875rem' }}>KES {order.shipping.toLocaleString()}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                        <Typography>Total:</Typography>
                        <Typography color="#db1b88">KES {order.total.toLocaleString()}</Typography>
                      </Box>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Delivery Details
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem' }}>
                        <strong>Name:</strong> {order.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem' }}>
                        <strong>Phone:</strong> {order.phone}
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem' }}>
                        <strong>Address:</strong> {order.address}, {order.city}
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem' }}>
                        <strong>Payment:</strong> {order.payment === 'cod' ? 'Cash on Delivery' : order.payment.toUpperCase()}
                        {order.change > 0 && ` (Change: KES ${order.change.toLocaleString()})`}
                      </Typography>
                    </Box>
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