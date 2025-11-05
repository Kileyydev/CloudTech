// src/app/cart/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, TextField, Button, Divider, Paper, FormControl, FormLabel, RadioGroup,
  FormControlLabel, Radio, Collapse, Alert, CircularProgress, Snackbar, Card,
  CardMedia, CardContent, Container, InputAdornment, useTheme, useMediaQuery,
  Stack, Skeleton
} from '@mui/material';
import { Add, Remove, Delete, CreditCard, AttachMoney } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import TopNavBar from '../components/TopNavBar';
import MainNavBar from '../components/MainNavBar';
import { useCart } from '../components/cartContext';
import TickerBar from '../components/TickerBar';
import axios from 'axios';

const API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/api'
    : 'https://cloudtech-c4ft.onrender.com/api';
const MEDIA_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : 'https://cloudtech-c4ft.onrender.com';

// M-PESA VERIFICATION (demo)
async function verifyMpesaTransaction(
  code: string,
  amount: number,
  phone: string
): Promise<{ ok: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 1500));
  const demoCodes = ['ABC123XYZ', 'MP25KLMN9P', 'QRX7TUV8W'];
  if (demoCodes.includes(code.toUpperCase())) {
    return { ok: true, message: 'Payment confirmed!' };
  }
  return { ok: false, message: 'Invalid M-Pesa code. Try ABC123XYZ' };
}

type ProductT = {
  id: number;
  title: string;
  price: number | string;
  discount?: number;
  cover_image?: string;
  stock: number;
};

type CartItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
  stock: number;
  cover_image?: string;
};

// Safe number formatting
const toNum = (val: any): number => {
  const n = parseFloat(String(val));
  return isNaN(n) ? 0 : n;
};

const round = (num: any): number => {
  const n = toNum(num);
  return Number(n.toFixed(2));
};

const formatPrice = (val: any): string => {
  return toNum(val).toLocaleString();
};

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, addToCart, deviceId } = useCart();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [checkoutDetails, setCheckoutDetails] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    mpesaCode: '',
    cashAmount: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'paybill' | 'withdraw' | 'cod' | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false, message: '', severity: 'success' as 'success' | 'error'
  });

  const [trending, setTrending] = useState<ProductT[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const hasFetched = useRef(false);

  // Sanitize cart items
  const safeCart = Object.values(cart).map(item => ({
    ...item,
    price: toNum(item.price),
  }));

  const subtotal = safeCart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 0 ? 200 : 0;
  const total = subtotal + shipping;
  const cashPaid = toNum(checkoutDetails.cashAmount);
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
        const sanitized = list.map((p: any) => ({
          ...p,
          price: toNum(p.price),
          discount: p.discount ? toNum(p.discount) : undefined,
        }));
        setTrending(sanitized);
      } catch (err) {
        console.error('Failed to load trending:', err);
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

  const handleChange = (f: keyof typeof checkoutDetails, v: string) => {
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
    if ((paymentMethod === 'paybill' || paymentMethod === 'withdraw') && !checkoutDetails.mpesaCode) {
      setError('Enter M-Pesa code');
      return false;
    }
    if (paymentMethod === 'cod' && cashPaid < total) {
      setError(`Enter at least KES ${formatPrice(total)}`);
      return false;
    }
    return true;
  };

  // FINAL CHECKOUT — INSTANT + BACKGROUND SAVE
  const handleCheckout = async () => {
    if (safeCart.length === 0) return show('Cart empty', 'error');
    if (!validate()) return;

    setIsProcessing(true);
    setError('');

    try {
      let paymentOk = true;
      let paymentMessage = '';

      if (paymentMethod === 'paybill' || paymentMethod === 'withdraw') {
        const { ok, message } = await verifyMpesaTransaction(checkoutDetails.mpesaCode, total, checkoutDetails.phone);
        paymentOk = ok;
        paymentMessage = message;
        if (!ok) {
          setError(message);
          setIsProcessing(false);
          return;
        }
      }

      // === 1. BUILD ORDER DATA FOR INSTANT DISPLAY ===
      const tempOrderId = `TEMP-${Date.now()}`;
      const orderData = {
        id: tempOrderId,
        name: checkoutDetails.name.trim(),
        phone: checkoutDetails.phone.trim(),
        address: checkoutDetails.address.trim(),
        city: checkoutDetails.city.trim(),
        payment: paymentMethod,
        mpesa_code: checkoutDetails.mpesaCode || '',
        cash_amount: round(cashPaid),
        change: round(change),
        subtotal: round(subtotal),
        shipping: round(shipping),
        total: round(total),
        status: 'confirmed',
        date: new Date().toISOString(),
        items: safeCart.map((item) => ({
          product_id: item.id.toString(),
          title: item.title,
          price: round(item.price),
          quantity: item.quantity,
        })),
      };

      // === 2. SAVE TO LOCAL STORAGE FOR INSTANT PAGE ===
      localStorage.setItem('pending_order', JSON.stringify(orderData));

      // === 3. SEND TO BACKEND IN BACKGROUND ===
      const payload = {
        name: orderData.name,
        phone: orderData.phone,
        address: orderData.address,
        city: orderData.city,
        payment: orderData.payment,
        mpesa_code: orderData.mpesa_code,
        cash_amount: orderData.cash_amount,
        change: orderData.change,
        subtotal: orderData.subtotal,
        shipping: orderData.shipping,
        total: orderData.total,
        items: orderData.items,
      };

      // SEND device_id IN HEADER
      const token = localStorage.getItem('token');
      axios.post(`${API_BASE}/purchases/`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Device-ID': deviceId,  // ← HERE IT IS, POOKIE!
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
      })
      .then(res => {
        const realOrderId = res.data.id;
        const realOrder = { ...orderData, id: realOrderId };
        localStorage.setItem('pending_order', JSON.stringify(realOrder));
        router.replace(`/order-confirmation?orderId=${realOrderId}`);
      })
      .catch(err => {
        console.error('Background save failed:', err);
        // Still show confirmation
      });

      // === 4. INSTANT REDIRECT + CLEAR CART ===
      clearCart();
      router.push('/order-confirmation?temp=1');
      show(paymentMessage || 'Order placed! Confirming...', 'success');

    } catch (e) {
      console.error(e);
      show('Something went wrong', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // TRENDING UI
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
    const basePrice = toNum(p.price);
    const discount = p.discount ? toNum(p.discount) : 0;
    const final = discount > 0 ? basePrice * (1 - discount / 100) : basePrice;

    const handleAdd = (e: React.MouseEvent) => {
      e.stopPropagation();
      addToCart({
        id: p.id,
        title: p.title,
        price: final,
        quantity: 1,
        stock: p.stock,
        cover_image: p.cover_image,
      } as CartItem);
      show(`${p.title} added to cart!`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
      <Card key={p.id} sx={{
        width: W, height: H, bgcolor: '#fff', borderRadius: 0,
        boxShadow: '0 3px 6px rgba(0,0,0,0.08)', overflow: 'hidden', flex: `0 0 ${W}px`
      }}>
        <Box onClick={() => router.push(`/product/${p.id}`)} sx={{
          width: '100%', height: H * 0.56, cursor: 'pointer', overflow: 'hidden'
        }}>
          <CardMedia component="img" image={src || '/images/fallback.jpg'} alt={p.title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>
        <CardContent sx={{
          p: 1.5, height: H * 0.44, display: 'flex',
          flexDirection: 'column', justifyContent: 'space-between'
        }}>
          <Box>
            <Typography sx={{
              fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {p.title}
            </Typography>
            <Box sx={{ mt: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {discount > 0 ? (
                <>
                  <Typography sx={{
                    textDecoration: 'line-through', color: '#999', fontSize: '0.75rem'
                  }}>KES {formatPrice(basePrice)}</Typography>
                  <Typography sx={{
                    fontWeight: 700, color: '#e91e63', fontSize: '1rem'
                  }}>KES {formatPrice(final)}</Typography>
                </>
              ) : (
                <Typography sx={{ fontWeight: 700, color: '#222', fontSize: '1rem' }}>
                  KES {formatPrice(basePrice)}
                </Typography>
              )}
            </Box>
          </Box>
          <Button fullWidth variant="contained" startIcon={<Add />} onClick={handleAdd}
            sx={{
              bgcolor: '#e91e63', color: '#fff', textTransform: 'none',
              mt: 1.5, borderRadius: 0, fontSize: '0.88rem', py: 0.9
            }}>
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
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4}>
            {/* CART */}
            <Box sx={{ flex: 1 }}>
              {safeCart.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 0 }}>
                  <Typography variant="h6" color="text.secondary">Cart empty</Typography>
                  <Button variant="contained" sx={{ mt: 2, bgcolor: '#e91e63', borderRadius: 0 }}
                    onClick={() => router.push('/')}>
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
                        {safeCart.map(item => (
                          <TableRow key={item.id}>
                            <TableCell>{item.title}</TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <IconButton size="small" onClick={() => updateQuantity(item.id, -1)}><Remove /></IconButton>
                                <Typography sx={{ minWidth: 32, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</Typography>
                                <IconButton size="small" onClick={() => updateQuantity(item.id, 1)}><Add /></IconButton>
                              </Box>
                            </TableCell>
                            <TableCell align="right">KES {formatPrice(item.price)}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              KES {formatPrice(item.price * item.quantity)}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton color="error" onClick={() => removeFromCart(item.id)}><Delete /></IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ p: 3, borderTop: '1px solid #eee' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Subtotal</Typography>
                      <Typography>KES {formatPrice(subtotal)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Shipping</Typography>
                      <Typography>KES {formatPrice(shipping)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <Typography variant="h6">Total</Typography>
                      <Typography variant="h6" color="#e91e63">KES {formatPrice(total)}</Typography>
                    </Box>
                  </Box>
                </Paper>
              )}
            </Box>

            {/* CHECKOUT FORM */}
            <Box sx={{ flex: { lg: 0.9 } }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#e91e63' }}>Checkout</Typography>
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
                      <strong>Amount:</strong> KES {formatPrice(total)}
                      <TextField fullWidth size="small" label="M-Pesa Code *" placeholder="e.g. ABC123XYZ"
                        value={checkoutDetails.mpesaCode}
                        onChange={e => handleChange('mpesaCode', e.target.value)} sx={{ mt: 1 }} />
                    </Alert>
                  </Collapse>

                  <Collapse in={paymentMethod === 'withdraw'}>
                    <Alert severity="info">
                      <strong>Agent:</strong> 2065355 | <strong>Store:</strong> 2061522<br />
                      <TextField fullWidth size="small" label="M-Pesa Code *" placeholder="e.g. ABC123XYZ"
                        value={checkoutDetails.mpesaCode}
                        onChange={e => handleChange('mpesaCode', e.target.value)} sx={{ mt: 1 }} />
                    </Alert>
                  </Collapse>

                  <Collapse in={paymentMethod === 'cod'}>
                    <Alert severity="success">
                      Cash on Delivery
                      <TextField fullWidth size="small" label="Cash Amount" type="number"
                        value={checkoutDetails.cashAmount}
                        onChange={e => handleChange('cashAmount', e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start">KES</InputAdornment> }}
                        sx={{ mt: 1 }} />
                      {change > 0 && <Typography sx={{ mt: 1, fontWeight: 600 }}>
                        Change: KES {formatPrice(change)}
                      </Typography>}
                    </Alert>
                  </Collapse>

                  <Button fullWidth variant="contained" onClick={handleCheckout} disabled={isProcessing}
                    startIcon={isProcessing ? <CircularProgress size={20} /> : <CreditCard />}
                    sx={{ bgcolor: '#e91e63', borderRadius: 0, py: 1.5, fontWeight: 700 }}>
                    {isProcessing ? 'Placing Order…' : 'Place Order'}
                  </Button>
                </Stack>
              </Paper>
            </Box>
          </Stack>

          {/* TRENDING */}
          <Box sx={{ mt: 8 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#e91e63' }}>Others Are Buying</Typography>
            <Box sx={{
              maxWidth: '1350px', mx: 'auto', px: { xs: 1, md: 1.5 },
              ...(isMobile
                ? { display: 'flex', overflowX: 'auto', gap: 0.8, pb: 2, '&::-webkit-scrollbar': { display: 'none' }, scrollSnapType: 'x mandatory' }
                : { display: 'grid', gap: 0.8, gridTemplateColumns: 'repeat(5, 1fr)' }
              ),
            }}>
              {loadingTrending
                ? Array.from({ length: 10 }).map((_, i) => <Box key={i}>{skeletonCard()}</Box>)
                : trending.filter(p => toNum(p.stock) > 0).map(trendingCard)
              }
            </Box>
          </Box>
        </Container>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={hide}>
        <Alert onClose={hide} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}