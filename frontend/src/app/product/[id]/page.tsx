'use client';

import {
  Box,
  Typography,
  IconButton,
  Stack,
  Paper,
  Button,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/app/components/cartContext';
import WhatOthersAreBuying from '@/app/components/WhatOthersAreBuying';

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE}/products/`;

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [error, setError] = useState('');

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch(`${API_BASE}${id}/`)
      .then(res => res.json())
      .then(data => setProduct(data));
  }, [id]);

  /* ================= SAFE HOOKS ================= */
  const images = useMemo(() => {
    if (!product) return [];
    return [
      product.cover_image?.url || product.cover_image,
      ...(product.images?.map((i: any) => i.image?.url || i.image) || []),
    ].filter(Boolean);
  }, [product]);

  const parsedDescription = useMemo(() => {
    if (!product?.description) return [];
    return (
      product.description.match(/\d+\.\s[\s\S]*?(?=\d+\.|$)/g) ?? [
        product.description,
      ]
    );
  }, [product]);

  if (!product) return <Typography sx={{ p: 4 }}>Loading...</Typography>;

  const inStockVariants =
    product.variants?.filter((v: any) => v.stock > 0) ?? [];

  const displayPrice =
    selectedVariant?.price ?? product.final_price ?? product.price;

  /* ================= CART ================= */
  const handleAddToCart = () => {
    setError('');

    if (!selectedVariant) {
      setError('Please select an available option.');
      return;
    }

    const success = addToCart({
      id: product.id,
      title: product.title,
      price: selectedVariant.price,
      quantity: 1,
      stock: selectedVariant.stock,
      cover_image: images[0],
      selectedOptions: {
        ram: selectedVariant.ram,
        storage: selectedVariant.storage,
        color: selectedVariant.color,
      },
    });

    if (!success) {
      setError('Unable to add item. Stock limit reached.');
    }
  };

  return (
    <>
      <Box sx={{ px: { xs: 2, md: 6 }, py: 5, bgcolor: '#fff', minHeight: '100vh' }}>
        <Paper sx={{ p: { xs: 2, md: 4 } }} elevation={0}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={5}>

            {/* ================= IMAGES ================= */}
            <Box sx={{ flex: 1 }}>
              {/* Main Image */}
              <Box
                sx={{
                  position: 'relative',
                  height: 420,
                  bgcolor: '#f9f9f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={images[activeImg]}
                  alt="product"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />

                <IconButton
                  onClick={() =>
                    setActiveImg((p) => (p - 1 + images.length) % images.length)
                  }
                  sx={{ position: 'absolute', left: 8 }}
                >
                  <ArrowBackIos />
                </IconButton>

                <IconButton
                  onClick={() =>
                    setActiveImg((p) => (p + 1) % images.length)
                  }
                  sx={{ position: 'absolute', right: 8 }}
                >
                  <ArrowForwardIos />
                </IconButton>
              </Box>

              {/* Thumbnails */}
              {images.length > 1 && (
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
                  {images.map((img, i) => (
                    <Box
                      key={i}
                      onClick={() => setActiveImg(i)}
                      sx={{
                        width: 60,
                        height: 60,
                        border: activeImg === i ? '2px solid #e91e63' : '1.5px solid #ddd',
                        cursor: 'pointer',
                        p: 0.5,
                      }}
                    >
                      <img
                        src={img}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            {/* ================= DETAILS ================= */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight={700}>
                {product.title}
              </Typography>

              <Typography sx={{ color: '#e91e63', fontWeight: 800, mt: 1 }}>
                KES {displayPrice?.toLocaleString()}
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* Description */}
              <Stack spacing={1} sx={{ mb: 3 }}>
                {parsedDescription.map((line: string, idx: number) => (
                  <Typography key={idx} sx={{ color: '#555' }}>
                    {line.trim()}
                  </Typography>
                ))}
              </Stack>

              {/* ================= VARIANT TABLE ================= */}
              {inStockVariants.length > 0 && (
                <>
                  <Typography fontWeight={700} sx={{ mb: 1 }}>
                    Available Options
                  </Typography>

                  <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small" sx={{ minWidth: 600 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ minWidth: 80 }}>RAM</TableCell>
                          <TableCell sx={{ minWidth: 100 }}>Storage</TableCell>
                          <TableCell sx={{ minWidth: 100 }}>Color</TableCell>
                          <TableCell sx={{ minWidth: 100 }}>Price</TableCell>
                          <TableCell sx={{ minWidth: 120 }} />
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {inStockVariants.map((v: any) => (
                          <TableRow
                            key={v.id}
                            sx={{
                              bgcolor: selectedVariant?.id === v.id ? '#f5f5f5' : 'inherit',
                            }}
                          >
                            <TableCell>{v.ram || '-'}</TableCell>
                            <TableCell>{v.storage || '-'}</TableCell>
                            <TableCell>{v.color || '-'}</TableCell>
                            <TableCell>KES {v.price.toLocaleString()}</TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant={selectedVariant?.id === v.id ? 'contained' : 'outlined'}
                                onClick={() => setSelectedVariant(v)}
                              >
                                Select
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                fullWidth
                sx={{ mt: 3, py: 1.5, fontWeight: 700 }}
                variant="contained"
                disabled={!selectedVariant}
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
            </Box>
          </Stack>
        </Paper>
        <WhatOthersAreBuying excludeProductId={product.id} />
      </Box>
    </>
  );
}
