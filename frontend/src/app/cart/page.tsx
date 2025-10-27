'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
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
} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import TopNavBar from '../components/TopNavBar';
import MainNavBar from '../components/MainNavBar';
import { useCart } from '../components/cartContext';

type CartItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
  stock: number;
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 8,
  boxShadow: theme.shadows[3],
  backgroundColor: theme.palette.background.paper,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(1.5),
  fontWeight: 600,
  textTransform: 'none',
}));

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  const [checkoutDetails, setCheckoutDetails] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    mpesaCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'paybill' | 'withdraw' | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const subtotal = Object.values(cart).reduce(
    (sum: number, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 0 ? 200 : 0;
  const total = subtotal + shipping;

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
    return true;
  };

  const handleCheckout = async () => {
    if (Object.values(cart).length === 0) {
      showSnackbar('Your cart is empty.', 'error');
      return;
    }
    if (!validateForm()) return;
    setIsProcessing(true);

    try {
      if (paymentMethod === 'paybill') {
        // STK Push (or backend call)
        const res = await fetch('/api/mpesa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: checkoutDetails.phone,
            amount: total,
          }),
        });
        const data = await res.json();
        if (data.ResponseCode === '0') {
          showSnackbar('STK Push sent to your phone. Complete payment to confirm order.', 'success');
        } else {
          showSnackbar('Failed to send STK Push. Try again.', 'error');
        }
      } else if (paymentMethod === 'withdraw') {
        showSnackbar('Withdrawal payment submitted! We’ll confirm shortly.', 'success');
      }

      clearCart();
      router.push('/order-confirmation');
    } catch (err) {
      console.error('Checkout error:', err);
      showSnackbar('Payment failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box>
      <TopNavBar />
      <MainNavBar />
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* CART TABLE */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 65%' } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a237e' }}>
              Your Cart
            </Typography>

            {Object.values(cart).length === 0 ? (
              <StyledPaper sx={{ textAlign: 'center', p: 3 }}>
                <Typography sx={{ color: '#777' }}>Your cart is empty 🛒</Typography>
                <StyledButton sx={{ mt: 2 }} variant="contained" color="primary" onClick={() => router.push('/')}>
                  Continue Shopping
                </StyledButton>
              </StyledPaper>
            ) : (
              <StyledPaper>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.values(cart).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.title}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                              <IconButton size="small" onClick={() => handleQuantityChange(item.id, -1)}>
                                <Remove fontSize="small" />
                              </IconButton>
                              <Typography>{item.quantity}</Typography>
                              <IconButton size="small" onClick={() => handleQuantityChange(item.id, 1)}>
                                <Add fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell align="right">KES {item.price.toLocaleString()}</TableCell>
                          <TableCell align="right">KES {(item.price * item.quantity).toLocaleString()}</TableCell>
                          <TableCell align="center">
                            <IconButton color="error" onClick={() => handleDelete(item.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ my: 2 }} />
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
                    <Typography variant="h6">KES {total.toLocaleString()}</Typography>
                  </Box>
                </Box>
              </StyledPaper>
            )}
          </Box>

          {/* CHECKOUT SECTION */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 35%' } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a237e' }}>
              Checkout
            </Typography>

            <StyledPaper>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Full Name *" value={checkoutDetails.name} onChange={(e) => handleChange('name', e.target.value)} size="small" />
                <TextField label="Phone Number *" value={checkoutDetails.phone} onChange={(e) => handleChange('phone', e.target.value)} size="small" type="tel" />
                <TextField label="Email" value={checkoutDetails.email} onChange={(e) => handleChange('email', e.target.value)} size="small" />
                <TextField label="Address *" value={checkoutDetails.address} onChange={(e) => handleChange('address', e.target.value)} size="small" />
                <TextField label="City *" value={checkoutDetails.city} onChange={(e) => handleChange('city', e.target.value)} size="small" />
                <TextField label="Postal Code" value={checkoutDetails.postalCode} onChange={(e) => handleChange('postalCode', e.target.value)} size="small" />

                <FormControl sx={{ mt: 2 }}>
                  <FormLabel sx={{ fontWeight: 600, color: '#1a237e' }}>Payment Method *</FormLabel>
                  <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as 'paybill' | 'withdraw')}>
                    <FormControlLabel value="paybill" control={<Radio />} label="Paybill (247247 - Account 0722244482)" />
                    <FormControlLabel value="withdraw" control={<Radio />} label="Withdraw Option (Agent 2065355 / Store 2061522)" />
                  </RadioGroup>
                </FormControl>

                {/* Paybill Instructions */}
                <Collapse in={paymentMethod === 'paybill'}>
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                    <Typography fontWeight={600}>Paybill Instructions:</Typography>
                    <Typography>1️⃣ Open M-Pesa → Lipa na M-Pesa</Typography>
                    <Typography>2️⃣ Select Paybill</Typography>
                    <Typography>3️⃣ Enter Business Number: <b>247247</b></Typography>
                    <Typography>4️⃣ Account Number: <b>0722244482</b></Typography>
                    <Typography>5️⃣ Enter Amount: <b>KES {total.toLocaleString()}</b></Typography>
                    <Typography>6️⃣ Confirm and Send ✅</Typography>
                  </Box>
                </Collapse>

                {/* Withdraw Option */}
                <Collapse in={paymentMethod === 'withdraw'}>
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                    <Typography fontWeight={600}>Withdraw Option:</Typography>
                    <Typography>Pay to Agent Number: <b>2065355</b></Typography>
                    <Typography>or Store Number: <b>2061522</b></Typography>
                    <Typography sx={{ mt: 1 }}>After payment, enter your M-Pesa confirmation code below:</Typography>
                    <TextField
                      label="M-Pesa Confirmation Code *"
                      value={checkoutDetails.mpesaCode}
                      onChange={(e) => handleChange('mpesaCode', e.target.value)}
                      fullWidth
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Collapse>

                <StyledButton
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  startIcon={isProcessing ? <CircularProgress size={20} /> : null}
                >
                  {isProcessing ? 'Processing...' : 'Complete Payment'}
                </StyledButton>
              </Box>
            </StyledPaper>
          </Box>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
