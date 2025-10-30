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

const API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/api'
    : 'https://cloudtech-c4ft.onrender.com/api';

const MEDIA_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : 'https://cloudtech-c4ft.onrender.com';

/** Smart fetch with timeout and retries */
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
        console.warn(`Fetch timeout — retrying (${attempt + 1}/${retries})…`);
        await new Promise((r) => setTimeout(r, 1500)); // small delay
        timeout += 4000; // give more time next attempt
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries reached');
}

/** Warm Render dyno */
async function warmBackend(ttlMs = 5 * 60 * 1000) {
  const key = 'api_warm_until';
  const until = Number(sessionStorage.getItem(key) || '0');
  if (Date.now() < until) return true;

  try {
    const res = await fetchWithTimeoutRetry(`${API_BASE}/health/`, { method: 'GET' }, 5000, 2);
    if (res.ok) {
      sessionStorage.setItem(key, String(Date.now() + ttlMs));
      return true;
    }
  } catch {}
  return false;
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

  useEffect(() => {
    warmBackend().then((ok) => {
      console.info(ok ? '✅ Backend warm' : '🧊 Backend cold, warming up…');
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
      const res = await fetchWithTimeoutRetry(
        `${API_BASE}/auth/login/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        },
        12000,
        2
      );

      if (!res.ok) {
        let msg = `Login failed (${res.status})`;
        try {
          const err = await res.json();
          msg = err.detail || err.message || JSON.stringify(err);
        } catch {}
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
        localStorage.setItem('access', data.access);
        if (data.refresh) localStorage.setItem('refresh', data.refresh);
        openSnack('Login successful', 'success');
        router.push('/admin-dashboard');
      } else {
        openSnack('Login succeeded but no otp/access returned', 'info');
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      if (err.name === 'AbortError' || err.message.includes('timeout')) {
        openSnack('Waking up server… please retry in a few seconds ⏳', 'info');
      } else {
        openSnack('Error contacting server. Check network/CORS.', 'error');
      }
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
      const res = await fetchWithTimeoutRetry(
        `${API_BASE}/auth/verify-otp/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp_id: otpId, code: otp }),
        },
        12000,
        2
      );

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
      if (err.name === 'AbortError' || err.message.includes('timeout')) {
        openSnack('Server still waking up — please retry.', 'info');
      } else {
        openSnack('Error contacting server. Check network/CORS.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

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
                    <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" size="large">
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
        autoHideDuration={4000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity || 'info'} sx={{ width: '100%' }} onClose={closeSnack}>
          {snackbar.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}
