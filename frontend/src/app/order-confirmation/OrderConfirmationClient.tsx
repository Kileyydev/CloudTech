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
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { CheckCircle, Download } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useRouter, useSearchParams } from 'next/navigation';
import TopNavBar from '../components/TopNavBar';
import MainNavBar from '../components/MainNavBar';
import { useCart } from '../components/cartContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import TickerBar from '../components/TickerBar';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
}));

const GradientButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  fontWeight: 600,
  textTransform: 'none',
  background: 'linear-gradient(45deg, #db1b88, #b1166f)',
  color: 'white',
  '&:hover': { background: 'linear-gradient(45deg, #b1166f, #db1b88)' },
}));

export default function OrderConfirmationClient() {
  const { clearCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pdfRef = useRef<HTMLDivElement>(null);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const latestOrder = orders[0];

    if (!latestOrder) {
      router.push('/');
      return;
    }

    // ✅ Wait until searchParams are ready
    const name = searchParams.get('name');
    const phone = searchParams.get('phone');
    const address = searchParams.get('address');
    const city = searchParams.get('city');

    if (!name || !phone || !address || !city) return; // delay validation until available

    // Validate URL params against latest order
    if (
      latestOrder.name !== name ||
      latestOrder.phone !== phone ||
      latestOrder.address !== address ||
      latestOrder.city !== city
    ) {
      router.push('/');
      return;
    }

    setOrderData(latestOrder);

    // Clear cart safely once after load
    setTimeout(() => clearCart(), 300);
  }, [searchParams, clearCart, router]); // ✅ added dependencies

  const generatePDF = async () => {
    if (!pdfRef.current || !orderData) return;
    const canvas = await html2canvas(pdfRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`CloudTech_${orderData.id}.pdf`);
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
      <TickerBar />
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
                {/* Customer Details */}
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

                {/* Payment Details */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Payment Method
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {orderData.payment === 'cod' ? (
                      <>
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
                      <Typography>M-Pesa Paybill</Typography>
                    ) : (
                      <Typography>Withdraw Option</Typography>
                    )}
                  </Stack>
                </Box>

                <Divider />

                {/* Order Items */}
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

                {/* Totals */}
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

                {/* Buttons */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={2}>
                  <GradientButton fullWidth startIcon={<Download />} onClick={generatePDF}>
                    Download PDF Receipt
                  </GradientButton>
                  <Button fullWidth variant="outlined" onClick={() => router.push('/orders')}>
                    View All Orders
                  </Button>
                </Stack>
              </Stack>
            </StyledPaper>
          </Stack>
        </Container>
      </Box>

      {/* Hidden PDF Template */}
      <Box sx={{ position: 'absolute', left: '-9999px' }} ref={pdfRef}>
        {/* ... your PDF template remains unchanged ... */}
      </Box>
    </Box>
  );
}
