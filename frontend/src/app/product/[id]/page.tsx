// src/app/product/[id]/page.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Select,
  MenuItem,
  Button,
  Divider,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useCart } from '@/app/components/cartContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE + '/products/';

// ——————— ULTRA PROFESSIONAL STYLING ———————

const Container = styled(Box)(({ theme }) => ({
  maxWidth: 1400,
  margin: '0 auto',
  padding: theme.spacing(12, 4),
  backgroundColor: '#ffffff',
  minHeight: '100vh',
  [theme.breakpoints.down('lg')]: { padding: theme.spacing(10, 3) },
  [theme.breakpoints.down('md')]: { padding: theme.spacing(8, 2) },
}));

const Layout = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(10),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: theme.spacing(8),
  },
}));

const ImageSection = styled(Box)({
  flex: '0 0 52%',
  display: 'flex',
  flexDirection: 'column',
  gap: 32,
});

const MainImageWrapper = styled(Paper)({
  width: '100%',
  aspectRatio: '1 / 1',
  borderRadius: 24,
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
  backgroundColor: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
});

const ThumbnailRow = styled(Box)({
  display: 'flex',
  gap: 16,
  overflowX: 'auto',
  paddingBottom: 8,
});

const Thumb = styled(Box)<{ active: boolean }>(({ active }) => ({
  width: 110,
  height: 110,
  borderRadius: 16,
  overflow: 'hidden',
  cursor: 'pointer',
  border: active ? '3px solid #000' : '2px solid #e0e0e0',
  flexShrink: 0,
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
}));

const InfoSection = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  gap: 40,
});

const Title = styled(Typography)({
  fontSize: '3.2rem',
  fontWeight: 700,
  lineHeight: 1.1,
  color: '#000',
  letterSpacing: '-0.5px',
});

const BrandName = styled(Typography)({
  fontSize: '1.1rem',
  color: '#666',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  marginBottom: 8,
});

const PriceDisplay = styled(Box)({
  display: 'flex',
  alignItems: 'baseline',
  gap: 24,
});

const CurrentPrice = styled(Typography)({
  fontSize: '3.4rem',
  fontWeight: 700,
  color: '#000',
});

const OriginalPrice = styled(Typography)({
  fontSize: '2rem',
  color: '#999',
  textDecoration: 'line-through',
});

const Savings = styled(Chip)({
  backgroundColor: '#000',
  color: '#fff',
  fontWeight: 600,
  fontSize: '1rem',
  height: 40,
});

const SelectField = styled(Select)({
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#000',
    borderWidth: 2,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#000',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#000',
  },
  '& .MuiSelect-select': {
    padding: '16px 20px',
    fontSize: '1.1rem',
    fontWeight: 500,
  },
});

const AddToCartBtn = styled(Button)({
  backgroundColor: '#000',
  color: '#fff',
  padding: '20px 48px',
  borderRadius: 16,
  fontSize: '1.3rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: '#222',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  '&:disabled': {
    backgroundColor: '#ccc',
    color: '#999',
  },
});

const Description = styled(Typography)({
  fontSize: '1.15rem',
  lineHeight: '1.8',
  color: '#444',
  maxWidth: 680,
});

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const [color, setColor] = useState('');
  const [storage, setStorage] = useState('');
  const [ram, setRam] = useState('');

  const [snack, setSnack] = useState({ open: false, msg: '', type: 'success' as 'success' | 'error' });

  const { addToCart } = useCart();

  // Fetch product
  useEffect(() => {
    fetch(`${API_BASE}${params.id}/`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setProduct(data);
        const cover = data.cover_image?.url || data.cover_image || '/placeholder.png';
        setSelectedImage(cover);

        if (data.variants?.length > 0) {
          const first = data.variants.find((v: any) => v.is_active && v.stock > 0) || data.variants[0];
          setSelectedVariant(first);
          setColor(first.color || '');
          setStorage(first.storage || '');
          setRam(first.ram || '');
          if (first.image?.url) setSelectedImage(first.image.url);
        }
      })
      .catch(() => setSnack({ open: true, msg: 'Product not found', type: 'error' }))
      .finally(() => setLoading(false));
  }, [params.id]);

  // Update selected variant when options change
  useEffect(() => {
    if (!product?.variants?.length) return;

    const match = product.variants.find((v: any) =>
      v.is_active &&
      (!color || v.color === color) &&
      (!storage || v.storage === storage) &&
      (!ram || v.ram === ram)
    );

    if (match) {
      setSelectedVariant(match);
      if (match.image?.url) setSelectedImage(match.image.url);
    } else {
      setSelectedVariant(null);
    }
  }, [color, storage, ram, product?.variants]);

  const options = useMemo(() => {
    if (!product?.variants) return { colors: [], storages: [], rams: [] };

    return {
      colors: Array.from(new Set(product.variants.map((v: any) => v.color).filter(Boolean))) as string[],
      storages: Array.from(new Set(product.variants.map((v: any) => v.storage).filter(Boolean)))
        .filter(Boolean)
        .sort((a: any, b: any) => parseInt(a) - parseInt(b)) as string[],
      rams: Array.from(new Set(product.variants.map((v: any) => v.ram).filter(Boolean))) as string[],
    };
  }, [product?.variants]);

  const images = useMemo(() => {
    const set = new Set<string>();
    if (product?.cover_image?.url) set.add(product.cover_image.url);
    product?.images?.forEach((i: any) => {
      const url = i.image?.url || i.image;
      if (url) set.add(url);
    });
    product?.variants?.forEach((v: any) => v.image?.url && set.add(v.image.url));
    return Array.from(set);
  }, [product]);

  const price = selectedVariant
    ? selectedVariant.compare_at_price > 0
      ? selectedVariant.compare_at_price
      : selectedVariant.price
    : product?.final_price || product?.price;

  const originalPrice = selectedVariant?.price || product?.price;
  const savings = originalPrice - price;
  const inStock = selectedVariant ? selectedVariant.stock > 0 : product?.stock > 0;

  const handleAdd = () => {
    if (product.variants?.length && !selectedVariant) {
      setSnack({ open: true, msg: 'Please select all options', type: 'error' });
      return;
    }
    if (!inStock) {
      setSnack({ open: true, msg: 'Out of stock', type: 'error' });
      return;
    }

    addToCart({
      id: product.id,
      title: `${product.title}${color || storage || ram ? ` • ${color} ${ram} ${storage}`.trim() : ''}`,
      price,
      quantity: 1,
      cover_image: selectedImage,
      stock: selectedVariant?.stock || product.stock,
    });

    setSnack({ open: true, msg: 'Added to cart', type: 'success' });
  };

  if (loading) return <Box sx={{ pt: 20 }}><LinearProgress /></Box>;
  if (!product) return <Typography sx={{ pt: 20, textAlign: 'center' }}>Product not found</Typography>;

  return (
    <Container>
      <Layout>
        {/* Images */}
        <ImageSection>
          <MainImageWrapper elevation={0}>
            <img src={selectedImage} alt={product.title} />
          </MainImageWrapper>

          {images.length > 1 && (
            <ThumbnailRow>
              {images.map(img => (
                <Thumb key={img} active={selectedImage === img} onClick={() => setSelectedImage(img)}>
                  <img src={img} alt="" />
                </Thumb>
              ))}
            </ThumbnailRow>
          )}
        </ImageSection>

        {/* Details */}
        <InfoSection>
          <Box>
            <BrandName>{product.brand?.name || 'Premium Brand'}</BrandName>
            <Title>{product.title}</Title>
          </Box>

          {/* Variant Selectors */}
          {(options.colors.length > 0 || options.storages.length > 0 || options.rams.length > 0) && (
            <Stack spacing={5}>
              {options.colors.length > 0 && (
                <Box>
                  <Typography fontWeight={600} mb={1.5} fontSize="1.1rem">Color</Typography>
                  <SelectField fullWidth value={color} onChange={e => setColor(e.target.value as string)} displayEmpty>
                    <MenuItem value="" disabled>Select color</MenuItem>
                    {options.colors.map(c => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </SelectField>
                </Box>
              )}

              {options.rams.length > 0 && (
                <Box>
                  <Typography fontWeight={600} mb={1.5} fontSize="1.1rem">RAM</Typography>
                  <SelectField fullWidth value={ram} onChange={e => setRam(e.target.value as string)}>
                    {options.rams.map(r => (
                      <MenuItem key={r} value={r}>{r}</MenuItem>
                    ))}
                  </SelectField>
                </Box>
              )}

              {options.storages.length > 0 && (
                <Box>
                  <Typography fontWeight={600} mb={1.5} fontSize="1.1rem">Storage</Typography>
                  <SelectField fullWidth value={storage} onChange={e => setStorage(e.target.value as string)}>
                    {options.storages.map(s => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </SelectField>
                </Box>
              )}
            </Stack>
          )}

          {/* Price */}
          <PriceDisplay>
            <CurrentPrice>KES {price?.toLocaleString()}</CurrentPrice>
            {savings > 0 && (
              <>
                <OriginalPrice>KES {originalPrice?.toLocaleString()}</OriginalPrice>
                <Savings label={`Save KES ${savings.toLocaleString()}`} />
              </>
            )}
          </PriceDisplay>

          {selectedVariant && selectedVariant.stock < 10 && selectedVariant.stock > 0 && (
            <Typography color="#d32f2f" fontWeight={600} fontSize="1.1rem">
              Only {selectedVariant.stock} left in stock
            </Typography>
          )}

          <AddToCartBtn
            fullWidth
            size="large"
            startIcon={<AddShoppingCartIcon />}
            onClick={handleAdd}
            disabled={!inStock || (product.variants?.length > 0 && !selectedVariant)}
          >
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </AddToCartBtn>

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight={700} mb={2}>Description</Typography>
            <Description>{product.description || 'No description available.'}</Description>
          </Box>
        </InfoSection>
      </Layout>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snack.type} variant="filled" sx={{ fontWeight: 600 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}