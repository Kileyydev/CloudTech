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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Snackbar,
  MenuItem,
  Fab,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import TopNavBar from '@/app/components/TopNavBar';
import MainNavBar, { navCategories } from '@/app/components/MainNavBar';
import TickerBar from '@/app/components/TickerBar';
import { useState, useEffect, useRef } from 'react';

const API_ENDPOINT = 'https://api.cloudtechstore.net/api/testimonials/';
const MEDIA_BASE = 'https://api.cloudtechstore.net'; // Adjust if needed

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
  // Form State
  const [formData, setFormData] = useState({
    category: '', product: '', experience: '', rating: '', name: '', email: '', phone: ''
  });
  const [image, setImage] = useState<File | null>(null);
  const [imageName, setImageName] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);
  const [snack, setSnack] = useState({ open: false, severity: 'success' as 'success' | 'error', msg: '' });

  // Testimonials State
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [error, setError] = useState('');
  const sliderRef = useRef<HTMLDivElement>(null);

  // Fetch Testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch(API_ENDPOINT);
        if (!res.ok) throw new Error('Failed to load reviews');
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.results || [];
        const approved = list.filter((t: Testimonial) => t.is_approved);
        setTestimonials(approved);
      } catch (err: any) {
        setError('Could not load testimonials');
      } finally {
        setLoadingTestimonials(false);
      }
    };
    fetchTestimonials();
  }, []);

  // Scroll Controls
  const scrollLeft = () => sliderRef.current?.scrollBy({ left: -320, behavior: 'smooth' });
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 320, behavior: 'smooth' });

  // Form Handlers
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
    { v: 5, l: '⭐⭐⭐⭐⭐ Excellent' },
    { v: 4, l: '⭐⭐⭐⭐ Good' },
    { v: 3, l: '⭐⭐⭐ Average' },
    { v: 2, l: '⭐⭐ Poor' },
    { v: 1, l: '⭐ Terrible' },
  ];

  const faqs = [
    { question: 'Do you publish every review?', answer: 'Only verified in-store purchases are published.' },
    { question: 'Can I stay anonymous?', answer: 'Yes, just leave your name blank.' },
    { question: 'How long until my review shows?', answer: 'Within 24 hours after verification.' },
    { question: 'Can I add a photo?', answer: 'Absolutely! Upload a clear image of the product or repair.' },
  ];

  return (
    <>
      <TickerBar />
      <TopNavBar />
      <MainNavBar />

      <Box sx={{ backgroundColor: '#fff', color: '#000', py: { xs: 4, md: 6 }, px: { xs: 2, md: 6 } }}>

        {/* HERO: VIDEO + INTRO */}
        <Box sx={{
          display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 4 }, alignItems: 'center',
          mb: 8, flexDirection: { xs: 'column', md: 'row-reverse' },
          '& > *': { flex: { xs: '1 1 100%', md: '1 1 calc(50% - 32px)' }, minWidth: 0 },
        }}>
          <Box>
            <video
              width="100%"
              height="400"
              controls
              autoPlay
              loop
              muted
              playsInline
              style={{ objectFit: 'cover' }}
            >
              <source src="/images/samsung/testimonial.mp4" type="video/mp4" />
              Your browser does not support video.
            </video>
          </Box>
          <Box sx={{ px: { xs: 1, md: 4 } }}>
            <Typography variant="h5" sx={{ color: '#db1b88', fontWeight: 700, mb: 2 }}>
              REAL PEOPLE, REAL STORIES
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              What Our Customers Say
            </Typography>
            <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8 }}>
              Over 10,000 happy customers trust Trefik for repairs, phones, laptops & accessories.
              Your review helps the next shopper choose with confidence.
            </Typography>
          </Box>
        </Box>

        {/* FORM */}
        <Box sx={{ mt: 10, py: 6, borderTop: '1px solid #eee', textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#db1b88', mb: 3 }}>
            Share Your Story
          </Typography>
          <Typography variant="body1" sx={{ mb: 5, color: '#444' }}>
            Takes 60 seconds. Upload a photo or video of your purchase/repair.
          </Typography>

          <Box component="form" onSubmit={submit} sx={{ maxWidth: 700, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField select label="Category" name="category" value={formData.category} onChange={handleChange} fullWidth>
              {navCategories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            <TextField label="Product / Service" name="product" placeholder="e.g. iPhone 16 Pro Max" value={formData.product} onChange={handleChange} fullWidth />
            <TextField label="Your Experience" name="experience" placeholder="Tell us everything..." value={formData.experience} onChange={handleChange} multiline rows={5} fullWidth />
            <TextField select label="Rating" name="rating" value={formData.rating} onChange={handleChange} fullWidth>
              {ratings.map((r) => <MenuItem key={r.v} value={r.v}>{r.l}</MenuItem>)}
            </TextField>
            <TextField label="Your Name" name="name" value={formData.name} onChange={handleChange} fullWidth />
            <TextField label="Email (optional)" name="email" value={formData.email} onChange={handleChange} fullWidth />
            <TextField label="Phone (optional)" name="phone" value={formData.phone} onChange={handleChange} fullWidth />

            <Button variant="outlined" component="label" startIcon={<PhotoCamera />} sx={{ color: '#db1b88', borderColor: '#db1b88' }}>
              Upload Photo / Video
              <input type="file" hidden accept="image/*,video/*" onChange={handleImage} />
            </Button>
            {imageName && <Typography variant="body2" color="success.main">Uploaded: {imageName}</Typography>}

            <Button
              type="submit"
              variant="contained"
              disabled={loadingForm}
              sx={{ bgcolor: '#db1b88', py: 1.5, fontSize: '1.1rem' }}
            >
              {loadingForm ? 'Submitting...' : 'SUBMIT REVIEW'}
            </Button>
          </Box>
        </Box>

        {/* DYNAMIC TESTIMONIALS SLIDER */}
        <Box sx={{ mb: 10, position: 'relative' }}>
          <Typography variant="h4" sx={{ color: '#db1b88', fontWeight: 700, textAlign: 'center', mb: 6 }}>
            Customer Reviews
          </Typography>

          {loadingTestimonials ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#db1b88' }} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mx: 'auto', maxWidth: 600 }}>{error}</Alert>
          ) : testimonials.length === 0 ? (
            <Typography sx={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
              No reviews yet. Be the first to share your story! ✨
            </Typography>
          ) : (
            <>
              <Box
                ref={sliderRef}
                sx={{
                  display: 'flex',
                  overflowX: 'auto',
                  scrollBehavior: 'smooth',
                  gap: 3,
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
                      minWidth: { xs: 280, sm: 320 },
                      maxWidth: 340,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
               
                      transition: '0.3s',

                    }}
                  >
                    {t.image && (
                      <Box sx={{ height: 160, overflow: 'hidden' }}>
                        <img
                          src={t.image.startsWith('http') ? t.image : `${MEDIA_BASE}${t.image}`}
                          alt={t.product}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                    )}
                    <CardContent sx={{ pt: t.image ? 2 : 4 }}>
                      <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2, color: '#555', lineHeight: 1.6 }}>
                        "{t.experience}"
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        — {t.name}
                      </Typography>
                      <Rating value={t.rating} readOnly size="small" />
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold', color: '#db1b88' }}>
                        {t.product}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              <IconButton onClick={scrollLeft} sx={{ position: 'absolute', left: 10, top: '45%', transform: 'translateY(-50%)', bgcolor: 'rgba(219,27,136,0.8)', color: '#fff', '&:hover': { bgcolor: '#db1b88' } }}>
                <ArrowBackIcon />
              </IconButton>
              <IconButton onClick={scrollRight} sx={{ position: 'absolute', right: 10, top: '45%', transform: 'translateY(-50%)', bgcolor: 'rgba(219,27,136,0.8)', color: '#fff', '&:hover': { bgcolor: '#db1b88' } }}>
                <ArrowForwardIcon />
              </IconButton>
            </>
          )}
        </Box>

        <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity={snack.severity}>{snack.msg}</Alert>
        </Snackbar>
      </Box>
    </>
  );
}