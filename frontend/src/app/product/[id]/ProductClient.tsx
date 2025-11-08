// app/product/[id]/ProductClient.tsx
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Divider,
  Alert,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Skeleton,
  Container,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Add,
  Remove,
  ShoppingCart,
  ArrowBackIos,
  ArrowForwardIos,
  Store,
  LocalFireDepartment,
  Palette,
  Memory,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/components/cartContext';

const MEDIA_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : 'https://cloudtech-c4ft.onrender.com';

import type { ProductT } from '@/app/product/[id]/page'; // Adjust the import path as needed

type Props = {
  product: ProductT;
  relatedProducts: ProductT[];
  initialWishlist: string[];
};

export default function ProductClient({
  product,
  relatedProducts: initialRelated,
  initialWishlist,
}: Props) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { cart, addToCart, updateQuantity } = useCart() as any;

  // ---------- IMAGE ----------
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const allImages = useMemo(
    () => [
      product.cover_image,
      ...(product.images?.map(i => i.image) || []),
    ].filter(Boolean) as string[],
    [product.cover_image, product.images]
  );
  const currentImage = allImages[selectedImageIndex]?.startsWith('http')
    ? allImages[selectedImageIndex]
    : `${MEDIA_BASE}${allImages[selectedImageIndex]}`;

  // ---------- WISHLIST ----------
  const [isWishlisted, setIsWishlisted] = useState(false);
  useEffect(() => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setIsWishlisted(wishlist.includes(product.id));
    } catch {}
  }, [product.id]);

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const updated = isWishlisted
      ? wishlist.filter((pid: string) => pid !== product.id)
      : [...wishlist, product.id];
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setIsWishlisted(!isWishlisted);
  };

  // ---------- OPTIONS ----------
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedRam, setSelectedRam] = useState<string>('');
  const [selectedStorage, setSelectedStorage] = useState<string>('');

  // initialise with first available option
  useEffect(() => {
    if (product.color_options?.length) setSelectedColor(product.color_options[0].id);
    if (product.ram_options?.length) setSelectedRam(product.ram_options[0].id);
    if (product.storage_options?.length) setSelectedStorage(product.storage_options[0].id);
  }, [product]);

  // ---------- VARIANT ----------
  const activeVariant = useMemo(() => {
    if (!product.variants?.length) return null;
    return (
      product.variants.find(
        v =>
          v.is_active &&
          (!selectedColor || v.color === selectedColor) &&
          (!selectedRam || v.ram === selectedRam) &&
          (!selectedStorage || v.storage === selectedStorage)
      ) || null
    );
  }, [product.variants, selectedColor, selectedRam, selectedStorage]);

  const price = activeVariant?.price ?? product.price;
  const comparePrice = activeVariant?.compare_at_price ?? (product.discount ? product.price : undefined);
  const stock = activeVariant?.stock ?? product.stock;
  const isLowStock = stock > 0 && stock < 5;

  // ---------- QUANTITY ----------
  const [quantity, setQuantity] = useState(1);
  const cartItem = cart[product.id];
  const inCartQty = cartItem?.quantity ?? 0;

  const handleAddToCart = () => {
    if (stock === 0) return;
    const item = {
      id: Number(product.id),
      title: product.title,
      price,
      quantity,
      stock,
      cover_image: product.cover_image,
      // optional variant info for cart display
      variant: activeVariant ? { color: selectedColor, ram: selectedRam, storage: selectedStorage } : undefined,
    };
    const ok = addToCart(item);
    if (ok) setQuantity(1);
  };

  const updateCartQty = (delta: number) => {
    if (!cartItem) return;
    const newQty = cartItem.quantity + delta;
    if (newQty > 0 && newQty <= stock) updateQuantity(Number(product.id), delta);
  };

  // ---------- RELATED ----------
  const [relatedProducts] = useState(initialRelated);

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        {/* BREADCRUMBS */}
        <Breadcrumbs sx={{ mb: 4, fontSize: '0.875rem', color: '#666' }}>
          <Link underline="hover" color="inherit" href="/" sx={{ '&:hover': { color: '#DC1A8A' } }}>
            Home
          </Link>
          <Link underline="hover" color="inherit" href="/products" sx={{ '&:hover': { color: '#DC1A8A' } }}>
            Products
          </Link>
          <Typography color="#1a1a1a" sx={{ fontWeight: 600 }}>
            {product.title}
          </Typography>
        </Breadcrumbs>

        {/* MAIN CARD */}
        <Box
          sx={{
            bgcolor: '#fff',
            boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
            border: '1px solid #eaeaea',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            divider={<Divider orientation="vertical" flexItem />}
          >
            {/* ---------- IMAGE GALLERY ---------- */}
            <Box sx={{ flex: '0 0 45%', p: { xs: 2, md: 4 }, bgcolor: '#fafafa' }}>
              <Box
                sx={{
                  height: { xs: 300, sm: 380, md: 460 },
                  bgcolor: '#fff',
                  border: '1px solid #eee',
                  borderRadius: 2,
                  overflow: 'hidden',
                  position: 'relative',
                  mb: 2,
                }}
              >
                <img
                  src={currentImage || '/images/fallback.jpg'}
                  alt={product.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                {allImages.length > 1 && (
                  <>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setSelectedImageIndex(
                          (prev) => (prev - 1 + allImages.length) % allImages.length
                        )
                      }
                      sx={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(255,255,255,0.95)',
                        boxShadow: 3,
                        '&:hover': { bgcolor: '#fff' },
                      }}
                    >
                      <ArrowBackIos fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setSelectedImageIndex((prev) => (prev + 1) % allImages.length)
                      }
                      sx={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(255,255,255,0.95)',
                        boxShadow: 3,
                        '&:hover': { bgcolor: '#fff' },
                      }}
                    >
                      <ArrowForwardIos fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Box>

              {allImages.length > 1 && (
                <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', py: 1 }}>
                  {allImages.map((img, i) => (
                    <Box
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      sx={{
                        width: 70,
                        height: 70,
                        border: i === selectedImageIndex ? '2px solid #DC1A8A' : '1px solid #ddd',
                        borderRadius: 2,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        flexShrink: 0,
                        bgcolor: '#fff',
                        transition: 'all 0.2s',
                      }}
                    >
                      <img
                        src={img.startsWith('http') ? img : `${MEDIA_BASE}${img}`}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            {/* ---------- DETAILS ---------- */}
            <Box sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
              {/* Title + Brand */}
              <Typography
                variant="h4"
                sx={{ fontSize: { xs: '1.6rem', md: '2.1rem' }, fontWeight: 700, color: '#1a1a1a', mb: 1 }}
              >
                {product.title}
              </Typography>
              {product.brand && (
                <Typography
                  variant="body2"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#666', mb: 2, fontWeight: 500 }}
                >
                  <Store fontSize="small" /> {product.brand.name}
                </Typography>
              )}

              {/* Low stock alert */}
              {isLowStock && (
                <Alert
                  severity="warning"
                  icon={<LocalFireDepartment sx={{ color: '#DC1A8A' }} />}
                  sx={{
                    mb: 3,
                    py: 1,
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    bgcolor: '#fff8e1',
                    border: '1px solid #ffecb3',
                    color: '#a66400',
                    borderRadius: 1.5,
                  }}
                >
                  Only {stock} left in stock!
                </Alert>
              )}

              {/* Description */}
              <Typography variant="body1" sx={{ color: '#444', mb: 3, lineHeight: 1.7 }}>
                {product.description}
              </Typography>

              <Divider sx={{ mb: 3, borderColor: '#eee' }} />

              {/* ---------- OPTIONS ---------- */}
              <Stack spacing={3} mb={4}>
                {/* COLOR */}
                {product.color_options?.length ? (
                  <FormControl fullWidth>
                    <InputLabel id="color-label">
                      <Palette sx={{ mr: 1, fontSize: '1rem' }} /> Color
                    </InputLabel>
                    <Select
                      labelId="color-label"
                      value={selectedColor}
                      label="Color"
                      onChange={e => setSelectedColor(e.target.value)}
                      renderValue={sel => {
                        const opt = product.color_options?.find(o => o.id === sel);
                        return <Chip label={opt?.value} size="small" sx={{ bgcolor: '#DC1A8A', color: '#fff' }} />;
                      }}
                    >
                      {product.color_options.map(o => (
                        <MenuItem key={o.id} value={o.id}>
                          {o.value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : null}

                {/* RAM */}
                {product.ram_options?.length ? (
                  <FormControl fullWidth>
                    <InputLabel id="ram-label">
                      <Memory sx={{ mr: 1, fontSize: '1rem' }} /> RAM
                    </InputLabel>
                    <Select
                      labelId="ram-label"
                      value={selectedRam}
                      label="RAM"
                      onChange={e => setSelectedRam(e.target.value)}
                    >
                      {product.ram_options.map(o => (
                        <MenuItem key={o.id} value={o.id}>
                          {o.value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : null}

                {/* STORAGE */}
                {product.storage_options?.length ? (
                  <FormControl fullWidth>
                    <InputLabel id="storage-label">
                      <StorageIcon sx={{ mr: 1, fontSize: '1rem' }} /> Storage
                    </InputLabel>
                    <Select
                      labelId="storage-label"
                      value={selectedStorage}
                      label="Storage"
                      onChange={e => setSelectedStorage(e.target.value)}
                    >
                      {product.storage_options.map(o => (
                        <MenuItem key={o.id} value={o.id}>
                          {o.value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : null}
              </Stack>

              {/* ---------- PRICE ---------- */}
              <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                {comparePrice && comparePrice > price && (
                  <Typography sx={{ fontSize: '1.1rem', color: '#888', textDecoration: 'line-through' }}>
                    WAS KES {comparePrice.toLocaleString()}
                  </Typography>
                )}
                <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: '#1a1a1a' }}>
                  NOW KES {price.toLocaleString()}
                </Typography>
                {comparePrice && comparePrice > price && (
                  <Box
                    sx={{
                      bgcolor: '#DC1A8A',
                      color: '#fff',
                      px: 1.2,
                      py: 0.4,
                      borderRadius: 1,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    -
                    {Math.round(((comparePrice - price) / comparePrice) * 100)}%
                  </Box>
                )}
              </Stack>

              {/* ---------- QUANTITY & CART ---------- */}
              <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 1 }}>
                  <IconButton size="small" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>
                    <Remove />
                  </IconButton>
                  <Typography sx={{ mx: 2, minWidth: 32, textAlign: 'center' }}>{quantity}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => setQuantity(q => Math.min(stock - inCartQty, q + 1))}
                    disabled={quantity >= stock - inCartQty}
                  >
                    <Add />
                  </IconButton>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<ShoppingCart />}
                  onClick={handleAddToCart}
                  disabled={stock === 0 || quantity + inCartQty > stock}
                  sx={{
                    flex: 1,
                    textTransform: 'none',
                    fontWeight: 700,
                    bgcolor: '#DC1A8A',
                    '&:hover': { bgcolor: '#B31774' },
                    py: 1.5,
                  }}
                >
                  {cartItem ? 'Update Cart' : 'Add to Cart'}
                </Button>

                <IconButton
                  onClick={toggleWishlist}
                  sx={{ color: isWishlisted ? '#DC1A8A' : '#999' }}
                >
                  {isWishlisted ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              </Stack>

              {/* ---------- CART UPDATE BUTTONS (if already in cart) ---------- */}
              {cartItem && (
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Remove />}
                    onClick={() => updateCartQty(-1)}
                  >
                    -
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => updateCartQty(1)}
                    disabled={cartItem.quantity >= stock}
                  >
                    +
                  </Button>
                </Stack>
              )}
            </Box>
          </Stack>
        </Box>

        {/* ---------- RELATED PRODUCTS ---------- */}
        {relatedProducts.length > 0 && (
          <Box sx={{ mt: 10 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 4 }}>
              You May Also Like
            </Typography>
            <Stack
              direction="row"
              spacing={3}
              sx={{ overflowX: 'auto', pb: 2, '&::-webkit-scrollbar': { display: 'none' } }}
            >
              {relatedProducts.map(p => {
                const img = p.cover_image?.startsWith('http')
                  ? p.cover_image
                  : `${MEDIA_BASE}${p.cover_image}`;
                const price = p.final_price ?? (p.discount ? p.price * (1 - p.discount / 100) : p.price);
                return (
                  <Box
                    key={p.id}
                    onClick={() => router.push(`/product/${p.id}`)}
                    sx={{
                      minWidth: 190,
                      cursor: 'pointer',
                      transition: '0.2s',
                      '&:hover': { transform: 'translateY(-4px)' },
                    }}
                  >
                    <Box
                      sx={{
                        height: 170,
                        bgcolor: '#fafafa',
                        border: '1px solid #eee',
                        borderRadius: 2,
                        overflow: 'hidden',
                        mb: 1.5,
                      }}
                    >
                      <img
                        src={img || '/images/fallback.jpg'}
                        alt={p.title}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.95rem' }}
                    >
                      {p.title}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#DC1A8A', fontSize: '1.1rem' }}>
                      KES {price.toLocaleString()}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
}