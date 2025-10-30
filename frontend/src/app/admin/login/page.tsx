'use client';

import React, { useEffect, useState } from 'react';
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

/* ------------------------------------------------------------------ */
/* 🔧 API BASE SETUP                                                  */
/* ------------------------------------------------------------------ */
const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    console.log('🌐 Current hostname:', host);
    if (host.includes('localhost') || host.includes('127.0.0.1'))
      return 'http://localhost:8000/api';
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.cloudtechstore.net/api';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.cloudtechstore.net/api';
};

const API_BASE = getApiBase();
console.log('🔗 Using API_BASE:', API_BASE);

/* ------------------------------------------------------------------ */
/* 🚀 SMART FETCH WITH RETRY + TIMEOUT                                */
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
      console.log(`⏳ Fetch attempt ${attempt + 1} →`, input);
      const res = await fetch(input, { ...init, signal: controller.signal });
      clearTimeout(id);
      console.log(`✅ Fetch success →`, input, res.status);
      return res;
    } catch (err: any) {
      clearTimeout(id);
      console.warn(`❌ Fetch failed (attempt ${attempt + 1}/${retries}):`, err);
      if (attempt < retries) {
        console.log('⏱ Retrying fetch in 2s...');
        await new Promise((r) => setTimeout(r, 2000));
        timeout = Math.min(timeout + 10000, 60000);
        continue;
      }
      console.error('💥 Max retries reached for fetch:', input);
      throw err;
    }
  }
  throw new Error('Max retries reached');
}

/* ------------------------------------------------------------------ */
/* 🧊 WARM BACKEND (health + login)                                   */
/* ------------------------------------------------------------------ */
async function warmBackend() {
  const KEY = 'api_warm_until';
  const until = Number(sessionStorage.getItem(KEY) || '0');
  if (Date.now() < until) return true;

  const endpoints = [
    `${API_BASE.replace(/\/$/, '')}/health`,
    `${API_BASE.replace(/\/$/, '')}/auth/login/`,
  ];
  console.log('🔥 Warming backend →', endpoints);

  try {
    await Promise.all(
      endpoints.map((url) =>
        fetchWithTimeoutRetry(url, { method: 'OPTIONS' }, 10000, 2)
      )
    );
    sessionStorage.setItem(KEY, String(Date.now() + 4 * 60 * 1000)); // 4 min cache
    console.info('✅ Backend fully warm');
    return true;
  } catch (e) {
    console.warn('⚠️ Warm-up failed (cold start expected):', e);
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* 🧠 MAIN COMPONENT                                                  */
/* ------------------------------------------------------------------ */
export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpId, setOtpId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [isWaking, setIsWaking] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    severity?: 'success' | 'error' | 'info';
    text: string;
  }>({ open: false, text: '' });

  const openSnack = (text: string, severity: 'success' | 'error' | 'info' = 'info') =>
    setSnackbar({ open: true, text, severity });
  const closeSnack = () => setSnackbar((s) => ({ ...s, open: false }));

  useEffect(() => {
    warmBackend();
    const interval = setInterval(warmBackend, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  /* ------------------------------------------------------------------ */
  /* 🔑 Login Handler                                                  */
  /* ------------------------------------------------------------------ */
  const handleLogin = async () => {
    if (!email || !password) return openSnack('Enter email and password', 'error');

    setLoading(true);
    setIsWaking(true);
    console.log('✉️ Attempting login with email:', email);

    try {
      const res = await fetchWithTimeoutRetry(
        `${API_BASE}/auth/login/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        },
        60000,
        2
      );

      console.log('📨 Login response status:', res.status);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.warn('⚠️ Login error body:', err);
        const msg = err.detail || err.message || `Login failed (${res.status})`;
        openSnack(msg, 'error');
        return;
      }

      const data = await res.json();
      console.log('✅ Login →', data);

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
      console.error('💥 Login error caught:', err);
      if (err.name === 'AbortError' || err.message?.includes('timeout')) {
        openSnack('Server is waking up – please wait 15–30 s and try again', 'info');
      } else {
        openSnack('Network/CORS error – please check connection', 'error');
      }
    } finally {
      setLoading(false);
      setIsWaking(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* 🔐 OTP Verify Handler                                             */
  /* ------------------------------------------------------------------ */
  const handleOtpVerify = async () => {
    if (!otpId || !otp) return openSnack('Enter OTP', 'error');
    setLoading(true);
    console.log('🔑 Verifying OTP:', otp, 'for otpId:', otpId);

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

      console.log('📨 OTP response status:', res.status);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.detail || err.message || `OTP failed (${res.status})`;
        openSnack(msg, 'error');
        return;
      }

      const data = await res.json();
      console.log('✅ OTP Verify →', data);

      if (data.access) {
        localStorage.setItem('access', data.access);
        if (data.refresh) localStorage.setItem('refresh', data.refresh);
        openSnack('OTP verified – logged in!', 'success');
        router.push('/admin-dashboard');
      } else {
        openSnack('No token returned', 'info');
      }
    } catch (err: any) {
      console.error('💥 OTP error caught:', err);
      if (err.name === 'AbortError') {
        openSnack('Server still waking – retry soon', 'info');
      } else {
        openSnack('Network error', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') otpStep ? handleOtpVerify() : handleLogin();
  };

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
      <Box
        sx={{
          width: { xs: '100%', sm: 420, md: 520 },
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

        {isWaking && (
          <Box sx={{ mb: 2 }}>
            <Skeleton height={56} sx={{ mb: 1 }} />
            <Skeleton height={56} />
          </Box>
        )}

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
              <Button onClick={handleLogin} fullWidth variant="contained" disabled={loading}>
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
              <Button onClick={handleOtpVerify} fullWidth variant="contained" disabled={loading}>
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
