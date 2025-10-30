'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
  Alert,
  Skeleton,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useRouter } from 'next/navigation';

const API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/api'
    : 'https://cloudtech-c4ft.onrender.com/api';

const MEDIA_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : 'https://cloudtech-c4ft.onrender.com';

/* ------------------------------------------------------------------ */
/* Smart fetch – timeout + retries + exponential back-off              */
/* ------------------------------------------------------------------ */
async function fetchWithTimeoutRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeout = 12000,
  retries = 1
) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort('timeout'), timeout);

    try {
      const res = await fetch(input, { ...init, signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch (err: any) {
      clearTimeout(id);
      if (err.name === 'AbortError' && attempt < retries) {
        console.warn(`Fetch timeout – retry ${attempt + 1}/${retries}`);
        await new Promise((r) => setTimeout(r, 1500));
        timeout = Math.min(timeout + 8000, 30000); // cap at 30 s
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries reached');
}

/* ------------------------------------------------------------------ */
/* Warm the Render dyno – keep it alive for 4 min after a successful ping */
/* ------------------------------------------------------------------ */
async function warmBackend() {
  const KEY = 'api_warm_until';
  const until = Number(sessionStorage.getItem(KEY) || '0');
  if (Date.now() < until) return true;

  const healthUrl = `${API_BASE.replace(/\/$/, '')}/health`;
  console.log('Warming backend →', healthUrl);

  try {
    const res = await fetchWithTimeoutRetry(healthUrl, { method: 'GET' }, 8000, 2);
    if (res.ok) {
      const ttl = 4 * 60 * 1000; // 4 min
      sessionStorage.setItem(KEY, String(Date.now() + ttl));
      console.info('Backend warm');
      return true;
    }
  } catch (e) {
    console.warn('Health check failed (cold start expected)', e);
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */
export default function AdminLogin() {
  const router = useRouter();

  // ----- form state -------------------------------------------------
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpId, setOtpId] = useState<string | null>(null);

  // ----- UI state ---------------------------------------------------
  const [loading, setLoading] = useState(false);
  const [isWaking, setIsWaking] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    severity?: 'success' | 'error' | 'info';
    text: string;
  }>({ open: false, text: '' });

  // ----- helpers ----------------------------------------------------
  const openSnack = (text: string, severity: 'success' | 'error' | 'info' = 'info') =>
    setSnackbar({ open: true, text, severity });
  const closeSnack = () => setSnackbar((s) => ({ ...s, open: false }));

  // ----- warm on mount ----------------------------------------------
  useEffect(() => {
    warmBackend().then((ok) => console.info(ok ? 'Backend warm' : 'Backend cold'));
    // optional: ping every 4 min while page is open
    const interval = setInterval(warmBackend, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // ----- login -------------------------------------------------------
  const handleLogin = async () => {
    if (!email || !password) return openSnack('Enter email and password', 'error');

    setLoading(true);
    setIsWaking(true);

    try {
      const res = await fetchWithTimeoutRetry(
        `${API_BASE}/auth/login/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        },
        30000, // 30 s for cold start
        2
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.detail || err.message || `Login failed (${res.status})`;
        openSnack(msg, 'error');
        return;
      }

      const data = await res.json();
      console.log('Login →', data);

      if (data.otp_id) {
        setOtpId(String(data.otp_id));
        setOtpStep(true);
        openSnack('OTP sent – check your inbox', 'success');
      } else if (data.access) {
        localStorage.setItem('access', data.access);
        if (data.refresh) localStorage.setItem('refresh', data.refresh);
        openSnack('Logged in!', 'success');
        router.push('/admin-dashboard');
      } else {
        openSnack('No token/OTP returned', 'info');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.name === 'AbortError' || err.message?.includes('timeout')) {
        openSnack('Server is waking up – please wait 15-30 s and try again', 'info');
      } else {
        openSnack('Network error – check connection / CORS', 'error');
      }
    } finally {
      setLoading(false);
      setIsWaking(false);
    }
  };

  // ----- OTP verify -------------------------------------------------
  const handleOtpVerify = async () => {
    if (!otpId || !otp) return openSnack('Enter OTP', 'error');

    setLoading(true);
    try {
      const res = await fetchWithTimeoutRetry(
        `${API_BASE}/auth/verify-otp/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp_id: otpId, code: otp }),
        },
        30000,
        2
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.detail || err.message || `OTP failed (${res.status})`;
        openSnack(msg, 'error');
        return;
      }

      const data = await res.json();
      console.log('OTP verify →', data);

      if (data.access) {
        localStorage.setItem('access', data.access);
        if (data.refresh) localStorage.setItem('refresh', data.refresh);
        openSnack('OTP verified – logged in!', 'success');
        router.push('/admin-dashboard');
      } else {
        openSnack('No token returned', 'info');
      }
    } catch (err: any) {
      console.error('OTP error:', err);
      if (err.name === 'AbortError') {
        openSnack('Server still waking – retry in a few seconds', 'info');
      } else {
        openSnack('Network error', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // ----- enter key --------------------------------------------------
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      otpStep ? handleOtpVerify() : handleLogin();
    }
  };

  // ------------------------------------------------------------------
  return (
    <Box
      onKeyDown={onKeyDown}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg,#fafafa,#fff)',
        p: 2,
      }}
    >
      {/* ------------------- CARD ------------------- */}
      <Box
        sx={{
          width: { xs: '100%', sm: 420, md: 520 },
          maxWidth: '100%',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
          px: { xs: 3, sm: 4 },
          py: { xs: 3, sm: 5 },
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, textAlign: 'center' }}>
          Admin Login
        </Typography>

        {/* ----- SKELETON WHILE WAKING ----- */}
        {isWaking && (
          <Box sx={{ mb: 2 }}>
            <Skeleton height={56} sx={{ mb: 1 }} />
            <Skeleton height={56} />
          </Box>
        )}

        {/* ----- EMAIL / PASSWORD ----- */}
        {!otpStep && !isWaking && (
          <>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              variant="outlined"
              margin="normal"
              autoComplete="email"
              autoFocus
              disabled={loading}
            />
            <TextField
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              fullWidth
              variant="outlined"
              margin="normal"
              autoComplete="current-password"
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      size="large"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                onClick={handleLogin}
                fullWidth
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Send OTP / Login'}
              </Button>
              <Button
                onClick={() => {
                  setEmail('');
                  setPassword('');
                }}
                fullWidth
                variant="outlined"
                disabled={loading}
              >
                Clear
              </Button>
            </Box>
          </>
        )}

        {/* ----- OTP STEP ----- */}
        {otpStep && !isWaking && (
          <>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Enter the OTP sent to your email
            </Typography>
            <TextField
              label="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              fullWidth
              variant="outlined"
              margin="normal"
              inputMode="numeric"
              disabled={loading}
            />
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                onClick={handleOtpVerify}
                fullWidth
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Verify & Login'}
              </Button>
              <Button
                onClick={() => {
                  setOtpStep(false);
                  setOtp('');
                  setOtpId(null);
                }}
                fullWidth
                variant="outlined"
                disabled={loading}
              >
                Back
              </Button>
            </Box>
          </>
        )}
      </Box>

      {/* ------------------- SNACKBAR ------------------- */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity || 'info'} onClose={closeSnack} sx={{ width: '100%' }}>
          {snackbar.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}