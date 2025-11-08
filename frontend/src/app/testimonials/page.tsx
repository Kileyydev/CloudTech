// src/app/testimonials/page.tsx
'use client';

import {
  Box,
  Typography,
  Card,
  CardContent,
  Rating,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Snackbar,
  MenuItem,
  Container,
  Stack,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TopNavBar from '@/app/components/TopNavBar';
import MainNavBar, { navCategories } from '@/app/components/MainNavBar';
import TickerBar from '@/app/components/TickerBar';
import { useState, useEffect, useRef } from 'react';

const API_ENDPOINT = 'https://api.cloudtechstore.net/api/testimonials/';
const MEDIA_BASE = 'https://api.cloudtechstore.net';

type Testimonial = {
  id: number;
  name: string;
  product: string;
  experience: string;
  rating: number;
  image?: string;
  is_approved: boolean;
};

export default function TestimonialsPage() {
  const [formData, setFormData] = useState({
    category: '', product: '', experience: '', rating: '', name: '', email: '', phone: ''
  });
  const [image, setImage] = useState<File | null>(null);
  const [imageName, setImageName] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);
  const [snack, setSnack] = useState({ open: false, severity: 'success' as 'success' | 'error', msg: '' });

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [error, setError] = useState('');
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch(API_ENDPOINT);
        if (!res.ok) throw new Error('Failed to load reviews');
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.results || [];
        const approved = list.filter((t: Testimonial) => t.is_approved);
        setTestimonials(approved);
      } catch {
        setError('Could not load testimonials');
      } finally {
        setLoadingTestimonials(false);
      }
    };
    fetchTestimonials();
  }, []);

  const scrollLeft = () => sliderRef.current?.scrollBy({ left: -360, behavior: 'smooth' });
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 360, behavior: 'smooth' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
      setImageName(e.target.files[0].name);
    }
  };

  const validate = () => {
    if (!formData.category) return 'Select a category';
    if (!formData.product) return 'Enter product/service';
    if (!formData.experience) return 'Share your experience';
    if (!formData.rating) return 'Pick a rating';
    if (!formData.name) return 'Enter your name';
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) return setSnack({ open: true, severity: 'error', msg: err });

    setLoadingForm(true);
    const payload = new FormData();
    Object.entries(formData).forEach(([k, v]) => payload.append(k, v));
    if (image) payload.append('image', image);

    try {
      const res = await fetch(API_ENDPOINT, { method: 'POST', body: payload });
      if (!res.ok) throw new Error('Failed');
      setSnack({ open: true, severity: 'success', msg: 'Thank you! Under review.' });
      setFormData({ category: '', product: '', experience: '', rating: '', name: '', email: '', phone: '' });
      setImage(null);
      setImageName('');
    } catch {
      setSnack({ open: true, severity: 'error', msg: 'Try again later' });
    } finally {
      setLoadingForm(false);
    }
  };

  const ratings = [
    { v: 5, l: 'Excellent' },
    { v: 4, l: 'Good' },
    { v: 3, l: 'Average' },
    { v: 2, l: 'Poor' },
    { v: 1, l: 'Terrible' },
  ];

  return (
    <>
      
      

      <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', color: '#000000' }}>

        {/* HERO */}
        <Box sx={{ py: { xs: 6, md: 10 }, px: { xs: 2, md: 4 } }}>
          <Container maxWidth="lg">
            <Stack direction={{ xs: 'column', md: 'row-reverse' }} spacing={{ xs: 4, md: 6 }} alignItems="center">
              <Box sx={{ flex: 1, width: '100%' }}>
                <Box sx={{  bgcolor: '#000' }}>
                  <video
                    width="100%"
                    height="auto"
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ display: 'block' }}
                  >
                    <source src="/images/samsung/testimonial.mp4" type="video/mp4" />
                    Your browser does not support video.
                  </video>
                </Box>
              </Box>
              <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                <Typography sx={{ color: '#c2185b', fontWeight: 800, fontSize: { xs: '0.95rem', sm: '1.1rem' }, letterSpacing: '0.2em', mb: 1 }}>
                  REAL PEOPLE • REAL STORIES
                </Typography>
                <Typography sx={{ fontWeight: 900, fontSize: { xs: '2.3rem', sm: '3.2rem', md: '3.8rem' }, lineHeight: 1.05, mb: 3 }}>
                  What Our Customers Say
                </Typography>
                <Typography sx={{ fontSize: { xs: '1.05rem', md: '1.25rem' }, lineHeight: 1.8, color: '#333333' }}>
                  Over <strong>10,000</strong> customers trust CloudTech for phones, repairs, laptops and accessories.
                  Your honest review helps others shop with confidence.
                </Typography>
              </Box>
            </Stack>
          </Container>
        </Box>

        {/* REVIEW FORM */}
        <Box sx={{ py: { xs: 7, md: 11 }, px: { xs: 2, md: 4 }, bgcolor: '#ffffff' }}>
          <Container maxWidth="md">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography sx={{ fontWeight: 900, color: '#c2185b', fontSize: { xs: '2rem', sm: '2.6rem' }, mb: 2 }}>
                Share Your Story
              </Typography>
              <Typography sx={{ fontSize: '1.15rem', color: '#444444' }}>
                Takes <strong>60 seconds</strong>. Add a photo of your purchase or repair.
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={submit}
              sx={{
                bgcolor: '#ffffff',
                p: { xs: 4, sm: 6 },
              
                maxWidth: 720,
                mx: 'auto',
              }}
            >
              <Stack spacing={4}>
                <TextField select label="Category" name="category" value={formData.category} onChange={handleChange} fullWidth variant="outlined">
                  {navCategories.map((c) => <MenuItem key={c} value={c} sx={{ fontWeight: 600 }}>{c}</MenuItem>)}
                </TextField>

                <TextField label="Product / Service" name="product" placeholder="e.g. iPhone 16 Pro Max" value={formData.product} onChange={handleChange} fullWidth variant="outlined" />

                <TextField label="Your Experience" name="experience" placeholder="Tell us everything..." value={formData.experience} onChange={handleChange} multiline rows={5} fullWidth variant="outlined" />

                <TextField select label="Rating" name="rating" value={formData.rating} onChange={handleChange} fullWidth variant="outlined">
                  {ratings.map((r) => (
                    <MenuItem key={r.v} value={r.v} sx={{ fontWeight: 600 }}>
                      {'★'.repeat(r.v)}{'☆'.repeat(5 - r.v)} {r.l}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField label="Your Name" name="name" value={formData.name} onChange={handleChange} fullWidth variant="outlined" />

                <TextField label="Email (optional)" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth variant="outlined" />

                <TextField label="Phone (optional)" name="phone" value={formData.phone} onChange={handleChange} fullWidth variant="outlined" />

                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                  fullWidth
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                   
                    color: '#000000',
                    bgcolor: '#ffffff',
                  }}
                >
                  Upload Photo / Video
                  <input type="file" hidden accept="image/*,video/*" onChange={handleImage} />
                </Button>
                {imageName && (
                  <Typography sx={{ color: '#2e7d32', fontWeight: 600, textAlign: 'center', fontSize: '1.05rem' }}>
                    Uploaded: {imageName}
                  </Typography>
                )}

                <Button
                  type="submit"
                  disabled={loadingForm}
                  fullWidth
                  sx={{
                    py: 2.5,
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    bgcolor: '#c2185b',
                    color: '#ffffff',
                  
                  }}
                >
                  {loadingForm ? 'Submitting...' : 'SUBMIT REVIEW'}
                </Button>
              </Stack>
            </Box>
          </Container>
        </Box>

        {/* TESTIMONIALS SLIDER */}
        <Box sx={{ py: { xs: 7, md: 11 }, px: { xs: 1, md: 2 } }}>
          <Container maxWidth="lg">
            <Typography sx={{ textAlign: 'center', fontWeight: 900, color: '#c2185b', fontSize: { xs: '2.1rem', sm: '2.8rem' }, mb: 7 }}>
              Customer Reviews
            </Typography>

            {loadingTestimonials ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress size={60} sx={{ color: '#c2185b' }} />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
                {error}
              </Alert>
            ) : testimonials.length === 0 ? (
              <Typography sx={{ textAlign: 'center', fontStyle: 'italic', color: '#555555', fontSize: '1.25rem', py: 8 }}>
                No reviews yet. <strong>Be the first</strong> to share your experience.
              </Typography>
            ) : (
              <Box sx={{ position: 'relative' }}>
                <Box
                  ref={sliderRef}
                  sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: 4,
                    py: 2,
                    px: 1,
                    '&::-webkit-scrollbar': { display: 'none' },
                    scrollbarWidth: 'none',
                  }}
                >
                  {testimonials.map((t) => (
                    <Card
                      key={t.id}
                      sx={{
                        minWidth: { xs: 300, sm: 340, md: 380 },
                        maxWidth: 400,
                        flex: '0 0 auto',
                        
                        bgcolor: '#ffffff',
                      }}
                    >
                      {t.image && (
                        <Box sx={{ height: 190, overflow: 'hidden' }}>
                          <img
                            src={t.image.startsWith('http') ? t.image : `${MEDIA_BASE}${t.image}`}
                            alt={t.product}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Box>
                      )}
                      <CardContent sx={{ p: 3.5 }}>
                        <Typography sx={{ fontStyle: 'italic', mb: 3, color: '#333333', lineHeight: 1.75, fontSize: '1.05rem' }}>
                          "{t.experience}"
                        </Typography>
                        <Typography sx={{ fontWeight: 700, mb: 1.5, color: '#000000', fontSize: '1.1rem' }}>
                          — {t.name || 'Anonymous'}
                        </Typography>
                        <Rating value={t.rating} readOnly size="small" sx={{ mb: 2 }} />
                        <Typography sx={{ fontWeight: 800, color: '#c2185b', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.95rem' }}>
                          {t.product}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>

                <IconButton
                  onClick={scrollLeft}
                  sx={{
                    position: 'absolute',
                    left: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: '#000000',
                    color: '#ffffff',
                    width: 64,
                    height: 64,
                   
                  }}
                >
                  <ArrowBackIcon fontSize="large" />
                </IconButton>
                <IconButton
                  onClick={scrollRight}
                  sx={{
                    position: 'absolute',
                    right: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: '#000000',
                    color: '#ffffff',
                    width: 64,
                    height: 64,
                 
                  }}
                >
                  <ArrowForwardIcon fontSize="large" />
                </IconButton>
              </Box>
            )}
          </Container>
        </Box>

        <Snackbar
          open={snack.open}
          autoHideDuration={5000}
          onClose={() => setSnack({ ...snack, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snack.severity} sx={{ width: '100%', fontWeight: 600 }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}