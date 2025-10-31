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

/* ---------------- Navigation ---------------- */
import TopNavBar from '@/app/components/TopNavBar';
import MainNavBar from '@/app/components/MainNavBar';

/* ---------------- API BASE & FETCH HELPER ---------------- */
const getApiBase = () => {
  let base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.cloudtechstore.net/api';
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('localhost') || host.includes('127.0.0.1')) base = 'http://localhost:8000/api';
    if (host.includes('vercel.app')) base = 'https://api.cloudtechstore.net/api';
  }
  return base.replace(/\/$/, '');
};

async function fetchWithTimeoutRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeout = 12000,
  retries = 1
) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
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

/* ---------------- MAIN COMPONENT ---------------- */
export default function AdminLogin() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; severity?: 'success' | 'error' | 'info'; text: string }>({ open: false, text: '' });

  const openSnack = (text: string, severity: 'success' | 'error' | 'info' = 'info') =>
    setSnackbar({ open: true, text, severity });
  const closeSnack = () => setSnackbar((s) => ({ ...s, open: false }));

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) return openSnack('Enter email and password', 'error');

    setLoading(true);
    try {
      const res = await fetchWithTimeoutRetry(`${getApiBase()}/accounts/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }, 30000, 2);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        openSnack(err.detail || err.message || `Login failed (${res.status})`, 'error');
        return;
      }

      const data = await res.json();
      if (data.access) {
        localStorage.setItem('access', data.access);
        if (data.refresh) localStorage.setItem('refresh', data.refresh);
        openSnack('Logged in!', 'success');
        router.push('/admin-dashboard');
      } else {
        openSnack('No token returned', 'info');
      }
    } catch (err: any) {
      openSnack(err.name === 'AbortError' ? 'Server timeout, try again' : 'Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  if (!mounted) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fafafa' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <TopNavBar />
      <MainNavBar />

      <Box
        sx={{ minHeight: 'calc(100vh - 180px)', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fafafa', py: 4, px: 3 }}
        onKeyDown={onKeyDown}
      >
        <Box sx={{ width: { xs: '100%', sm: 420, md: 480 }, bgcolor: '#fff', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', p: 4, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#222', textAlign: 'center' }}>
            Admin Login
          </Typography>

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
              sx={{ bgcolor: '#e91e63', textTransform: 'none', fontSize: '0.95rem', py: 1.2, '&:hover': { bgcolor: '#c2185b' } }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Login'}
            </Button>
            <Button onClick={() => { setEmail(''); setPassword(''); }} fullWidth variant="outlined" disabled={loading} sx={{ textTransform: 'none' }}>
              Clear
            </Button>
          </Box>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={closeSnack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity || 'info'} onClose={closeSnack} sx={{ width: '100%' }}>
          {snackbar.text}
        </Alert>
      </Snackbar>
    </>
  );
}
