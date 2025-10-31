"use client";

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
/*  Navigation & Footer (CLIENT-ONLY FIX FOR HYDRATION)               */
/* ------------------------------------------------------------------ */
import TopNavBar from '@/app/components/TopNavBar';
import MainNavBar from '@/app/components/MainNavBar';

/* ------------------------------------------------------------------ */
/*  API BASE & FETCH HELPERS                                          */
/* ------------------------------------------------------------------ */
const getApiBase = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.cloudtechstore.net/api';
  }

  const host = window.location.hostname;

  // Dev: localhost
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return 'http://localhost:8000/api';
  }

  // Preview: Vercel
  if (host.includes('vercel.app')) {
    return 'https://api.cloudtechstore.net/api';
  }

  // Production: cloudtechstore.net
  return 'https://api.cloudtechstore.net/api';
};

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
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 2000));
        timeout = Math.min(timeout + 10000, 60000);
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries reached');
}

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                    */
/* ------------------------------------------------------------------ */
export default function AdminLogin() {
  const router = useRouter();

  // HYDRATION FIX: Prevent server-client mismatch
  const [mounted, setMounted] = useState(false);

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

  // MOUNTED FIX: Only render navbars after client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Warm backend (unchanged)
  useEffect(() => {
    const warm = async () => {
      const KEY = 'api_warm_until';
      const until = Number(sessionStorage.getItem(KEY) || '0');
      if (Date.now() < until) return;

      const endpoints = [
        `${getApiBase().replace(/\/$/, '')}/health`,
        `${getApiBase().replace(/\/$/, '')}/accounts/login/`,
      ];
      try {
        await Promise.all(
          endpoints.map((url) =>
            fetchWithTimeoutRetry(url, { method: 'OPTIONS' }, 10000, 2)
          )
        );
        sessionStorage.setItem(KEY, String(Date.now() + 4 * 60 * 1000));
      } catch (e) {
        console.warn('Warm-up failed', e);
      }
    };
    warm();
    const interval = setInterval(warm, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) return openSnack('Enter email and password', 'error');

    setLoading(true);
    setIsWaking(true);
    try {
      const res = await fetchWithTimeoutRetry(
        `${getApiBase()}/accounts/login/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        },
        60000,
        2
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        openSnack(err.detail || err.message || `Login failed (${res.status})`, 'error');
        return;
      }

      const data = await res.json();
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
      if (err.name === 'AbortError' || err.message?.includes('timeout')) {
        openSnack('Server is waking up – please wait 15-30 s', 'info');
      } else {
        openSnack('Network error – check connection', 'error');
      }
    } finally {
      setLoading(false);
      setIsWaking(false);
    }
  };

  const handleOtpVerify = async () => {
    if (!otpId || !otp) return openSnack('Enter OTP', 'error');
    setLoading(true);
    try {
      const res = await fetchWithTimeoutRetry(
        `${getApiBase()}/accounts/verify-otp/`,
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
        openSnack(err.detail || err.message || `OTP failed (${res.status})`, 'error');
        return;
      }

      const data = await res.json();
      if (data.access) {
        localStorage.setItem('access', data.access);
        if (data.refresh) localStorage.setItem('refresh', data.refresh);
        openSnack('OTP verified – logged in!', 'success');
        router.push('/admin-dashboard');
      } else {
        openSnack('No token returned', 'info');
      }
    } catch (err: any) {
      openSnack(err.name === 'AbortError' ? 'Server still waking' : 'Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') otpStep ? handleOtpVerify() : handleLogin();
  };

  // HYDRATION FIX: Show loading until mounted
  if (!mounted) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fafafa' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* CLIENT-ONLY NAVBARS (FIXES HYDRATION ERROR) */}
      <TopNavBar />
      <MainNavBar />

      <Box
        sx={{
          minHeight: 'calc(100vh - 180px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#fafafa',
          py: { xs: 2, md: 4 },
          px: { xs: 2, sm: 3 },
        }}
        onKeyDown={onKeyDown}
      >
        <Box
          sx={{
            width: { xs: '100%', sm: 420, md: 480 },
            bgcolor: '#fff',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            p: { xs: 3, sm: 4 },
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' },
          }}
        >
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#222', textAlign: 'center' }}>
            Admin Login
          </Typography>

          {isWaking && (
            <Box sx={{ mb: 2 }}>
              <Skeleton height={56} sx={{ mb: 1 }} />
              <Skeleton height={56} />
            </Box>
          )}

          {/* EMAIL/PASSWORD STEP */}
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
                sx={{ mb: 2 }}
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
                      <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" disabled={loading}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  onClick={handleLogin}
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: '#e91e63',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    py: 1.2,
                    '&:hover': { bgcolor: '#c2185b' },
                  }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Send OTP / Login'}
                </Button>
                <Button
                  onClick={() => {
                    setEmail('');
                    setPassword('');
                  }}
                  fullWidth
                  variant="outlined"
                  disabled={loading}
                  sx={{ textTransform: 'none' }}
                >
                  Clear
                </Button>
              </Box>
            </>
          )}

          {/* OTP STEP */}
          {otpStep && !isWaking && (
            <>
              <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
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
                sx={{ mb: 3 }}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  onClick={handleOtpVerify}
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: '#e91e63',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    py: 1.2,
                    '&:hover': { bgcolor: '#c2185b' },
                  }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Verify & Login'}
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
                  sx={{ textTransform: 'none' }}
                >
                  Back
                </Button>
              </Box>
            </>
          )}
        </Box>
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
    </>
  );
}