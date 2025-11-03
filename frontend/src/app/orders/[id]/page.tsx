// src/app/order-confirmation/OrderConfirmationClient.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Container,
  Stack,
  Divider,
  Alert,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CheckCircle,
  Download,
  LocalShipping,
  CreditCard,
  AttachMoney,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useRouter, useSearchParams } from 'next/navigation';
import TopNavBar from '../../components/TopNavBar';
import MainNavBar from '../../components/MainNavBar';
import { useCart } from '../../components/cartContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
}));

const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 4),
  fontWeight: 600,
  textTransform: 'none',
  background: 'linear-gradient(45deg, #db1b88, #b1166f)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(45deg, #b1166f, #db1b88)',
  },
}));

export default function OrderConfirmationClient() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pdfRef = useRef<HTMLDivElement>(null);

  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lastOrder');
    let data;

    if (saved) {
      data = JSON.parse(saved);
      setOrderData(data);
      localStorage.removeItem('lastOrder');
    } else {
      const name = searchParams.get('name') || 'Customer';
      const phone = searchParams.get('phone') || '';
      const address = searchParams.get('address') || '';
      const city = searchParams.get('city') || '';
      const payment = searchParams.get('payment') || 'M-Pesa';
      const cashAmount = searchParams.get('cash') || '';
      const change = searchParams.get('change') || '';

      data = {
        id: `CT${Date.now().toString().slice(-8)}`,
        name,
        phone,
        address,
        city,
        payment,
        cashAmount: cashAmount ? parseFloat(cashAmount) : 0,
        change: change ? parseFloat(change) : 0,
        items: Object.values(cart),
        subtotal: Object.values(cart).reduce((s: any, i: any) => s + i.price * i.quantity, 0),
        shipping: Object.values(cart).length > 0 ? 200 : 0,
        total:
          Object.values(cart).reduce((s: any, i: any) => s + i.price * i.quantity, 0) +
          (Object.values(cart).length > 0 ? 200 : 0),
        status: 'received',
        date: new Date().toISOString(),
      };

      setOrderData(data);
    }

    // ✅ Save persistently to localStorage (so it appears in /orders)
    if (data) {
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = [data, ...existingOrders];
      localStorage.setItem('orders', JSON.stringify(updatedOrders));

      // ✅ Optionally also sync to backend API
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cloudtech-c4ft.onrender.com/api'}/orders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch((err) => console.error('Order sync failed:', err));
    }

    clearCart();
  }, [cart, searchParams, clearCart]);

  const generatePDF = async () => {
    if (!pdfRef.current) return;
    const canvas = await html2canvas(pdfRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`CloudTech_Order_${orderData?.id}.pdf`);
  };

  if (!orderData) {
    return (
      <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 8 }}>
        <Container maxWidth="sm">
          <StyledPaper sx={{ textAlign: 'center', p: 6 }}>
            <Typography variant="h5" color="text.secondary">
              No order details found.
            </Typography>
            <GradientButton sx={{ mt: 3 }} onClick={() => router.push('/')}>
              Back to Shop
            </GradientButton>
          </StyledPaper>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <TopNavBar />
      <MainNavBar />

      <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
        <Container maxWidth="md">
          <Stack spacing={4} alignItems="center">
            <Box textAlign="center">
              <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#db1b88', mb: 1 }}>
                Order Confirmed!
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Order ID: <strong>{orderData.id}</strong>
              </Typography>
            </Box>

            <StyledPaper sx={{ width: '100%' }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Customer Details
                  </Typography>
                  <Stack spacing={1}>
                    <Typography><strong>Name:</strong> {orderData.name}</Typography>
                    <Typography><strong>Phone:</strong> {orderData.phone}</Typography>
                    <Typography><strong>Delivery:</strong> {orderData.address}, {orderData.city}</Typography>
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Payment Method
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {orderData.payment === 'cod' ? (
                      <>
                        <AttachMoney color="success" />
                        <Typography>Cash on Delivery</Typography>
                        {orderData.change > 0 && (
                          <Chip
                            label={`Change: KES ${orderData.change.toLocaleString()}`}
                            color="success"
                            size="small"
                          />
                        )}
                      </>
                    ) : orderData.payment === 'paybill' ? (
                      <>
                        <CreditCard color="primary" />
                        <Typography>M-Pesa Paybill</Typography>
                      </>
                    ) : (
                      <>
                        <LocalShipping color="info" />
                        <Typography>Withdraw Option</Typography>
                      </>
                    )}
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Order Items
                  </Typography>
                  {orderData.items.map((item: any) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 1,
                        borderBottom: '1px dashed #ddd',
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

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>KES {orderData.subtotal.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Shipping:</Typography>
                    <Typography>KES {orderData.shipping.toLocaleString()}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight={700}>
                      Total:
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="#db1b88">
                      KES {orderData.total.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={2}>
                  <GradientButton fullWidth startIcon={<Download />} onClick={generatePDF}>
                    Download PDF Receipt
                  </GradientButton>
                  <Button fullWidth variant="outlined" onClick={() => router.push('/')}>
                    Continue Shopping
                  </Button>
                </Stack>

                <Alert severity="info" sx={{ mt: 2 }}>
                  You will receive an SMS confirmation shortly. Physical receipt will be provided on delivery.
                </Alert>
              </Stack>
            </StyledPaper>
          </Stack>
        </Container>
      </Box>

      {/* Hidden PDF for Receipt Export */}
      <Box sx={{ position: 'absolute', left: '-9999px' }} ref={pdfRef}>
        <Box sx={{ p: 6, bgcolor: 'white', width: 600, fontFamily: 'Arial, sans-serif' }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ color: '#db1b88' }}>
            CloudTech Order Receipt
          </Typography>
          <Typography align="center" color="text.secondary" gutterBottom>
            Order ID: {orderData.id}
          </Typography>
          <Divider sx={{ my: 3 }} />

          <Typography><strong>Customer:</strong> {orderData.name}</Typography>
          <Typography><strong>Phone:</strong> {orderData.phone}</Typography>
          <Typography><strong>Delivery:</strong> {orderData.address}, {orderData.city}</Typography>
          <Typography><strong>Payment Method:</strong> {orderData.payment}</Typography>

          <Divider sx={{ my: 3 }} />

          {orderData.items.map((item: any) => (
            <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <span>{item.title} × {item.quantity}</span>
              <span>KES {(item.price * item.quantity).toLocaleString()}</span>
            </Box>
          ))}

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>Total:</span>
            <span>KES {orderData.total.toLocaleString()}</span>
          </Box>

          <Typography align="center" sx={{ mt: 4, fontSize: 12, color: 'gray' }}>
            Thank you for shopping with CloudTech!
            <br />
            Kenya Cinema Building, Moi Avenue, Nairobi
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
