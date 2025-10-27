'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Phone, Email, LocationOn, Send } from '@mui/icons-material';
import TopNavBar from '../components/TopNavBar';
import MainNavBar from '../components/MainNavBar';
import Footer from '../components/FooterSection';

/**
 * Configure these:
 * - API_ENDPOINT: where your DRF endpoint accepts POST (create) for contact messages
 *   e.g. http://localhost:8000/api/contact-messages/
 * - GOOGLE_MAP_KEY: your Google Maps Embed API key (or leave placeholder)
 */
const API_ENDPOINT = 'http://localhost:8000/api/contact-messages/';
const GOOGLE_MAP_KEY = 'YOUR_API_KEY';

export default function ContactUsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; severity: 'success' | 'error'; msg: string }>({
    open: false,
    severity: 'success',
    msg: '',
  });

  const contactInfo = [
    { icon: <Phone />, text: '+1-800-555-1234', label: 'Phone' },
    { icon: <Email />, text: 'support@yourstore.com', label: 'Email' },
    { icon: <LocationOn />, text: '123 Tech Street, Nairobi, Kenya', label: 'Address' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!formData.name.trim()) return 'Please enter your name.';
    if (!formData.email.trim()) return 'Please enter your email.';
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.email)) return 'Please enter a valid email address.';
    if (!formData.message.trim()) return 'Please enter a message.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const err = validate();
    if (err) {
      setSnack({ open: true, severity: 'error', msg: err });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      };

      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let text = await res.text();
        try {
          const json = JSON.parse(text);
          if (json.detail) text = json.detail;
        } catch {
          /* ignore */
        }
        throw new Error(text || `Server responded with ${res.status}`);
      }

      setSnack({ open: true, severity: 'success', msg: "Message sent — we'll be in touch!" });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact submit error:', error);
      setSnack({
        open: true,
        severity: 'error',
        msg:
          typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message?: unknown }).message)
            : 'Failed to send message. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnack = () => setSnack((s) => ({ ...s, open: false }));

  return (
    <>
      <TopNavBar />
      <MainNavBar />

      <Box sx={{ px: { xs: 2, md: 8 }, py: { xs: 4, md: 8 }, backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: '#db1b88',
            textAlign: 'center',
            mb: 6,
            fontSize: { xs: '2rem', md: '3rem' },
          }}
        >
          Contact Us
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: theme.spacing(4), // Matches original Grid spacing={4}
            alignItems: 'stretch',
            '& > *': {
              flex: {
                xs: '1 1 100%', // Full width on xs
                md: '1 1 calc(50% - 32px)', // Two columns on md+
              },
              minWidth: 0,
            },
          }}
        >
          {/* LEFT: FORM */}
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: { xs: 3, md: 5 },
              boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
              borderRadius: 3,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#db1b88', mb: 4, textAlign: 'center' }}>
              Send Us a Message
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
                disabled={loading}
                inputProps={{ maxLength: 255 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#db1b88' },
                    '&:hover fieldset': { borderColor: '#b1166f' },
                    '&.Mui-focused fieldset': { borderColor: '#db1b88' },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
                disabled={loading}
                inputMode="email"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#db1b88' },
                    '&:hover fieldset': { borderColor: '#b1166f' },
                    '&.Mui-focused fieldset': { borderColor: '#db1b88' },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Subject (optional)"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                variant="outlined"
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#db1b88' },
                    '&:hover fieldset': { borderColor: '#b1166f' },
                    '&.Mui-focused fieldset': { borderColor: '#db1b88' },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                multiline
                rows={6}
                variant="outlined"
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#db1b88' },
                    '&:hover fieldset': { borderColor: '#b1166f' },
                    '&.Mui-focused fieldset': { borderColor: '#db1b88' },
                  },
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Send />}
                  sx={{
                    backgroundColor: '#db1b88',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1.8,
                    px: 4,
                    '&:hover': { backgroundColor: '#b1166f' },
                  }}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </Box>
            </Box>
          </Card>

          {/* RIGHT: MAP + CONTACT INFO */}
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ width: '100%', height: isMobile ? 300 : 500 }}>
              <iframe
                title="map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAP_KEY}&q=Nairobi,Kenya`}
              ></iframe>
            </Box>

            <CardContent sx={{ backgroundColor: '#fdfdfd', flexGrow: 1 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                Our Branch
              </Typography>

              <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
                We have a single branch located in the Central Business District (CBD).
              </Typography>

              {contactInfo.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconButton sx={{ color: '#db1b88', mr: 2 }}>{item.icon}</IconButton>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#000' }}>
                      {item.text}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={4500} onClose={handleCloseSnack}>
        <Alert onClose={handleCloseSnack} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}