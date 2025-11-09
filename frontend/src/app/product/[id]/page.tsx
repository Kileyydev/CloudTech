'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  MenuItem,
  Select,
  Button,
  Divider,
  Card,
  CardMedia,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled } from '@mui/system';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { useCart } from '@/app/components/cartContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE + '/products/';

/* ---------------- STYLED COMPONENTS ---------------- */
const PageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(6),
  padding: theme.spacing(4),
  minHeight: '100vh',
  background: '#f8f9fa',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

const GalleryContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const ThumbContainer = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
}));

const Thumb = styled(Card)(({ theme }) => ({
  width: 80,
  height: 80,
  border: '2px solid #ddd',
  cursor: 'pointer',
  '&:hover': { borderColor: '#DC1A8A' },
  overflow: 'hidden',
  borderRadius: 6,
  '& img': { width: '100%', height: '100%', objectFit: 'cover' },
}));

const DetailsContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const PriceText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.6rem',
  color: '#DC1A8A',
}));

/* ---------------- PAGE COMPONENT ---------------- */
export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [ram, setRam] = useState('');
  const [storage, setStorage] = useState('');
  const [color, setColor] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');

  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(API_BASE + params.id + '/');
        const data = await res.json();
        setProduct(data);
        if (data.cover_image) setSelectedImage(data.cover_image.url || data.cover_image);
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.id]);

  if (loading) return <Typography textAlign="center" py={10}>Loading...</Typography>;
  if (!product) return <Typography textAlign="center" py={10}>Product not found</Typography>;

  const price =
    product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : product.price;

  const handleAddToCart = () => {
    if (product.ram_options?.length > 0 && !ram) {
      setAlertMsg('Please select RAM option');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }
    if (product.storage_options?.length > 0 && !storage) {
      setAlertMsg('Please select Storage option');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }
    if (product.colors?.length > 0 && !color) {
      setAlertMsg('Please select Color option');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }

    const success = addToCart({
      id: product.id,
      title: product.title,
      price,
      quantity: 1,
      stock: product.stock || 99,
      cover_image: product.cover_image?.url || product.cover_image || '',
    });

    if (success) {
      setAlertMsg('Added to cart successfully!');
      setAlertSeverity('success');
      setAlertOpen(true);
    } else {
      setAlertMsg('Failed to add to cart. Check stock or quantity.');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  return (
    <PageContainer>
      {/* ---------------- LEFT: GALLERY & ZOOM ---------------- */}
      <GalleryContainer>
        <Zoom>
          <img
            src={selectedImage || '/placeholder.png'}
            alt={product.title}
            style={{
              width: '100%',
              height: 400,
              objectFit: 'contain',
              borderRadius: 6,
              display: 'block',
            }}
          />
        </Zoom>
        <ThumbContainer>
          {product.images?.map((img: any) => (
            <Thumb
              key={img.id}
              onClick={() => setSelectedImage(img.image.url || img.image)}
            >
              <img src={img.image.url || img.image} alt={product.title} />
            </Thumb>
          ))}
        </ThumbContainer>
      </GalleryContainer>

      {/* ---------------- RIGHT: DETAILS ---------------- */}
      <DetailsContainer>
        <Typography variant="h4" fontWeight={700}>
          {product.title}
        </Typography>
        {product.brand && (
          <Typography variant="subtitle1" color="text.secondary">
            Brand: {product.brand.name}
          </Typography>
        )}

        <Divider />

        <Typography variant="body1">{product.description}</Typography>

        {/* OPTIONS */}
        <Stack spacing={2}>
          {product.ram_options?.length > 0 && (
            <FormControl fullWidth>
              <InputLabel>RAM</InputLabel>
              <Select value={ram} onChange={(e) => setRam(e.target.value)}>
                {product.ram_options.map((r: any) => (
                  <MenuItem key={r.id} value={r.value}>
                    {r.value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {product.storage_options?.length > 0 && (
            <FormControl fullWidth>
              <InputLabel>Storage</InputLabel>
              <Select value={storage} onChange={(e) => setStorage(e.target.value)}>
                {product.storage_options.map((s: any) => (
                  <MenuItem key={s.id} value={s.value}>
                    {s.value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {product.colors?.length > 0 && (
            <FormControl fullWidth>
              <InputLabel>Color</InputLabel>
              <Select value={color} onChange={(e) => setColor(e.target.value)}>
                {product.colors.map((c: any) => (
                  <MenuItem key={c.id} value={c.value}>
                    {c.value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>

        {/* PRICE */}
        <Box mt={3}>
          <PriceText>KES {price.toLocaleString()}</PriceText>
        </Box>

        {/* ADD TO CART BUTTON */}
        <Button
          variant="contained"
          color="secondary"
          size="large"
          sx={{ mt: 2, px: 4, py: 1.5, borderRadius: 2 }}
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>
      </DetailsContainer>

      {/* ---------------- ALERT SNACKBAR ---------------- */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={alertSeverity} onClose={() => setAlertOpen(false)}>
          {alertMsg}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
}
