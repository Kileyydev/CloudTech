'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Container,
  Chip,
  Divider,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import { ExpandMore, CheckCircle, Cancel, UploadFile, Phone, Mail, LocationOn } from '@mui/icons-material';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// Environment Variables
const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
const CLOUDINARY_BASE = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

// FAQ Data
const faqs = [
  { q: 'How long does a screen replacement take?', a: 'Most screen replacements are completed within 30–45 minutes.' },
  { q: 'Do you use original parts?', a: 'Yes, we use high-quality OEM-grade parts with a 90-day warranty.' },
  { q: 'What is your warranty policy?', a: 'All repairs come with a 90-day warranty on parts and labor.' },
  { q: 'Can I track my repair status?', a: 'Yes! You’ll receive SMS and email updates at every stage.' },
  { q: 'Do you offer pickup and delivery?', a: 'Yes, available in Nairobi for KSh 300–500 depending on location.' },
];

// Repair Pricing Data
const repairPricing = [
  { model: 'iPhone 11', screen: 'KSh 4,500', battery: 'KSh 2,800' },
  { model: 'iPhone 11 Pro', screen: 'KSh 6,500', battery: 'KSh 3,200' },
  { model: 'iPhone 11 Pro Max', screen: 'KSh 7,500', battery: 'KSh 3,500' },
  { model: 'iPhone 12', screen: 'KSh 7,800', battery: 'KSh 3,800' },
  { model: 'iPhone 12 Pro', screen: 'KSh 9,500', battery: 'KSh 4,200' },
  { model: 'iPhone 12 Pro Max', screen: 'KSh 11,000', battery: 'KSh 4,500' },
  { model: 'iPhone 13', screen: 'KSh 9,800', battery: 'KSh 4,200' },
  { model: 'iPhone 13 Pro', screen: 'KSh 12,500', battery: 'KSh 4,800' },
  { model: 'iPhone 13 Pro Max', screen: 'KSh 14,000', battery: 'KSh 5,200' },
  { model: 'iPhone 14', screen: 'KSh 12,800', battery: 'KSh 5,000' },
  { model: 'iPhone 14 Pro', screen: 'KSh 16,500', battery: 'KSh 5,800' },
  { model: 'iPhone 14 Pro Max', screen: 'KSh 18,500', battery: 'KSh 6,200' },
  { model: 'iPhone 15', screen: 'KSh 15,500', battery: 'KSh 5,800' },
  { model: 'iPhone 15 Pro', screen: 'KSh 19,800', battery: 'KSh 6,800' },
  { model: 'iPhone 15 Pro Max', screen: 'KSh 22,500', battery: 'KSh 7,500' },
  { model: 'iPhone 16', screen: 'KSh 18,000', battery: 'KSh 6,500' },
  { model: 'iPhone 16 Pro', screen: 'KSh 23,500', battery: 'KSh 7,800' },
  { model: 'iPhone 16 Pro Max', screen: 'KSh 27,000', battery: 'KSh 8,500' },
];

export default function RepairPage() {
  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    device_type: '',
    issue_description: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [tabValue, setTabValue] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
      setUploadStatus('idle');
    } else {
      setImages([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setUploadStatus('uploading');

    try {
      const { data: repair } = await axios.post(`${API_BASE}/fixrequests/repairs/`, form);

      let imageUrls: string[] = [];
      if (images.length > 0) {
        const uploadPromises = images.map((img) => {
          const formData = new FormData();
          formData.append('file', img);
          formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
          return axios.post(CLOUDINARY_BASE, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        });

        const uploadResults = await Promise.all(uploadPromises);
        imageUrls = uploadResults.map((res) => res.data.secure_url);
      }

      if (imageUrls.length > 0) {
        await axios.post(`${API_BASE}/fixrequests/repairs/${repair.id}/upload_images/`, {
          images: imageUrls,
        });
      }

      setUploadStatus('success');
      alert('Repair request submitted successfully! We’ll contact you shortly.');
      setForm({ client_name: '', client_email: '', client_phone: '', device_type: '', issue_description: '' });
      setImages([]);
    } catch (err: any) {
      console.error('Error:', err);
      setUploadStatus('error');
      alert('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setUploadStatus('idle'), 3000);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#ffffffff', // Soft pink background
        color: '#000',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      }}
    >
      {/* Header Banner */}
      <Box
        sx={{
          bgcolor: '#fff',
          color: '#000',
          py: 3,
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '1.5rem',
        }}
      >
        PREMIUM IPHONE REPAIR SERVICE
      </Box>

      {/* Hero Video Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '50vh', md: '70vh' },
          overflow: 'hidden',
          bgcolor: '#000',
        }}
      >
        <Box
          component="video"
          src="/images/samsung/repair.mp4"
          autoPlay
          loop
          muted
          playsInline
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

      </Box>

      <Container maxWidth="xl" sx={{ py: 6 }}>

        {/* Tabs for FAQ & Pricing */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={(_, v) => setTabValue(v)}
            centered
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '1.2rem',
                textTransform: 'none',
                color: '#666',
                '&.Mui-selected': { color: '#000' },
              },
              '& .MuiTabs-indicator': { bgcolor: '#000', height: 4 },
            }}
          >
            <Tab label="Frequently Asked Questions" />
            <Tab label="Repair Pricing" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ mt: 4 }}>
          {tabValue === 0 && (
            <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
              {faqs.map((faq, i) => (
                <Accordion
                  key={i}
                  sx={{
                    mb: 1,
                    bgcolor: '#fff',
                    boxShadow: 'none',
                    border: '1px solid #ddd',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: '#000' }} />}
                    sx={{
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      color: '#000',
                      bgcolor: '#f8f8f8',
                    }}
                  >
                    {faq.q}
                  </AccordionSummary>
                  <AccordionDetails sx={{ color: '#444', fontSize: '1rem', lineHeight: 1.7, bgcolor: '#fff' }}>
                    {faq.a}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}

          {tabValue === 1 && (
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #ddd' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#000' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>MODEL</TableCell>
                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                      SCREEN REPLACEMENT
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                      BATTERY REPLACEMENT
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {repairPricing.map((row, i) => (
                    <TableRow key={i} sx={{ bgcolor: i % 2 === 0 ? '#fff' : '#f8f8f8' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#000' }}>{row.model}</TableCell>
                      <TableCell align="center" sx={{ color: '#d81b60', fontWeight: 600 }}>
                        {row.screen}
                      </TableCell>
                      <TableCell align="center" sx={{ color: '#000', fontWeight: 500 }}>
                        {row.battery}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Repair Request Form */}
        <Box
          sx={{
            mt: 8,
            maxWidth: 800,
            mx: 'auto',
            p: 5,
            bgcolor: '#fff',
            border: '1px solid #ddd',
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, color: '#000', mb: 1, textAlign: 'center' }}
          >
            SUBMIT REPAIR REQUEST
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: '#666', mb: 4, textAlign: 'center', fontSize: '1.1rem' }}
          >
            We respond within 10 minutes during business hours (8 AM – 8 PM)
          </Typography>

          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <TextField
              label="FULL NAME"
              name="client_name"
              value={form.client_name}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              InputLabelProps={{ style: { fontWeight: 600, color: '#000' } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            />
            <TextField
              label="EMAIL ADDRESS"
              name="client_email"
              type="email"
              value={form.client_email}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              InputLabelProps={{ style: { fontWeight: 600, color: '#000' } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            />
            <TextField
              label="PHONE NUMBER"
              name="client_phone"
              value={form.client_phone}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              InputLabelProps={{ style: { fontWeight: 600, color: '#000' } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            />
            <TextField
              label="DEVICE MODEL"
              name="device_type"
              value={form.device_type}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              InputLabelProps={{ style: { fontWeight: 600, color: '#000' } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            />
            <TextField
              label="DESCRIBE THE ISSUE"
              name="issue_description"
              value={form.issue_description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              required
              variant="outlined"
              InputLabelProps={{ style: { fontWeight: 600, color: '#000' } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            />

            {/* File Upload */}
            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFile />}
                sx={{
                  borderColor: '#000',
                  color: '#000',
                  borderRadius: 0,
                  py: 1.8,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  width: '100%',
                }}
              >
                UPLOAD PHOTOS OR VIDEOS
                <input type="file" multiple hidden accept="image/*,video/*" onChange={handleFileChange} />
              </Button>
              <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {images.map((file, i) => (
                  <Chip
                    key={i}
                    label={file.name}
                    size="small"
                    sx={{ bgcolor: '#f8f8f8', color: '#000', fontWeight: 500 }}
                  />
                ))}
              </Box>
            </Box>

            {/* Submit Button */}
            <Box sx={{ position: 'relative' }}>
              <Button
                variant="contained"
                type="submit"
                fullWidth
                disabled={loading}
                sx={{
                  bgcolor: '#000',
                  color: '#fff',
                  py: 2.2,
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  '&:disabled': { bgcolor: '#ccc', color: '#666' },
                }}
              >
                {loading ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
              </Button>

              <AnimatePresence>
                {uploadStatus === 'uploading' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)' }}
                  >
                    <CircularProgress size={28} sx={{ color: '#fff' }} />
                  </motion.div>
                )}
                {uploadStatus === 'success' && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)' }}
                  >
                    <CheckCircle sx={{ color: '#4caf50', fontSize: 32 }} />
                  </motion.div>
                )}
                {uploadStatus === 'error' && (
                  <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)' }}
                  >
                    <Cancel sx={{ color: '#f44336', fontSize: 32 }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          </Stack>

          <Divider sx={{ my: 4, borderColor: '#ddd' }} />
        </Box>
      </Container>

      {/* Footer */}
    </Box>
  );
}