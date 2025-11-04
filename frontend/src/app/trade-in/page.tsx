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
  'iPhone 11': { '128GB': 15000, '256GB': 18350 },
  'iPhone 12': { '128GB': 16700, '256GB': 18700 },
  'iPhone 13 Pro': { '128GB': 40000, '256GB': 45000 },
  'iPhone 14': { '128GB': 38000, '256GB': 43000 },
  'iPhone 14 Pro': { '128GB': 50000, '256GB': 55000 },
  'iPhone 14 Pro Max': { '128GB': 60000 },
  'iPhone 15': { '128GB': 47000, '256GB': 50000 },
  'iPhone 16 Pro Max': { '128GB': 105000 },
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
    // MAGIC HAPPENS HERE — NO TEXT, NO TRACE
    const deduction = (battery === 'low' ? 3000 : 0) + defects * 3000;
    setPrice(Math.max(base - deduction, 0));
  };

  return (
    <>
      <TickerBar />
      <TopNavBar />
      <MainNavBar />

      <Box sx={{ bgcolor: '#fff', minHeight: '100vh', py: 6 }}>
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4 } }}>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.5rem', sm: '2.8rem' }, textAlign: 'center', mb: 3, bgcolor: '#db1b88', color: '#fff', py: 1 }}>
            INSTANT TRADE-IN QUOTE
          </Typography>

          <Alert icon={<WarningAmber />} severity="warning"
            sx={{ mb: 4, bgcolor: '#FFF4E5', border: '2px solid #FFB302' }}>
            <strong>Estimate only.</strong> Final value confirmed in-store after inspection.
          </Alert>

          <Box sx={{ bgcolor: '#fff', border: '3px solid #000', p: { xs: 3, md: 6 } }}>
            <Stack spacing={4}>

              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 700 }}>Phone Model</InputLabel>
                <Select value={model} label="Phone Model"
                  onChange={(e) => { setModel(e.target.value); setStorage(''); setPrice(null); }}>
                  {Object.keys(DB).map(m => (
                    <MenuItem key={m} value={m} sx={{ fontWeight: 600 }}>{m}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {model && DB[model] && (
                <FormControl fullWidth>
                  <InputLabel sx={{ fontWeight: 700 }}>Storage</InputLabel>
                  <Select value={storage} label="Storage"
                    onChange={(e) => { setStorage(e.target.value); setPrice(null); }}>
                    {Object.keys(DB[model]).map(s => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 700 }}>Battery Health</InputLabel>
                <Select value={battery} label="Battery Health" onChange={(e) => setBattery(e.target.value)}>
                  <MenuItem value="good">85% or higher</MenuItem>
                  <MenuItem value="low">Below 85%</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 700 }}>Condition</InputLabel>
                <Select value={defects} label="Condition" onChange={(e) => setDefects(+e.target.value)}>
                  <MenuItem value={0}>Perfect</MenuItem>
                  <MenuItem value={1}>1 small issue</MenuItem>
                  <MenuItem value={2}>2+ issues</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>Upload Photos</Typography>
                <TextField fullWidth type="file" inputProps={{ multiple: true, accept: 'image/*' }}
                  onChange={(e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) setPhotos(Array.from(files));
                  }}
                  InputProps={{
                    endAdornment: <IconButton sx={{ bgcolor: '#000', color: '#fff' }}><PhotoCamera /></IconButton>,
                  }}
                />
                {photos.length > 0 && (
                  <Typography sx={{ color: '#00A000', fontWeight: 600, mt: 1 }}>
                    ✓ {photos.length} photo{photos.length > 1 ? 's' : ''} attached
                  </Typography>
                )}
              </Box>

              <Button fullWidth onClick={calculate} disabled={!model || !storage}
                sx={{ py: 2.5, fontSize: '1.3rem', fontWeight: 800, bgcolor: '#db1b88', color: '#000' }}>
                SHOW MY VALUE
              </Button>

              {price !== null && (
                <Box sx={{ textAlign: 'center', border: '4px solid #DC1A8A', p: 4, bgcolor: '#fff' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.4rem' }}>
                    ESTIMATED TRADE-IN VALUE
                  </Typography>
                  <Typography sx={{ fontSize: '4rem', fontWeight: 900, color: '#DC1A8A' }}>
                    KSh {price.toLocaleString()}
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: '#00A000', mt: 1 }}>
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