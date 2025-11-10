'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  TextField,
  Stack,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  Paper,
  Divider,
} from '@mui/material';
import { WhatsApp, Refresh, CheckCircle, Cancel, Pending, AccessTime, Close } from '@mui/icons-material';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

type RepairImageT = {
  id: string;
  image: string;
  alt_text: string;
  is_primary: boolean;
  uploaded_at: string;
};

type RepairT = {
  id: string;
  client_name: string;
  client_phone: string;
  device_type: string;
  issue_description: string;
  status: string;
  cover_image_url: string | null;
  images: RepairImageT[];
  created_at: string;
};

export default function AdminRepairsTable() {
  const [repairs, setRepairs] = useState<RepairT[]>([]);
  const [filtered, setFiltered] = useState<RepairT[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    type: 'success',
  });

  const STATUS_OPTIONS = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'];

  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/fixrequests/repairs/`);
      const sorted = res.data.sort((a: RepairT, b: RepairT) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRepairs(sorted);
      setFiltered(sorted);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to fetch repair requests', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    const lower = val.toLowerCase();
    setFiltered(
      repairs.filter(
        (r) =>
          r.client_name?.toLowerCase().includes(lower) ||
          r.device_type?.toLowerCase().includes(lower) ||
          r.client_phone?.includes(val) ||
          r.status?.toLowerCase().includes(lower)
      )
    );
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.patch(`${API_BASE}/fixrequests/repairs/${id}/`, { status });
      setSnackbar({ open: true, message: `Status updated to ${status.replace('_', ' ')}`, type: 'success' });
      fetchRepairs();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to update status', type: 'error' });
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { icon: <CheckCircle sx={{ fontSize: 18 }} />, color: '#4caf50', bg: '#e8f5e9', label: 'COMPLETED' };
      case 'IN_PROGRESS':
        return { icon: <AccessTime sx={{ fontSize: 18 }} />, color: '#ff8f00', bg: '#fff8e1', label: 'IN PROGRESS' };
      case 'REJECTED':
        return { icon: <Close sx={{ fontSize: 18 }} />, color: '#f44336', bg: '#ffebee', label: 'REJECTED' };
      default:
        return { icon: <Pending sx={{ fontSize: 18 }} />, color: '#666', bg: '#fafafa', label: 'PENDING' };
    }
  };

  // Calculate stats
  const stats = {
    total: repairs.length,
    pending: repairs.filter(r => r.status === 'PENDING').length,
    inProgress: repairs.filter(r => r.status === 'IN_PROGRESS').length,
    completed: repairs.filter(r => r.status === 'COMPLETED').length,
  };

  const currentTime = new Date().toLocaleString('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Nairobi',
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#fff0f8',
        color: '#000',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        margin: 0,
        padding: 0,
      }}
    >


      {/* Summary Stats Bar - Full Width, Top */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #ddd' }}>
        <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={3}
            divider={<Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />}
          >
            {[
              { label: 'TOTAL REQUESTS', value: stats.total, color: '#000' },
              { label: 'PENDING', value: stats.pending, color: '#666' },
              { label: 'IN PROGRESS', value: stats.inProgress, color: '#ff8f00' },
              { label: 'COMPLETED', value: stats.completed, color: '#4caf50' },
            ].map((stat) => (
              <Box key={stat.label} sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: stat.color, lineHeight: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', fontWeight: 600, mt: 0.5 }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Search & Refresh - Full Width */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #ddd' }}>
        <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={3}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#000' }}>
              REPAIR REQUESTS
            </Typography>

            <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
              <TextField
                placeholder="Search by name, phone, device, or status..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                size="small"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 0 },
                  minWidth: { xs: '100%', md: 340 },
                }}
                InputProps={{
                  style: { fontSize: '1rem' },
                }}
              />
              <Button
                variant="contained"
                onClick={fetchRepairs}
                startIcon={<Refresh />}
                disabled={loading}
                sx={{
                  bgcolor: '#000',
                  color: '#fff',
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1rem',
                  whiteSpace: 'nowrap',
                  '&:disabled': { bgcolor: '#ccc' },
                }}
              >
                REFRESH
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* Table - Full Width */}
      <Box sx={{ bgcolor: '#fff' }}>
        <Box sx={{ overflowX: 'auto' }}>
          {loading ? (
            <Box sx={{ py: 12, textAlign: 'center' }}>
              <CircularProgress size={56} sx={{ color: '#ff1493' }} />
              <Typography sx={{ mt: 3, fontWeight: 600, color: '#666', fontSize: '1.1rem' }}>
                Loading repair requests...
              </Typography>
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ py: 12, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#999', fontWeight: 500 }}>
                No repair requests found.
              </Typography>
            </Box>
          ) : (
            <Table sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#000' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', py: 2.5, pl: 4 }}>CLIENT</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', py: 2.5 }}>PHONE</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', py: 2.5 }}>DEVICE</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', py: 2.5 }}>ISSUE</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', py: 2.5 }}>STATUS</TableCell>
                  <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', py: 2.5, pr: 4 }}>
                    ACTION
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((r, index) => {
                  const config = getStatusConfig(r.status);
                  return (
                    <TableRow
                      key={r.id}
                      sx={{
                        bgcolor: index % 2 === 0 ? '#fff' : '#f8f8f8',
                        borderBottom: '1px solid #eee',
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, py: 3, pl: 4 }}>
                        {r.client_name || '—'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, py: 3 }}>
                        <Chip
                          label={r.client_phone}
                          size="small"
                          sx={{ bgcolor: '#fff0f8', color: '#d81b60', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 3, color: '#d81b60' }}>
                        {r.device_type}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 320, whiteSpace: 'pre-wrap', py: 3, color: '#444' }}>
                        {r.issue_description}
                      </TableCell>

                      {/* Status Selector */}
                      <TableCell sx={{ py: 3 }}>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={r.status}
                            onChange={(e) => updateStatus(r.id, e.target.value)}
                            sx={{
                              bgcolor: config.bg,
                              color: config.color,
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              '& .MuiSelect-select': {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              },
                            }}
                            startAdornment={config.icon}
                          >
                            {STATUS_OPTIONS.map((s) => {
                              const optConfig = getStatusConfig(s);
                              return (
                                <MenuItem key={s} value={s} sx={{ fontWeight: 600 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {optConfig.icon}
                                    {optConfig.label}
                                  </Box>
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </TableCell>

                      {/* WhatsApp Action */}
                      <TableCell align="center" sx={{ py: 3, pr: 4 }}>
                        <Tooltip title="Open WhatsApp Chat" arrow>
                          <IconButton
                            onClick={() =>
                              window.open(
                                `https://wa.me/${r.client_phone.replace(/^0/, '254')}?text=Hello ${encodeURIComponent(
                                  r.client_name
                                )},%0A%0ARegarding your *${r.device_type}* repair:%0A_%0A*Issue:* ${encodeURIComponent(
                                  r.issue_description
                                )}%0A%0AWe are ${r.status === 'PENDING' ? 'reviewing' : 'working on'} your request. Any updates will be sent here.%0A%0AThank you,%0A*CloudTech Support*`,
                                '_blank'
                              )
                            }
                            sx={{
                              bgcolor: '#25d366',
                              color: '#fff',
                              width: 48,
                              height: 48,
                              '&:hover': { bgcolor: '#1ebe57' },
                            }}
                          >
                            <WhatsApp />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.type}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            fontWeight: 600,
            fontSize: '1rem',
            bgcolor: snackbar.type === 'success' ? '#4caf50' : snackbar.type === 'error' ? '#f44336' : '#ff8f00',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}