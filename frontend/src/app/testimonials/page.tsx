'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import TopNavBar from '../components/TopNavBar';
import MainNavBar, { navCategories } from '../components/MainNavBar';
import Footer from '../components/FooterSection';
import TickerBar from '../components/TickerBar';

const API_ENDPOINT =
  `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '')}/testimonials/` ||
  'https://api.cloudtechstore.net/api/testimonials/';


export default function TestimonialsPage() {
  const [formData, setFormData] = useState({
    category: '',
    product: '',
    experience: '',
    rating: '',
    name: '',
    email: '',
    phone: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; severity: 'success' | 'error'; msg: string }>({
    open: false,
    severity: 'success',
    msg: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setImage(e.target.files[0]);
  };

  const validate = () => {
    if (!formData.category) return 'Please select a category.';
    if (!formData.product.trim()) return 'Please enter product/service name.';
    if (!formData.experience.trim()) return 'Please share your experience.';
    if (!formData.rating) return 'Please select a rating.';
    if (!formData.name.trim()) return 'Please enter your name.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) return setSnack({ open: true, severity: 'error', msg: err });

    setLoading(true);
    try {
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, value]) => formPayload.append(key, value));
      if (image) formPayload.append('image', image);

      const res = await fetch(API_ENDPOINT, { method: 'POST', body: formPayload });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to submit testimonial');
      }

      setSnack({ open: true, severity: 'success', msg: 'Thank you! Your testimonial has been submitted for review.' });
      setFormData({ category: '', product: '', experience: '', rating: '', name: '', email: '', phone: '' });
      setImage(null);
    } catch (error: any) {
      setSnack({ open: true, severity: 'error', msg: error.message || 'Submission failed' });
    } finally {
      setLoading(false);
    }
  };

  const ratings = [
    { value: 5, label: '⭐⭐⭐⭐⭐ Excellent' },
    { value: 4, label: '⭐⭐⭐⭐ Good' },
    { value: 3, label: '⭐⭐⭐ Average' },
    { value: 2, label: '⭐⭐ Poor' },
    { value: 1, label: '⭐ Terrible' },
  ];

  return (
    <>
    <TickerBar/>
      <TopNavBar />
      <MainNavBar />

      <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', py: { xs: 4, md: 8 }, px: { xs: 2, sm: 4, md: 6, lg: 8 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="body1" sx={{ color: '#555', mb: 5, textAlign: 'center', maxWidth: { xs: '100%', sm: 600, md: 700 }, lineHeight: 1.6 }}>
          We’d love to hear from you! Please tell us about your experience with our products or services — your words help others choose with confidence.
        </Typography>

        <Card sx={{ width: '100%', maxWidth: 800, backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 0 }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
              <TextField select label="Product Category" name="category" value={formData.category} onChange={handleChange} required fullWidth>
                {navCategories.map((option, index) => (
                  <MenuItem key={index} value={option}>{option}</MenuItem>
                ))}
              </TextField>

              <TextField label="Product Name or Service" name="product" placeholder="e.g. iPhone 15 Pro Max" value={formData.product} onChange={handleChange} required fullWidth />

              <TextField label="Your Experience" name="experience" placeholder="Tell us how your experience was..." value={formData.experience} onChange={handleChange} multiline rows={4} required fullWidth />

              <TextField select label="Overall Rating" name="rating" value={formData.rating} onChange={handleChange} required fullWidth>
                {ratings.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </TextField>

              <TextField label="Your Name" name="name" value={formData.name} onChange={handleChange} required fullWidth />
              <TextField label="Email (optional)" name="email" value={formData.email} onChange={handleChange} fullWidth />
              <TextField label="Phone (optional)" name="phone" value={formData.phone} onChange={handleChange} fullWidth />

              <Button variant="outlined" component="label" sx={{ borderColor: '#db1b88', color: '#db1b88', textTransform: 'none', '&:hover': { borderColor: '#b1166f', color: '#b1166f' } }}>
                {image ? `Selected: ${image.name}` : 'Upload an Image (optional)'}
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </Button>

              <Divider sx={{ my: 2 }} />

              <Button type="submit" variant="contained" endIcon={<Send />} sx={{ backgroundColor: '#db1b88', color: '#fff', '&:hover': { backgroundColor: '#b1166f' } }} disabled={loading}>
                {loading ? 'Sending...' : 'Submit Testimonial'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Snackbar open={snack.open} onClose={() => setSnack((s) => ({ ...s, open: false }))} autoHideDuration={4000}>
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
    </>
  );
}
