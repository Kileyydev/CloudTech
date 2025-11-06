// src/app/trade-in/page.tsx
'use client';

import React, { useState } from 'react';
import TopNavBar from '@/app/components/TopNavBar';
import MainNavBar from '@/app/components/MainNavBar';
import TickerBar from '@/app/components/TickerBar';
import {
  Container, Box, Typography, Button, Alert, Stack,
  FormControl, InputLabel, Select, MenuItem, TextField, IconButton
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import WarningAmber from '@mui/icons-material/WarningAmber';

const DB: Record<string, Record<string, number>> = {
  'iPhone 11': { '128GB': 18000 },
  'iPhone 11 Pro': { '128GB': 25000, '256GB': 25000 },
  'iPhone 12': { '128GB': 25000, '256GB': 28000 },
  'iPhone 12 Pro': { '128GB': 27000, '256GB': 30000 },
  'iPhone 12 Pro Max': { '128GB': 40000, '256GB': 40000 },
  'iPhone 13': { '128GB': 30000, '256GB': 30000 },
  'iPhone 13 Pro': { '128GB': 40000, '256GB': 40000 },
  'iPhone 13 Pro Max': { '128GB': 50000, '256GB': 50000 },
  'iPhone 14': { '128GB': 38000, '256GB': 43000 },
  'iPhone 14 Pro': { '128GB': 50000, '256GB': 55000 },
  'iPhone 14 Pro Max': { '128GB': 60000, '256GB': 60000 },
  'iPhone 15': { '128GB': 47000, '256GB': 50000 },
  'iPhone 15 Pro': { '128GB': 70000, '256GB': 70000 },
  'iPhone 15 Pro Max': { '128GB': 85000, '256GB': 85000 },
  'iPhone 16': { '128GB': 70000, '256GB': 75000 },
  'iPhone 16 Pro': { '128GB': 87000, '256GB': 95000 },
  'iPhone 16 Pro Max': { '128GB': 105000, '256GB': 105000 },
};

export default function TradeInPage() {
  const [model, setModel] = useState('');
  const [storage, setStorage] = useState('');
  const [battery, setBattery] = useState('good');
  const [defects, setDefects] = useState(0);
  const [price, setPrice] = useState<number | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);

  const calculate = () => {
    const base = DB[model]?.[storage] || 0;
    const deduction = (battery === 'low' ? 3000 : 0) + defects * 3000;
    setPrice(Math.max(base - deduction, 0));
  };

  return (
    <>
      <TickerBar />
      <TopNavBar />
      <MainNavBar />

      <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
        <Container maxWidth="md">
          {/* Header */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
              textAlign: 'center',
              mb: 4,
              bgcolor: '#c2185b', // Deep pink
              color: '#ffffff',
              py: 2,
              borderRadius: 1,
              letterSpacing: '0.05em',
            }}
          >
            INSTANT TRADE-IN QUOTE
          </Typography>

          {/* Warning Alert */}
          <Alert
            icon={<WarningAmber sx={{ color: '#d32f2f' }} />}
            severity="warning"
            sx={{
              mb: 5,
              bgcolor: '#fff8f0',
              border: '1px solid #ff9800',
              color: '#000000',
              fontWeight: 500,
              '& .MuiAlert-message': { width: '100%' },
            }}
          >
            <strong>Estimate only.</strong> Final value confirmed in-store after physical inspection.
          </Alert>

          {/* Form Card */}
          <Box
            sx={{
              bgcolor: '#ffffff',
              border: '2px solid #000000',
              borderRadius: 2,
              p: { xs: 3, sm: 5, md: 6 },
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            }}
          >
            <Stack spacing={4.5}>

              {/* Phone Model */}
              <FormControl fullWidth variant="outlined">
                <InputLabel sx={{ fontWeight: 700, color: '#000000' }}>Phone Model</InputLabel>
                <Select
                  value={model}
                  label="Phone Model"
                  onChange={(e) => { setModel(e.target.value); setStorage(''); setPrice(null); }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#000000' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#c2185b' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#c2185b' },
                    fontWeight: 600,
                  }}
                >
                  {Object.keys(DB).map(m => (
                    <MenuItem key={m} value={m} sx={{ fontWeight: 600 }}>{m}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Storage */}
              {model && DB[model] && (
                <FormControl fullWidth variant="outlined">
                  <InputLabel sx={{ fontWeight: 700, color: '#000000' }}>Storage</InputLabel>
                  <Select
                    value={storage}
                    label="Storage"
                    onChange={(e) => { setStorage(e.target.value); setPrice(null); }}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#000000' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#c2185b' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#c2185b' },
                    }}
                  >
                    {Object.keys(DB[model]).map(s => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Battery Health */}
              <FormControl fullWidth variant="outlined">
                <InputLabel sx={{ fontWeight: 700, color: '# Typh000000' }}>Battery Health</InputLabel>
                <Select
                  value={battery}
                  label="Battery Health"
                  onChange={(e) => setBattery(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#000000' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#c2185b' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#c2185b' },
                  }}
                >
                  <MenuItem value="good">85% or higher</MenuItem>
                  <MenuItem value="low">Below 85%</MenuItem>
                </Select>
              </FormControl>

              {/* Condition */}
              <FormControl fullWidth variant="outlined">
                <InputLabel sx={{ fontWeight: 700, color: '#000000' }}>Condition</InputLabel>
                <Select
                  value={defects}
                  label="Condition"
                  onChange={(e) => setDefects(+e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#000000' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#c2185b' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#c2185b' },
                  }}
                >
                  <MenuItem value={0}>Perfect</MenuItem>
                  <MenuItem value={1}>1 small issue</MenuItem>
                  <MenuItem value={2}>2+ issues</MenuItem>
                </Select>
              </FormControl>

              {/* Photo Upload */}
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 1.5, color: '#000000' }}>
                  Upload Photos
                </Typography>
                <TextField
                  fullWidth
                  type="file"
                  inputProps={{ multiple: true, accept: 'image/*' }}
                  onChange={(e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) setPhotos(Array.from(files));
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButton sx={{ bgcolor: '#000000', color: '#ffffff', '&:hover': { bgcolor: '#c2185b' } }}>
                        <PhotoCamera />
                      </IconButton>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#000000' },
                      '&:hover fieldset': { borderColor: '#c2185b' },
                      '&.Mui-focused fieldset': { borderColor: '#c2185b' },
                    },
                  }}
                />
                {photos.length > 0 && (
                  <Typography sx={{ color: '#2e7d32', fontWeight: 600, mt: 1.5 }}>
                    ✓ {photos.length} photo{photos.length > 1 ? 's' : ''} attached
                  </Typography>
                )}
              </Box>

              {/* Calculate Button */}
              <Button
                fullWidth
                onClick={calculate}
                disabled={!model || !storage}
                sx={{
                  py: 2.2,
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  bgcolor: '#c2185b',
                  color: '#ffffff',
                  textTransform: 'none',
                  border: '2px solid #000000',
                  '&:hover': { bgcolor: '#ad1457', borderColor: '#000000' },
                  '&:disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e', borderColor: '#bdbdbd' },
                  transition: 'all 0.3s ease',
                }}
              >
                SHOW MY VALUE
              </Button>

              {/* Result Box */}
              {price !== null && (
                <Box
                  sx={{
                    textAlign: 'center',
                    border: '3px solid #c2185b',
                    borderRadius: 2,
                    p: { xs: 3, sm: 4 },
                    bgcolor: '#fffbfa',
                    boxShadow: '0 6px 16px rgba(194, 24, 91, 0.1)',
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '1.1rem', sm: '1.3rem' },
                      color: '#000000',
                      mb: 1,
                    }}
                  >
                    ESTIMATED TRADE-IN VALUE
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: '2.8rem', sm: '3.8rem', md: '4.2rem' },
                      fontWeight: 900,
                      color: '#c2185b',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    KSh {price.toLocaleString()}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: '#2e7d32',
                      mt: 2,
                      fontSize: '1rem',
                    }}
                  >
                    Visit any CloudTech store · Cash in 10 minutes
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Container>
      </Box>
    </>
  );
}