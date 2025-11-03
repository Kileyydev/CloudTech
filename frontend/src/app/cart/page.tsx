// src/app/cart/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
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
  Card,
  CardMedia,
  CardContent,
  Container,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Stack,
  Skeleton,
} from '@mui/material';
import { Add, Remove, Delete, CreditCard, AttachMoney } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import TopNavBar from '../components/TopNavBar';
import MainNavBar from '../components/MainNavBar';
import { useCart } from '../components/cartContext';
import TickerBar from '../components/TickerBar';

const API_BASE = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8000/api'
  : 'https://cloudtech-c4ft.onrender.com/api';
const MEDIA_BASE = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8000'
  : 'https://cloudtech-c4ft.onrender.com';

type ProductT = {
  id: number;
  title: string;
  price: number;
  discount?: number;
  cover_image?: string;
  stock: number;
};

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [checkoutDetails, setCheckoutDetails] = useState({
    name: '', phone: '', address: '', city: '', mpesaCode: '', cashAmount: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'paybill' | 'withdraw' | 'cod' | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Trending Products
  const [trending, setTrending] = useState<ProductT[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const hasFetched = useRef(false);

  const subtotal = Object.values(cart).reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 0 ? 200 : 0;
  const total = subtotal + shipping;
  const cashPaid = parseFloat(checkoutDetails.cashAmount) || 0;
  const change = paymentMethod === 'cod' && cashPaid > total ? cashPaid - total : 0;

  // Load Trending
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchTrending = async () => {
      try {
        const res = await fetch(`${API_BASE}/products/?ordering=-sold`);
        const data = await res.json();
        const list = (Array.isArray(data) ? data : data.results || []).slice(0, 10);
        setTrending(list);
      } catch {
        setTrending([]);
      } finally {
        setLoadingTrending(false);
      }
    };
    fetchTrending();
  }, []);

  const show = (msg: string, type: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message: msg, severity: type });
  const hide = () => setSnackbar(p => ({ ...p, open: false }));

  const handleChange = (f: string, v: string) => {
    setCheckoutDetails(p => ({ ...p, [f]: v }));
    setError('');
  };

  const validate = () => {
    if (!checkoutDetails.name || !checkoutDetails.phone || !checkoutDetails.address || !checkoutDetails.city) {
      setError('Fill all required fields');
      return false;
    }
    if (!paymentMethod) {
      setError('Select payment method');
      return false;
    }
    if (paymentMethod === 'withdraw' && !checkoutDetails.mpesaCode) {
      setError('Enter M-Pesa code');
      return false;
    }
    if (paymentMethod === 'cod' && cashPaid < total) {
      setError(`Enter at least KES ${total.toLocaleString()}`);
      return false;
    }
    return true;
  };

  // FAKE M-PESA CONFIRMATION
  const confirmMpesa = async (code: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 1800));
    const validCodes = ['ABC123XYZ', 'MP25KLMN9P', 'QRX7TUV8W'];
    return validCodes.includes(code.toUpperCase());
  };

  // BULLETPROOF CHECKOUT
  const handleCheckout = async () => {
    if (Object.values(cart).length === 0) return show('Cart empty', 'error');
    if (!validate()) return;

    setIsProcessing(true);
    setError('');

    try {
      let paymentOk = true;

      if (paymentMethod === 'withdraw') {
        const ok = await confirmMpesa(checkoutDetails.mpesaCode);
        if (!ok) {
          setError('Invalid M-Pesa code. Try ABC123XYZ');
          paymentOk = false;
        }
      }

      if (!paymentOk) {
        setIsProcessing(false);
        return;
      }

      // GENERATE UNIQUE ORDER ID
      const orderId = `CT${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

      // BUILD ORDER
      const order = {
        id: orderId,
        date: new Date().toISOString(),
        name: checkoutDetails.name.trim(),
        phone: checkoutDetails.phone.trim(),
        address: checkoutDetails.address.trim(),
        city: checkoutDetails.city.trim(),
        payment: paymentMethod,
        mpesaCode: checkoutDetails.mpesaCode || '',
        cashAmount: cashPaid,
        change,
        items: Object.values(cart),
        subtotal,
        shipping,
        total,
        status: 'confirmed' as const,
      };

      // SAVE TO USER ORDERS
      const userOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedUserOrders = [order, ...userOrders.filter((o: any) => o.id !== orderId)];
      localStorage.setItem('orders', JSON.stringify(updatedUserOrders));

      // SAVE TO ADMIN
      const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
      const updatedAdminOrders = [order, ...adminOrders.filter((o: any) => o.id !== orderId)];
      localStorage.setItem('adminOrders', JSON.stringify(updatedAdminOrders));

      // CLEAR CART
      clearCart();

      // REDIRECT WITH ALL DATA
      const params = new URLSearchParams({
        name: order.name,
        phone: order.phone,
        address: order.address,
        city: order.city,
        payment: order.payment,
        cash: order.cashAmount.toString(),
        change: order.change.toString(),
      });

      router.push(`/order-confirmation?${params.toString()}`);
      show('Order confirmed! Redirecting...', 'success');
    } catch (err) {
      console.error(err);
      show('Order failed. Try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const W = 218;
  const H = 350;

  const skeletonCard = () => (
    <Card sx={{ width: W, height: H, borderRadius: 0, bgcolor: '#fff' }}>
      <Skeleton variant="rectangular" width="100%" height={H * 0.56} />
      <CardContent sx={{ p: 1.5 }}>
        <Skeleton width="88%" height={22} sx={{ mb: 0.5 }} />
        <Skeleton width="65%" height={16} sx={{ mb: 1 }} />
        <Skeleton width="50%" height={26} />
      </CardContent>
    </Card>
  );

  const trendingCard = (p: ProductT) => {
    const src = p.cover_image?.startsWith('http') ? p.cover_image : `${MEDIA_BASE}${p.cover_image}`;
    const final = p.discount ? p.price * (1 - p.discount / 100) : p.price;

    return (
      <Card key={p.id} sx={{
        width: W,
        height: H,
        bgcolor: '#fff',
        borderRadius: 0,
        boxShadow: '0 3px 6px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        flex: `0 0 ${W}px`,
        position: 'relative',
      }}>
        <Box
          onClick={() => router.push(`/product/${p.id}`)}
          sx={{ width: '100%', height: H * 0.56, cursor: 'pointer', overflow: 'hidden' }}
        >
          <CardMedia
            component="img"
            image={src || '/images/fallback.jpg'}
            alt={p.title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>

        <CardContent sx={{ p: 1.5, height: H * 0.44, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {p.title}
            </Typography>
            <Box sx={{ mt: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {p.discount ? (
                <>
                  <Typography sx={{ textDecoration: 'line-through', color: '#999', fontSize: '0.75rem' }}>
                    KES {p.price.toLocaleString()}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: '#e91e63', fontSize: '1rem' }}>
                    KES {final.toLocaleString()}
                  </Typography>
                </>
              ) : (
                <Typography sx={{ fontWeight: 700, color: '#222', fontSize: '1rem' }}>
                  KES {p.price.toLocaleString()}
                </Typography>
              )}
            </Box>
          </Box>

          <Button
            fullWidth
            variant="contained"
            startIcon={<Add />}
            onClick={(e) => { e.stopPropagation(); }}
            sx={{ bgcolor: '#e91e63', color: '#fff', textTransform: 'none', mt: 1.5, borderRadius: 0, fontSize: '0.88rem', py: 0.9 }}
          >
            Add
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <TickerBar />
      <TopNavBar />
      <MainNavBar />

      <Box sx={{ bgcolor: '#fff', minHeight: '100vh', py: { xs: 3, md: 6 } }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: 800, color: '#e91e63' }}>
            Your Cart
          </Typography>

          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4}>
            {/* CART TABLE */}
            <Box sx={{ flex: 1 }}>
              {Object.values(cart).length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 0 }}>
                  <Typography variant="h6" color="text.secondary">Cart empty</Typography>
                  <Button variant="contained" sx={{ mt: 2, bgcolor: '#e91e63', borderRadius: 0 }} onClick={() => router.push('/')}>
                    Shop Now
                  </Button>
                </Paper>
              ) : (
                <Paper sx={{ borderRadius: 0, boxShadow: '0 3px 10px rgba(0,0,0,0.1)' }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Product</strong></TableCell>
                          <TableCell align="center"><strong>Qty</strong></TableCell>
                          <TableCell align="right"><strong>Price</strong></TableCell>
                          <TableCell align="right"><strong>Total</strong></TableCell>
                          <TableCell />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.values(cart).map(item => (
                          <TableRow key={item.id}>
                            <TableCell>{item.title}</TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <IconButton size="small" onClick={() => updateQuantity(item.id, -1)}>
                                  <Remove />
                                </IconButton>
                                <Typography sx={{ minWidth: 32, textAlign: 'center', fontWeight: 600 }}>
                                  {item.quantity}
                                </Typography>
                                <IconButton size="small" onClick={() => updateQuantity(item.id, 1)}>
                                  <Add />
                                </IconButton>
                              </Box>
                            </TableCell>
                            <TableCell align="right">KES {item.price.toLocaleString()}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              KES {(item.price * item.quantity).toLocaleString()}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton color="error" onClick={() => removeFromCart(item.id)}>
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ p: 3, borderTop: '1px solid #eee' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Subtotal</Typography>
                      <Typography>KES {subtotal.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Shipping</Typography>
                      <Typography>KES {shipping.toLocaleString()}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <Typography variant="h6">Total</Typography>
                      <Typography variant="h6" color="#e91e63">
                        KES {total.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}
            </Box>

            {/* CHECKOUT */}
            <Box sx={{ flex: { lg: 0.9 } }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#e91e63' }}>
                Checkout
              </Typography>

              <Paper sx={{ p: 3, borderRadius: 0 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Stack spacing={2}>
                  <TextField label="Name *" size="small" value={checkoutDetails.name} onChange={e => handleChange('name', e.target.value)} />
                  <TextField label="Phone *" size="small" value={checkoutDetails.phone} onChange={e => handleChange('phone', e.target.value)} />
                  <TextField label="Address *" size="small" value={checkoutDetails.address} onChange={e => handleChange('address', e.target.value)} />
                  <TextField label="City *" size="small" value={checkoutDetails.city} onChange={e => handleChange('city', e.target.value)} />

                  <FormControl>
                    <FormLabel>Payment</FormLabel>
                    <RadioGroup value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)}>
                      <FormControlLabel value="paybill" control={<Radio />} label="M-Pesa Paybill 247247" />
                      <FormControlLabel value="withdraw" control={<Radio />} label="Agent Withdraw" />
                      <FormControlLabel value="cod" control={<Radio />} label="Cash on Delivery" />
                    </RadioGroup>
                  </FormControl>

                  <Collapse in={paymentMethod === 'paybill'}>
                    <Alert severity="info">
                      <strong>Paybill:</strong> 247247<br />
                      <strong>Account:</strong> 0722244482<br />
                      <strong>Amount:</strong> KES {total.toLocaleString()}
                    </Alert>
                  </Collapse>

                  <Collapse in={paymentMethod === 'withdraw'}>
                    <Alert severity="info">
                      <strong>Agent:</strong> 2065355 | <strong>Store:</strong> 2061522<br />
                      <TextField
                        fullWidth
                        size="small"
                        label="M-Pesa Code *"
                        placeholder="e.g. ABC123XYZ"
                        value={checkoutDetails.mpesaCode}
                        onChange={e => handleChange('mpesaCode', e.target.value)}
                        sx={{ mt: 1 }}
                      />
                    </Alert>
                  </Collapse>

                  <Collapse in={paymentMethod === 'cod'}>
                    <Alert severity="success">
                      <AttachMoney sx={{ mr: 0.5 }} /> Cash on Delivery
                      <TextField
                        fullWidth
                        size="small"
                        label="Cash Amount"
                        type="number"
                        value={checkoutDetails.cashAmount}
                        onChange={e => handleChange('cashAmount', e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start">KES</InputAdornment> }}
                        sx={{ mt: 1 }}
                      />
                      {change > 0 && <Typography sx={{ mt: 1, fontWeight: 600 }}>Change: KES {change.toLocaleString()}</Typography>}
                    </Alert>
                  </Collapse>

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    startIcon={isProcessing ? <CircularProgress size={20} /> : <CreditCard />}
                    sx={{ bgcolor: '#e91e63', borderRadius: 0, py: 1.5, fontWeight: 700 }}
                  >
                    {isProcessing ? 'Confirming...' : 'Place Order'}
                  </Button>
                </Stack>
              </Paper>
            </Box>
          </Stack>

          {/* OTHERS ARE BUYING */}
          <Box sx={{ mt: 8 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#e91e63' }}>
              Others Are Buying
            </Typography>

            <Box sx={{
              maxWidth: '1350px',
              mx: 'auto',
              px: { xs: 1, md: 1.5 },
              ...(isMobile
                ? { display: 'flex', overflowX: 'auto', gap: 0.8, pb: 2, '&::-webkit-scrollbar': { display: 'none' }, scrollSnapType: 'x mandatory' }
                : { display: 'grid', gap: 0.8, gridTemplateColumns: 'repeat(5, 1fr)' }
              ),
            }}>
              {loadingTrending
                ? Array.from({ length: 10 }).map((_, i) => <Box key={i}>{skeletonCard()}</Box>)
                : trending.filter(p => p.stock > 0).map(trendingCard)
              }
            </Box>
          </Box>
        </Container>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={hide}>
        <Alert onClose={hide} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}