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
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, '') || 'http://localhost:8000/api';

/**
 * fetchWithTimeout: wraps fetch with abort & timeout
 */
async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeout = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const merged = { ...init, signal: controller.signal };
    const res = await fetch(input, merged);
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * keepAlivePing: pings /health/ (or root) and caches result in sessionStorage for `ttlMs`
 * Purpose: reduce cold start delays by warming the backend (if allowed)
 */
async function keepAlivePing(ttlMs = 5 * 60 * 1000) {
  const key = 'api_warm_until';
  const until = Number(sessionStorage.getItem(key) || '0');
  if (Date.now() < until) return true; // still warm

  try {
    // try health endpoint first, fall back to API root
    const healthUrl = `${API_BASE}/health/`;
    const res = await fetchWithTimeout(healthUrl, { method: 'GET' }, 5000).catch(() =>
      fetchWithTimeout(`${API_BASE}/`, { method: 'GET' }, 5000)
    );
    if (res && res.ok) {
      sessionStorage.setItem(key, String(Date.now() + ttlMs));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpId, setOtpId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; severity?: 'success' | 'error' | 'info'; text: string }>({
    open: false,
    text: '',
  });

  // Warm the API on mount (cached)
  useEffect(() => {
    keepAlivePing().then((warm) => {
      if (!warm) {
        // Not fatal — just informative
        console.info('API keep-alive failed or not reachable; cold starts possible.');
      }
    });
  }, []);

  const openSnack = (text: string, severity: 'success' | 'error' | 'info' = 'info') =>
    setSnackbar({ open: true, text, severity });

  const closeSnack = () => setSnackbar((s) => ({ ...s, open: false }));

  const handleLogin = async () => {
    if (!email || !password) {
      openSnack('Please enter email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      // POST /auth/login/
      const res = await fetchWithTimeout(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }, 12000); // 12s timeout

      if (!res.ok) {
        // try to parse error body for friendly message
        let msg = `Login failed (${res.status})`;
        try {
          const err = await res.json();
          msg = err.detail || err.message || JSON.stringify(err);
        } catch {
          // ignore parse errors
        }
        openSnack(msg, 'error');
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log('Login Response:', data);

      if (data.otp_id) {
        setOtpId(String(data.otp_id));
        setOtpStep(true);
        openSnack('OTP sent — check your email', 'success');
      } else if (data.access) {
        // some backends may return access immediately (no OTP)
        localStorage.setItem('access', data.access);
        if (data.refresh) localStorage.setItem('refresh', data.refresh);
        openSnack('Login successful', 'success');
        router.push('/admin-dashboard');
      } else {
        openSnack('Login succeeded but no otp/access returned', 'info');
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      if (err.name === 'AbortError') openSnack('Request timed out. Try again.', 'error');
      else openSnack('Error contacting server. Check network/CORS.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (!otpId || !otp) {
      openSnack('Missing OTP or OTP id', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetchWithTimeout(`${API_BASE}/auth/verify-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp_id: otpId, code: otp }),
      }, 12000);

      if (!res.ok) {
        let msg = `OTP verify failed (${res.status})`;
        try {
          const err = await res.json();
          msg = err.detail || err.message || JSON.stringify(err);
        } catch {}
        openSnack(msg, 'error');
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log('OTP Verify Response:', data);

      if (data.access) {
        localStorage.setItem('access', data.access);
        if (data.refresh) localStorage.setItem('refresh', data.refresh);
        openSnack('OTP verified — logged in!', 'success');
        router.push('/admin-dashboard');
      } else {
        openSnack('OTP verification succeeded but no token returned', 'info');
      }
    } catch (err: any) {
      console.error('OTP Error:', err);
      if (err.name === 'AbortError') openSnack('Request timed out. Try again.', 'error');
      else openSnack('Error contacting server. Check network/CORS.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // handle Enter key
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!otpStep) handleLogin();
      else handleOtpVerify();
    }
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
          maxWidth: '100%',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
          px: { xs: 3, sm: 4 },
          py: { xs: 3, sm: 5 },
        }}
        role="form"
        aria-label="Admin login form"
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, textAlign: 'center' }}>
          Admin Login
        </Typography>

        {!otpStep ? (
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      size="large"
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
                sx={{ textTransform: 'none', py: 1.25 }}
              >
                {loading ? <CircularProgress size={20} /> : 'Send OTP / Login'}
              </Button>
              <Button
                onClick={() => {
                  // convenience: clear fields
                  setEmail('');
                  setPassword('');
                }}
                fullWidth
                variant="outlined"
                disabled={loading}
                sx={{ textTransform: 'none', py: 1.25 }}
              >
                Clear
              </Button>
            </Box>
          </>
        ) : (
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
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                onClick={handleOtpVerify}
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ textTransform: 'none', py: 1.25 }}
              >
                {loading ? <CircularProgress size={20} /> : 'Verify & Login'}
              </Button>
              <Button
                onClick={() => {
                  // go back to credentials step
                  setOtpStep(false);
                  setOtp('');
                  setOtpId(null);
                }}
                fullWidth
                variant="outlined"
                disabled={loading}
                sx={{ textTransform: 'none', py: 1.25 }}
              >
                Back
              </Button>
            </Box>
          </>
        )}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={closeSnack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity || 'info'} sx={{ width: '100%' }} onClose={closeSnack}>
          {snackbar.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}
