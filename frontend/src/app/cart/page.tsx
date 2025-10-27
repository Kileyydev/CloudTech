'use client';

import { useState, useEffect } from 'react';
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
  borderRadius: typeof theme.shape.borderRadius === 'number'
    ? theme.shape.borderRadius * 2
    : `calc(${theme.shape.borderRadius} * 2)`,
  boxShadow: theme.shadows[3],
  backgroundColor: theme.palette.background.paper,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: typeof theme.shape.borderRadius === 'number'
    ? theme.shape.borderRadius * 2
    : `calc(${theme.shape.borderRadius} * 2)`,
  padding: theme.spacing(1.5),
  fontWeight: 600,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [checkoutDetails, setCheckoutDetails] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'stk' | 'card' | 'bank' | 'delivery' | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [cardDetails, setCardDetails] = useState({ cardNumber: '', expiry: '', cvv: '' });
  const [bankDetails, setBankDetails] = useState({ accountNumber: '', bankName: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleQuantityChange = (id: number, delta: number) => {
    const item = cart[id];
    if (!item) return;
    if (delta > 0 && item.quantity >= item.stock) {
      showSnackbar(`Only ${item.stock} items available in stock`, 'error');
      return;
    }
    updateQuantity(id, delta);
    if (delta < 0 && item.quantity <= 1) {
      showSnackbar(`${item.title} removed from cart`);
    } else {
      showSnackbar(`Updated quantity for ${item.title}`);
    }
  };

  const handleDelete = (id: number) => {
    const item = cart[id];
    if (item) {
      removeFromCart(id);
      showSnackbar(`${item.title} removed from cart`);
    }
  };

  const handleChange = (field: string, value: string) => {
    setCheckoutDetails((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleCardChange = (field: string, value: string) => {
    setCardDetails((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleBankChange = (field: string, value: string) => {
    setBankDetails((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const subtotal = Object.values(cart).reduce((sum: number, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 200 : 0;
  const total = subtotal + shipping;

  const validateForm = () => {
    if (!checkoutDetails.name || !checkoutDetails.phone || !checkoutDetails.address || !checkoutDetails.city) {
      setError('Please fill in all required fields.');
      return false;
    }
    if (!paymentMethod) {
      setError('Please select a payment method.');
      return false;
    }
    if (paymentMethod === 'card' && (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv)) {
      setError('Please provide all card details.');
      return false;
    }
    if (paymentMethod === 'bank' && (!bankDetails.accountNumber || !bankDetails.bankName)) {
      setError('Please provide all bank details.');
      return false;
    }
    return true;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;
    setIsProcessing(true);
    setError('');

    try {
      if (paymentMethod === 'stk') {
        console.log('Initiating STK Push for:', checkoutDetails.phone, 'Amount:', total);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        showSnackbar('STK Push sent to your phone. Please complete the payment.');
      } else if (paymentMethod === 'card') {
        console.log('Processing card payment:', cardDetails);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        showSnackbar('Card payment processed successfully!');
      } else if (paymentMethod === 'bank') {
        console.log('Bank deposit details:', bankDetails);
        showSnackbar('Please make a deposit to the provided bank details.');
      } else if (paymentMethod === 'delivery') {
        console.log('Pay on Delivery selected:', checkoutDetails);
        showSnackbar('Order placed! You will pay on delivery.');
      }
      setCheckoutDetails({ name: '', phone: '', email: '', address: '', city: '', postalCode: '' });
      setCardDetails({ cardNumber: '', expiry: '', cvv: '' });
      setBankDetails({ accountNumber: '', bankName: '' });
      setPaymentMethod('');
      clearCart();
    } catch (err) {
      setError('An error occurred during checkout. Please try again.');
      setSnackbar({ open: true, message: 'Checkout failed. Please try again.', severity: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box>
      <TopNavBar />
      <MainNavBar />
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
          }}
        >
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 66%' } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a237e' }}>
              Your Cart
            </Typography>
            {Object.values(cart).length === 0 ? (
              <StyledPaper>
                <Typography sx={{ p: 3, color: '#777', textAlign: 'center' }}>
                  Your cart is empty 🛒
                </Typography>
              </StyledPaper>
            ) : (
              <StyledPaper>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Quantity</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Price</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.values(cart).map((item) => (
                        <TableRow key={item.id} sx={{ '&:hover': { bgcolor: '#f0f4ff' } }}>
                          <TableCell>{item.title}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item.id, -1)}
                                sx={{ bgcolor: '#e0e0e0', '&:hover': { bgcolor: '#d0d0d0' } }}
                              >
                                <Remove fontSize="small" />
                              </IconButton>
                              <Typography>{item.quantity}</Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item.id, 1)}
                                disabled={item.quantity >= item.stock}
                                sx={{
                                  bgcolor: '#e0e0e0',
                                  '&:hover': { bgcolor: '#d0d0d0' },
                                  '&[disabled]': { bgcolor: '#e0e0e0', opacity: 0.5 },
                                }}
                              >
                                <Add fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell align="right">KES {item.price.toLocaleString()}</TableCell>
                          <TableCell align="right">KES {(item.price * item.quantity).toLocaleString()}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="error"
                              onClick={() => handleDelete(item.id)}
                              sx={{ '&:hover': { bgcolor: '#ffebee' } }}
                            >
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
                    <Typography variant="subtitle1">Subtotal:</Typography>
                    <Typography variant="subtitle1">KES {subtotal.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1">Shipping:</Typography>
                    <Typography variant="subtitle1">KES {shipping.toLocaleString()}</Typography>
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
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a237e' }}>
              Checkout
            </Typography>
            <StyledPaper>
              {error && (
                <Collapse in={!!error}>
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                </Collapse>
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Full Name *"
                  value={checkoutDetails.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
                <TextField
                  label="Phone Number *"
                  value={checkoutDetails.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                  type="tel"
                />
                <TextField
                  label="Email"
                  value={checkoutDetails.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                  type="email"
                />
                <TextField
                  label="Address *"
                  value={checkoutDetails.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
                <TextField
                  label="City *"
                  value={checkoutDetails.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
                <TextField
                  label="Postal Code"
                  value={checkoutDetails.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
                <FormControl component="fieldset" sx={{ mt: 2 }}>
                  <FormLabel component="legend" sx={{ fontWeight: 600, color: '#1a237e' }}>
                    Payment Method *
                  </FormLabel>
                  <RadioGroup
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'stk' | 'card' | 'bank' | 'delivery')}
                  >
                    <FormControlLabel value="stk" control={<Radio />} label="Pay Now: M-Pesa (STK Push)" />
                    <FormControlLabel value="card" control={<Radio />} label="Pay Now: Card Payment" />
                    <FormControlLabel value="bank" control={<Radio />} label="Pay Now: Direct Bank Deposit" />
                    <FormControlLabel value="delivery" control={<Radio />} label="Pay on Delivery" />
                  </RadioGroup>
                </FormControl>
                <Collapse in={paymentMethod === 'card'}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField
                      label="Card Number *"
                      value={cardDetails.cardNumber}
                      onChange={(e) => handleCardChange('cardNumber', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        label="Expiry (MM/YY) *"
                        value={cardDetails.expiry}
                        onChange={(e) => handleCardChange('expiry', e.target.value)}
                        fullWidth
                        variant="outlined"
                        size="small"
                      />
                      <TextField
                        label="CVV *"
                        value={cardDetails.cvv}
                        onChange={(e) => handleCardChange('cvv', e.target.value)}
                        fullWidth
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </Box>
                </Collapse>
                <Collapse in={paymentMethod === 'bank'}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField
                      label="Account Number *"
                      value={bankDetails.accountNumber}
                      onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                    <TextField
                      label="Bank Name *"
                      value={bankDetails.bankName}
                      onChange={(e) => handleBankChange('bankName', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Collapse>
                <StyledButton
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleCheckout}
                  disabled={isProcessing || Object.values(cart).length === 0 || !checkoutDetails.name || !checkoutDetails.phone || !checkoutDetails.address || !checkoutDetails.city || !paymentMethod}
                  startIcon={isProcessing ? <CircularProgress size={20} /> : null}
                >
                  {isProcessing ? 'Processing...' : paymentMethod === 'delivery' ? 'Place Order' : 'Pay Now'}
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