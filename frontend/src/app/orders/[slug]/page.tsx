// src/app/orders/[slug]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Stack,
  Divider,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { CheckCircle, Download, ArrowBack } from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import TopNavBar from '../../components/TopNavBar';
import MainNavBar from '../../components/MainNavBar';
import TickerBar from '../../components/TickerBar';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
  background: 'linear-gradient(145deg, #ffffff, #fdfbfe)',
  borderRadius: 16,
}));

const GradientButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.8, 5),
  fontWeight: 700,
  textTransform: 'none',
  background: 'linear-gradient(45deg, #db1b88, #b1166f)',
  color: 'white',
  '&:hover': { background: 'linear-gradient(45deg, #b1166f, #db1b88)' },
}));

export default function OrderSlugPage() {
  const { slug } = useParams();
  const router = useRouter();
  const pdfRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!slug) return;

      try {
        // 1. Try backend
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://cloudtech-c4ft.onrender.com/api'}/orders/${slug}/`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Backend order not found, checking local');
      }

      // 2. Fallback: localStorage
      const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const localOrder = allOrders.find((o: any) => o.id === slug);
      if (localOrder) {
        setOrder(localOrder);
      } else {
        setOrder(null);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [slug]);

  const generatePDF = async () => {
    if (!pdfRef.current || !order) return;
    const canvas = await html2canvas(pdfRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const width = 190;
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, 'PNG', 10, 10, width, height);
    pdf.save(`CloudTech_${order.id}.pdf`);
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 10 }}>
        <TickerBar />
        <TopNavBar />
        <MainNavBar />
        <Container maxWidth="md">
          <StyledPaper sx={{ textAlign: 'center', p: 8 }}>
            <CircularProgress size={60} thickness={5} />
            <Typography variant="h6" sx={{ mt: 3, color: '#db1b88' }}>
              Loading Order {slug}...
            </Typography>
          </StyledPaper>
        </Container>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 10 }}>
        <TickerBar />
        <TopNavBar />
        <MainNavBar />
        <Container maxWidth="sm">
          <StyledPaper sx={{ textAlign: 'center', p: 8 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              Order <strong>{slug}</strong> not found.
            </Alert>
            <GradientButton startIcon={<ArrowBack />} onClick={() => router.push('/orders')}>
              Back to My Orders
            </GradientButton>
          </StyledPaper>
        </Container>
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
          <Stack spacing={4} alignItems="center">
            <Box textAlign="center">
              <CheckCircle sx={{ fontSize: 90, color: '#db1b88', mb: 2 }} />
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#db1b88' }}>
                Order {order.id}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                {new Date(order.date).toLocaleString()}
              </Typography>
            </Box>

            <StyledPaper sx={{ width: '100%' }}>
              <Stack spacing={4}>
                {/* Customer */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#db1b88' }}>
                    Delivery Details
                  </Typography>
                  <Stack spacing={1}>
                    <Typography><strong>Name:</strong> {order.name}</Typography>
                    <Typography><strong>Phone:</strong> {order.phone}</Typography>
                    <Typography><strong>Address:</strong> {order.address}, {order.city}</Typography>
                  </Stack>
                </Box>

                <Divider />

                {/* Payment */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#db1b88' }}>
                    Payment
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Chip
                      label={order.payment === 'cod' ? 'Cash on Delivery' : order.payment.toUpperCase()}
                      color="primary"
                    />
                    {order.change > 0 && (
                      <Chip label={`Change: KES ${order.change.toLocaleString()}`} color="success" />
                    )}
                  </Stack>
                </Box>

                <Divider />

                {/* Items */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#db1b88' }}>
                    Items ({order.items.length})
                  </Typography>
                  {order.items.map((item: any) => (
                    <Box
                      key={item.lineItemId || item.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 1.5,
                        borderBottom: '1px dashed #eee',
                      }}
                    >
                      <Typography>
                        {item.title} × {item.quantity}
                      </Typography>
                      <Typography fontWeight={600}>
                        KES {(item.price * item.quantity).toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Divider />

                {/* Totals */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Subtotal</Typography>
                    <Typography>KES {order.subtotal.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Shipping</Typography>
                    <Typography>KES {order.shipping.toLocaleString()}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="h5" fontWeight={700}>Total</Typography>
                    <Typography variant="h5" fontWeight={700} color="#db1b88">
                      KES {order.total.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <GradientButton fullWidth startIcon={<Download />} onClick={generatePDF}>
                    Download PDF
                  </GradientButton>
                  <Button fullWidth variant="outlined" startIcon={<ArrowBack />} onClick={() => router.push('/orders')}>
                    All Orders
                  </Button>
                </Stack>
              </Stack>
            </StyledPaper>
          </Stack>
        </Container>
      </Box>

      {/* Hidden PDF */}
      <Box sx={{ position: 'absolute', left: '-9999px' }} ref={pdfRef}>
        <Box sx={{ p: 8, bgcolor: '#fff', width: 600, fontFamily: 'Arial', color: '#000' }}>
          <Box textAlign="center" mb={4}>
            <img src="/logo.jpeg" alt="CloudTech" style={{ height: 80 }} />
          </Box>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700 }}>
            Official Receipt
          </Typography>
          <Typography align="center" sx={{ mb: 3 }}>
            Order ID: {order.id}
          </Typography>
          <Typography align="center" sx={{ fontSize: 12, mb: 4 }}>
            {new Date(order.date).toLocaleString()}
          </Typography>

          <Divider sx={{ borderColor: '#000', mb: 3 }} />

          <Typography><strong>Customer:</strong> {order.name}</Typography>
          <Typography><strong>Phone:</strong> {order.phone}</Typography>
          <Typography><strong>Delivery:</strong> {order.address}, {order.city}</Typography>
          <Typography><strong>Payment:</strong> {order.payment.toUpperCase()}</Typography>

          <Divider sx={{ my: 3, borderColor: '#000' }} />

          {order.items.map((item: any) => (
            <Box key={item.lineItemId} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <span>{item.title} × {item.quantity}</span>
              <span>KES {(item.price * item.quantity).toLocaleString()}</span>
            </Box>
          ))}

          <Divider sx={{ my: 2, borderColor: '#000' }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>Total:</span>
            <span>KES {order.total.toLocaleString()}</span>
          </Box>

          <Box textAlign="center" mt={6} sx={{ fontSize: 12 }}>
            <Typography>Thank you for shopping with</Typography>
            <Typography fontWeight={700}>CloudTech</Typography>
            <Typography>Moi Avenue, Nairobi</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}