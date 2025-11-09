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
  Chip,
  Paper,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { useCart } from '@/app/components/cartContext';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE + '/products/';

// ———————————————————— STYLED COMPONENTS ————————————————————

const PageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(6),
  padding: theme.spacing(6),
  minHeight: '100vh',
  backgroundColor: '#ffffff',
  [theme.breakpoints.down('lg')]: {
    padding: theme.spacing(4),
  },
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    padding: theme.spacing(3),
  },
}));

const GalleryContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  maxWidth: 560,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const MainImageWrapper = styled(Paper)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  backgroundColor: '#fff',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& img': {
    width: '100%',
    height: 'auto',
    maxHeight: 480,
    objectFit: 'contain',
    borderRadius: 12,
    transition: 'transform 0.3s ease',
  },
  '&:hover img': {
    transform: 'scale(1.02)',
  },
}));

const ThumbGrid = styled(Stack)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: theme.spacing(1.5),
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
}));

const Thumb = styled(Card)<{ selected: boolean }>(({ theme, selected }) => ({
  width: '100%',
  aspectRatio: '1',
  border: selected ? `3px solid #DC1A8A` : `2px solid #e0e0e0`,
  cursor: 'pointer',
  overflow: 'hidden',
  borderRadius: 12,
  transition: 'all 0.2s ease',
  boxShadow: selected ? '0 0 0 2px rgba(220, 26, 138, 0.2)' : 'none',
  '&:hover': {
    borderColor: '#DC1A8A',
    boxShadow: '0 4px 12px rgba(220, 26, 138, 0.15)',
  },
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
}));

const DetailsContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
  minWidth: 0,
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '2.2rem',
  color: '#000000',
  lineHeight: 1.2,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.8rem',
  },
}));

const BrandChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#f5f5f5',
  color: '#000',
  fontWeight: 600,
  height: 32,
  fontSize: '0.875rem',
}));

const Description = styled(Typography)(({ theme }) => ({
  color: '#444',
  lineHeight: 1.7,
  fontSize: '1rem',
}));

const PriceBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
}));

const CurrentPrice = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '2.2rem',
  color: '#DC1A8A',
}));

const OriginalPrice = styled(Typography)(({ theme }) => ({
  fontSize: '1.3rem',
  color: '#888',
  textDecoration: 'line-through',
}));

const DiscountBadge = styled(Chip)(({ theme }) => ({
  backgroundColor: '#DC1A8A',
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.875rem',
}));

const AddToCartButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#000000',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: '1.1rem',
  padding: theme.spacing(1.8, 5),
  borderRadius: 12,
  textTransform: 'none',
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
  '&:hover': {
    backgroundColor: '#DC1A8A',
    boxShadow: '0 8px 20px rgba(220, 26, 138, 0.3)',
    transform: 'translateY(-1px)',
  },
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(1.5),
  },
}));

const SelectWrapper = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: '#fafafa',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#DC1A8A',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#DC1A8A',
  },
}));

// ———————————————————— MAIN COMPONENT ————————————————————

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
        if (data.cover_image) {
          setSelectedImage(data.cover_image.url || data.cover_image);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <Typography variant="h6" color="text.secondary">
          Loading product...
        </Typography>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box textAlign="center" py={12}>
        <Typography variant="h5" color="error">
          Product not found
        </Typography>
      </Box>
    );
  }

  const price = product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const handleAddToCart = () => {
    if (product.ram_options?.length > 0 && !ram) {
      showAlert('Please select a RAM option', 'error');
      return;
    }
    if (product.storage_options?.length > 0 && !storage) {
      showAlert('Please select a storage option', 'error');
      return;
    }
    if (product.colors?.length > 0 && !color) {
      showAlert('Please select a color', 'error');
      return;
    }

    const success = addToCart({
      id: product.id,
      title: product.title,
      price,
      quantity: 1,
      stock: product.stock || 99,
      cover_image: product.cover_image?.url || product.cover_image || '',
      selectedOptions: { ram, storage, color },
    });

    showAlert(
      success
        ? 'Added to cart successfully!'
        : 'Failed to add. Check stock or try again.',
      success ? 'success' : 'error'
    );
  };

  const showAlert = (msg: string, severity: 'success' | 'error') => {
    setAlertMsg(msg);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const allImages = [
    { id: 'cover', image: product.cover_image },
    ...(product.images || []),
  ];

  return (
    <PageContainer>
      {/* —————— LEFT: IMAGE GALLERY —————— */}
      <GalleryContainer>
        <Zoom zoomMargin={40}>
          <MainImageWrapper elevation={0}>
            <img
              src={selectedImage || '/placeholder.png'}
              alt={product.title}
            />
          </MainImageWrapper>
        </Zoom>

        {allImages.length > 1 && (
          <ThumbGrid>
            {allImages.map((img: any) => {
              const imgUrl = img.image?.url || img.image;
              const isSelected = selectedImage === imgUrl;
              return (
                <Thumb
                  key={img.id || imgUrl}
                  selected={isSelected}
                  onClick={() => setSelectedImage(imgUrl)}
                >
                  <img src={imgUrl} alt="Thumbnail" />
                </Thumb>
              );
            })}
          </ThumbGrid>
        )}
      </GalleryContainer>

      {/* —————— RIGHT: PRODUCT DETAILS —————— */}
      <DetailsContainer>
        <Box>
          <Title>{product.title}</Title>
          {product.brand && (
            <Box mt={1}>
              <BrandChip label={`Brand: ${product.brand.name}`} />
            </Box>
          )}
        </Box>

        <Divider sx={{ borderColor: '#eee' }} />

        <Description>{product.description || 'No description available.'}</Description>

        {/* —————— CONFIGURATION OPTIONS —————— */}
        <Stack spacing={3}>
          {product.ram_options?.length > 0 && (
            <SelectWrapper fullWidth>
              <InputLabel>RAM</InputLabel>
              <Select value={ram} label="RAM" onChange={(e) => setRam(e.target.value)}>
                {product.ram_options.map((r: any) => (
                  <MenuItem key={r.id} value={r.value}>
                    {r.value}
                  </MenuItem>
                ))}
              </Select>
            </SelectWrapper>
          )}

          {product.storage_options?.length > 0 && (
            <SelectWrapper fullWidth>
              <InputLabel>Storage</InputLabel>
              <Select value={storage} label="Storage" onChange={(e) => setStorage(e.target.value)}>
                {product.storage_options.map((s: any) => (
                  <MenuItem key={s.id} value={s.value}>
                    {s.value}
                  </MenuItem>
                ))}
              </Select>
            </SelectWrapper>
          )}

          {product.colors?.length > 0 && (
            <SelectWrapper fullWidth>
              <InputLabel>Color</InputLabel>
              <Select value={color} label="Color" onChange={(e) => setColor(e.target.value)}>
                {product.colors.map((c: any) => (
                  <MenuItem key={c.id} value={c.value}>
                    {c.value}
                  </MenuItem>
                ))}
              </Select>
            </SelectWrapper>
          )}
        </Stack>

        {/* —————— PRICING —————— */}
        <PriceBox>
          <CurrentPrice>KES {price.toLocaleString()}</CurrentPrice>
          {product.discount > 0 && (
            <>
              <OriginalPrice>KES {product.price.toLocaleString()}</OriginalPrice>
              <DiscountBadge label={`-${product.discount}%`} />
            </>
          )}
        </PriceBox>

        {/* —————— ADD TO CART —————— */}
        <AddToCartButton
          variant="contained"
          size="large"
          startIcon={<AddShoppingCartIcon />}
          onClick={handleAddToCart}
          fullWidth
          sx={{ mt: 2 }}
        >
          Add to Cart
        </AddToCartButton>

        {product.stock < 10 && product.stock > 0 && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            ⚡ Only {product.stock} left in stock!
          </Typography>
        )}
      </DetailsContainer>

      {/* —————— SNACKBAR ALERT —————— */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          icon={alertSeverity === 'success' ? <CheckCircleOutlineIcon /> : undefined}
          severity={alertSeverity}
          variant="filled"
          sx={{
            borderRadius: 3,
            fontWeight: 600,
            backgroundColor: alertSeverity === 'success' ? '#000' : undefined,
            color: '#fff',
          }}
        >
          {alertMsg}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
}