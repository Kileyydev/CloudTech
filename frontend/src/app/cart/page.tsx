// src/app/cart/page.tsx
'use client';

import { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Button,
  Divider,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Collapse,
  Alert,
  CircularProgress,
  Snackbar,
  Card,
  CardMedia,
  CardContent,
  Container,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  LocalShipping,
  CreditCard,
  AttachMoney,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import TopNavBar from '../components/TopNavBar';
import MainNavBar from '../components/MainNavBar';
import { useCart } from '../components/cartContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type CartItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
  stock: number;
  image?: string;
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
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

const trendingProducts = [
  { id: 1, title: 'iPhone 15 Pro', price: 140000, image: '/images/iphone15.jpg' },
  { id: 2, title: 'AirPods Pro 2', price: 35000, image: '/images/airpods.jpg' },
  { id: 3, title: 'MacBook Air M2', price: 180000, image: '/images/macbook.jpg' },
  { id: 4, title: 'Samsung S24', price: 120000, image: '/images/s24.jpg' },
];

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pdfRef = useRef<HTMLDivElement>(null);

  const [checkoutDetails, setCheckoutDetails] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    mpesaCode: '',
    cashAmount: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'paybill' | 'withdraw' | 'cod' | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const subtotal = Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 200 : 0;
  const total = subtotal + shipping;
  const cashPaid = parseFloat(checkoutDetails.cashAmount) || 0;
  const change = paymentMethod === 'cod' && cashPaid > total ? cashPaid - total : 0;

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const handleChange = (field: string, value: string) => {
    setCheckoutDetails((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleQuantityChange = (id: number, delta: number) => {
    const item = cart[id];
    if (!item) return;
    if (delta > 0 && item.quantity >= item.stock) {
      showSnackbar(`Only ${item.stock} in stock`, 'error');
      return;
    }
    updateQuantity(id, delta);
  };

  const handleDelete = (id: number) => {
    removeFromCart(id);
    showSnackbar('Item removed');
  };

  const validateForm = () => {
    if (!checkoutDetails.name || !checkoutDetails.phone || !checkoutDetails.address || !checkoutDetails.city) {
      setError('Please fill in all required fields.');
      return false;
    }
    if (!paymentMethod) {
      setError('Please select a payment method.');
      return false;
    }
    if (paymentMethod === 'withdraw' && !checkoutDetails.mpesaCode) {
      setError('Please enter your M-Pesa confirmation code.');
      return false;
    }
    if (paymentMethod === 'cod' && cashPaid < total) {
      setError(`Please enter at least KES ${total.toLocaleString()} in cash.`);
      return false;
    }
    return true;
  };

  const generatePDF = async (orderId: string) => {
    if (!pdfRef.current) return;
    const canvas = await html2canvas(pdfRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`CloudTech_${orderId}.pdf`);
  };

  const handleCheckout = async () => {
    if (Object.values(cart).length === 0) {
      showSnackbar('Your cart is empty.', 'error');
      return;
    }
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // Generate Order ID
      const orderId = `CT${Date.now().toString().slice(-8)}`;

      // Prepare Order
      const order = {
        id: orderId,
        date: new Date().toISOString(),
        name: checkoutDetails.name,
        phone: checkoutDetails.phone,
        email: checkoutDetails.email,
        address: checkoutDetails.address,
        city: checkoutDetails.city,
        postalCode: checkoutDetails.postalCode,
        payment: paymentMethod,
        mpesaCode: checkoutDetails.mpesaCode,
        cashAmount: cashPaid,
        change: change,
        items: Object.values(cart),
        subtotal,
        shipping,
        total,
        status: 'received' as const,
      };

      // Save to localStorage
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      localStorage.setItem('orders', JSON.stringify([order, ...existingOrders]));

      // Clear cart
      clearCart();

      // Generate PDF
      await generatePDF(orderId);

      // Redirect with query params
      const params = new URLSearchParams({
        name: order.name,
        phone: order.phone,
        address: order.address,
        city: order.city,
        payment: order.payment,
        cash: order.cashAmount.toString(),
        change: order.change.toString(),
      });

      showSnackbar('Order placed successfully!', 'success');
      router.push(`/order-confirmation?${params.toString()}`);
    } catch (err) {
      showSnackbar('Order failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box>
      <TopNavBar />
      <MainNavBar />

      <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: { xs: 3, md: 6 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            sx={{ mb: 4, fontWeight: 800, color: '#db1b88' }}
          >
            Your Shopping Cart
          </Typography>

          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4} alignItems="flex-start">
            {/* CART TABLE */}
            <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 65%' } }}>
              {Object.values(cart).length === 0 ? (
                <StyledPaper sx={{ textAlign: 'center', p: 6 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Your cart is empty
                  </Typography>
                  <GradientButton onClick={() => router.push('/')}>
                    Continue Shopping
                  </GradientButton>
                </StyledPaper>
              ) : (
                <StyledPaper>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Product</strong></TableCell>
                          <TableCell align="center"><strong>Qty</strong></TableCell>
                          <TableCell align="right"><strong>Price</strong></TableCell>
                          <TableCell align="right"><strong>Total</strong></TableCell>
                          <TableCell align="center"><strong>Action</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.values(cart).map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell>{item.title}</TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <IconButton size="small" onClick={() => handleQuantityChange(item.id, -1)}>
                                  <Remove />
                                </IconButton>
                                <Typography sx={{ minWidth: 32, textAlign: 'center', fontWeight: 600 }}>
                                  {item.quantity}
                                </Typography>
                                <IconButton size="small" onClick={() => handleQuantityChange(item.id, 1)}>
                                  <Add />
                                </IconButton>
                              </Box>
                            </TableCell>
                            <TableCell align="right">KES {item.price.toLocaleString()}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              KES {(item.price * item.quantity).toLocaleString()}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton color="error" onClick={() => handleDelete(item.id)}>
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Subtotal:</Typography>
                      <Typography>KES {subtotal.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Shipping:</Typography>
                      <Typography>KES {shipping.toLocaleString()}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6" color="#db1b88">
                        KES {total.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </StyledPaper>
              )}
            </Box>

            {/* CHECKOUT */}
            <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 35%' } }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#db1b88' }}>
                Checkout Details
              </Typography>

              <StyledPaper>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField label="Full Name *" size="small" value={checkoutDetails.name} onChange={(e) => handleChange('name', e.target.value)} />
                  <TextField label="Phone *" size="small" type="tel" value={checkoutDetails.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                  <TextField label="Email" size="small" value={checkoutDetails.email} onChange={(e) => handleChange('email', e.target.value)} />
                  <TextField label="Address *" size="small" value={checkoutDetails.address} onChange={(e) => handleChange('address', e.target.value)} />
                  <TextField label="City *" size="small" value={checkoutDetails.city} onChange={(e) => handleChange('city', e.target.value)} />
                  <TextField label="Postal Code" size="small" value={checkoutDetails.postalCode} onChange={(e) => handleChange('postalCode', e.target.value)} />

                  <FormControl sx={{ mt: 2 }}>
                    <FormLabel sx={{ fontWeight: 600 }}>Payment Method</FormLabel>
                    <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)}>
                      <FormControlLabel value="paybill" control={<Radio />} label="M-Pesa Paybill" />
                      <FormControlLabel value="withdraw" control={<Radio />} label="Withdraw Option" />
                      <FormControlLabel value="cod" control={<Radio />} label="Pay After Delivery (Cash)" />
                    </RadioGroup>
                  </FormControl>

                  <Collapse in={paymentMethod === 'cod'}>
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e8', borderRadius: 2, border: '1px solid #4caf50' }}>
                      <Typography fontWeight={600} gutterBottom>
                        <AttachMoney sx={{ verticalAlign: 'middle', mr: 0.5 }} /> Cash on Delivery
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        label="Cash Amount (KES)"
                        type="number"
                        value={checkoutDetails.cashAmount}
                        onChange={(e) => handleChange('cashAmount', e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">KES</InputAdornment>,
                        }}
                      />
                      {change > 0 && (
                        <Alert severity="success" sx={{ mt: 1 }}>
                          Change: <strong>KES {change.toLocaleString()}</strong>
                        </Alert>
                      )}
                    </Box>
                  </Collapse>

                  <Collapse in={paymentMethod === 'paybill'}>
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#fff8e1', borderRadius: 2 }}>
                      <Typography fontWeight={600}>Paybill: 247247</Typography>
                      <Typography>Account: 0722244482</Typography>
                      <Typography>Amount: KES {total.toLocaleString()}</Typography>
                    </Box>
                  </Collapse>

                  <Collapse in={paymentMethod === 'withdraw'}>
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                      <Typography fontWeight={600}>Agent: 2065355</Typography>
                      <Typography>Store: 2061522</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        label="M-Pesa Code *"
                        sx={{ mt: 1 }}
                        value={checkoutDetails.mpesaCode}
                        onChange={(e) => handleChange('mpesaCode', e.target.value)}
                      />
                    </Box>
                  </Collapse>

                  <GradientButton
                    fullWidth
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <CreditCard />}
                  >
                    {isProcessing ? 'Processing...' : 'Place Order'}
                  </GradientButton>
                </Box>
              </StyledPaper>
            </Box>
          </Stack>

          {/* TRENDING */}
          <Box sx={{ mt: 8 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#db1b88' }}>
              Others Are Buying
            </Typography>
            <Box sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 2,
              '&::-webkit-scrollbar': { height: 8 },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#db1b88', borderRadius: 4 },
            }}>
              {trendingProducts.map((product) => (
                <Card key={product.id} sx={{
                  minWidth: 200,
                  borderRadius: 3,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  transition: '0.3s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' },
                }}>
                  <CardMedia component="img" height="120" image={product.image} alt={product.title} sx={{ objectFit: 'cover' }} />
                  <CardContent>
                    <Typography variant="body2" noWrap>{product.title}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Chip label={`KES ${product.price.toLocaleString()}`} color="primary" size="small" />
                      <IconButton size="small" color="primary">
                        <Add />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>

          {/* HIDDEN PDF TEMPLATE */}
          <Box sx={{ position: 'absolute', left: '-9999px' }} ref={pdfRef}>
            <Box sx={{ p: 8, bgcolor: '#fff', width: 600, fontFamily: 'Arial, sans-serif' }}>
              <Box textAlign="center" mb={3}>
                <img src="/cloudtech-logo.png" alt="CloudTech" style={{ height: 70 }} />
              </Box>
              <Typography variant="h4" align="center" gutterBottom sx={{ color: '#db1b88', fontWeight: 700 }}>
                Order Receipt
              </Typography>
              <Typography align="center" color="text.secondary" gutterBottom>
                Order ID: CT{Date.now().toString().slice(-8)}
              </Typography>
              <Divider sx={{ my: 3 }} />
              <Typography><strong>Customer:</strong> {checkoutDetails.name}</Typography>
              <Typography><strong>Phone:</strong> {checkoutDetails.phone}</Typography>
              <Typography><strong>Delivery:</strong> {checkoutDetails.address}, {checkoutDetails.city}</Typography>
              <Typography><strong>Payment:</strong> {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod.toUpperCase()}</Typography>
              {change > 0 && <Typography><strong>Change:</strong> KES {change.toLocaleString()}</Typography>}
              <Divider sx={{ my: 3 }} />
              {Object.values(cart).map((item: any) => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <span>{item.title} × {item.quantity}</span>
                  <span>KES {(item.price * item.quantity).toLocaleString()}</span>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Subtotal:</span>
                <span>KES {subtotal.toLocaleString()}</span>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Shipping:</span>
                <span>KES {shipping.toLocaleString()}</span>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, mt: 1, fontSize: '1.2rem', color: '#db1b88' }}>
                <span>Total:</span>
                <span>KES {total.toLocaleString()}</span>
              </Box>
              <Box textAlign="center" mt={5} sx={{ fontSize: 12, color: '#888' }}>
                <Typography>Thank you for shopping with</Typography>
                <Typography fontWeight={700} sx={{ color: '#db1b88' }}>CloudTech</Typography>
                <Typography>Kenya Cinema Building, Moi Avenue, Nairobi</Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}