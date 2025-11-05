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

/* -------------------------------------------------------------------------- */
/*                               Styling Helpers                              */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/*                         Safe Number / Formatting Helpers                    */
/* -------------------------------------------------------------------------- */
const toNum = (val: any): number => {
  const n = parseFloat(String(val));
  return isNaN(n) ? 0 : n;
};

const formatPrice = (val: any): string => toNum(val).toLocaleString();

/* -------------------------------------------------------------------------- */
/*                                 Types                                      */
/* -------------------------------------------------------------------------- */
type OrderItem = {
  product_id: number;
  title: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  payment: 'paybill' | 'withdraw' | 'cod';
  mpesa_code?: string;
  cash_amount: number;
  change: number;
  subtotal: number;
  shipping: number;
  total: number;
  items: OrderItem[];
  date?: string;
};

/* -------------------------------------------------------------------------- */
/*                           Main Component                                   */
/* -------------------------------------------------------------------------- */
export default function OrderConfirmationClient() {
  const { clearCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const pdfRef = useRef<HTMLDivElement>(null);
  const [orderData, setOrderData] = useState<Order | null>(null);

  /* ---------------------------------------------------------------------- */
  /*  Load order from localStorage + validate URL params (run once)          */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    try {
      // 1. Grab latest order from localStorage
      const orders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
      const latestOrder = orders[0] ?? null;

      if (!latestOrder) {
        console.error('No orders found in localStorage.');
        router.replace('/');
        return;
      }

      // 2. Pull URL params
      const name = searchParams.get('name');
      const phone = searchParams.get('phone');
      const address = searchParams.get('address');
      const city = searchParams.get('city');

      // 3. Security check – URL must match stored order
      if (
        latestOrder.name !== name ||
        latestOrder.phone !== phone ||
        latestOrder.address !== address ||
        latestOrder.city !== city
      ) {
        console.error('URL parameters do not match the latest order:', {
          latestOrder,
          urlParams: { name, phone, address, city },
        });
        router.replace('/');
        return;
      }

      // 4. Sanitize numbers (in case backend sent strings)
      const sanitized: Order = {
        ...latestOrder,
        cash_amount: toNum(latestOrder.cash_amount),
        change: toNum(latestOrder.change),
        subtotal: toNum(latestOrder.subtotal),
        shipping: toNum(latestOrder.shipping),
        total: toNum(latestOrder.total),
        items: latestOrder.items.map((i) => ({
          ...i,
          price: toNum(i.price),
        })),
      };

      setOrderData(sanitized);

      // 5. Clear cart after a tiny delay (UI stays responsive)
      const timer = setTimeout(() => clearCart(), 300);
      return () => clearTimeout(timer);
    } catch (err) {
      console.error('Error parsing order from localStorage:', err);
      router.replace('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                              PDF Generation                              */
  /* ---------------------------------------------------------------------- */
  const generatePDF = async () => {
    if (!pdfRef.current || !orderData) return;

    try {
      const canvas = await html2canvas(pdfRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 190; // mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`CloudTech_${orderData.id}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                              Render – No Order                             */
  /* ---------------------------------------------------------------------- */
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

  /* ---------------------------------------------------------------------- */
  /*                              Main UI                                      */
  /* ---------------------------------------------------------------------- */
  return (
    <Box>
      <TickerBar />
      <TopNavBar />
      <MainNavBar />

      <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
        <Container maxWidth="md">
          <Stack spacing={4} alignItems="center">
            {/* Header */}
            <Box textAlign="center">
              <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#db1b88', mb: 1 }}>
                Order Confirmed!
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Order ID: <strong>{orderData.id}</strong>
              </Typography>
            </Box>

            {/* Details Card */}
            <StyledPaper sx={{ width: '100%' }}>
              <Stack spacing={3}>
                {/* Customer */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Customer Details
                  </Typography>
                  <Stack spacing={1}>
                    <Typography><strong>Name:</strong> {orderData.name}</Typography>
                    <Typography><strong>Phone:</strong> {orderData.phone}</Typography>
                    <Typography>
                      <strong>Delivery:</strong> {orderData.address}, {orderData.city}
                    </Typography>
                  </Stack>
                </Box>
                <Divider />

                {/* Payment */}
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
                            label={`Change: KES ${formatPrice(orderData.change)}`}
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

                {/* Items */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Order Items
                  </Typography>
                  {orderData.items.map((item) => (
                    <Box
                      key={item.product_id}
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
                        KES {formatPrice(item.price * item.quantity)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Divider />

                {/* Totals */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>KES {formatPrice(orderData.subtotal)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Shipping:</Typography>
                    <Typography>KES {formatPrice(orderData.shipping)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight={700}>
                      Total:
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="#db1b88">
                      KES {formatPrice(orderData.total)}
                    </Typography>
                  </Box>
                </Box>

                {/* Action Buttons */}
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
        <Box
          sx={{
            p: 8,
            bgcolor: '#fff',
            width: 600,
            fontFamily: 'Arial, Helvetica, sans-serif',
            color: '#000',
          }}
        >
          {/* Logo */}
          <Box textAlign="center" mb={3}>
            <img src="/logo.jpeg" alt="CloudTech" style={{ height: 70 }} />
          </Box>

          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700 }}>
            Official Receipt
          </Typography>

          <Typography align="center" sx={{ mb: 2 }}>
            Order ID: {orderData.id}
          </Typography>

          <Typography align="center" sx={{ fontSize: 12, mb: 3 }}>
            {new Date(orderData.date ?? Date.now()).toLocaleString()}
          </Typography>

          <Divider sx={{ my: 3, borderColor: '#000' }} />

          <Typography><strong>Customer:</strong> {orderData.name}</Typography>
          <Typography><strong>Phone:</strong> {orderData.phone}</Typography>
          <Typography>
            <strong>Delivery:</strong> {orderData.address}, {orderData.city}
          </Typography>
          <Typography>
            <strong>Payment:</strong>{' '}
            {orderData.payment === 'cod' ? 'Cash on Delivery' : orderData.payment.toUpperCase()}
          </Typography>
          {orderData.change > 0 && (
            <Typography>
              <strong>Change Due:</strong> KES {formatPrice(orderData.change)}
            </Typography>
          )}

          <Divider sx={{ my: 3, borderColor: '#000' }} />

          {orderData.items.map((item) => (
            <Box key={item.product_id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <span>
                {item.title} × {item.quantity}
              </span>
              <span>KES {formatPrice(item.price * item.quantity)}</span>
            </Box>
          ))}

          <Divider sx={{ my: 2, borderColor: '#000' }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>Subtotal:</span>
            <span>KES {formatPrice(orderData.subtotal)}</span>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>Shipping:</span>
            <span>KES {formatPrice(orderData.shipping)}</span>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 700,
              mt: 1,
              fontSize: '1.2rem',
            }}
          >
            <span>Total:</span>
            <span>KES {formatPrice(orderData.total)}</span>
          </Box>

          <Box textAlign="center" mt={5} sx={{ fontSize: 12 }}>
            <Typography>Thank you for shopping with</Typography>
            <Typography fontWeight={700}>CloudTech</Typography>
            <Typography>Kenya Cinema Building, Moi Avenue, Nairobi</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
