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
  Skeleton,
  Card,
  CardMedia,
  CardContent,
  Rating,
  Snackbar,
  Chip,
} from '@mui/material';
import {
  ArrowBackIos,
  ArrowForwardIos,
  Favorite,
  ShoppingCart,
  Add,
  Remove,
  WhatsApp,
  SwapHoriz,
} from '@mui/icons-material';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/app/components/cartContext';

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE}/products/`;
const WHATSAPP_NUMBER = '254722244482';
const TRADEIN_PAGE = '/trade-in';

type ProductImage = { image?: { url: string } } | { url: string } | string;

interface ProductT {
  id: number;
  title: string;
  price: number;
  discount?: number;
  final_price?: number;
  stock: number;
  cover_image?: ProductImage;
  images?: ProductImage[];
  brand?: { name: string };
  colors?: { value: string }[];
  ram_options?: { value: string }[];
  storage_options?: { value: string }[];
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { cart, addToCart, updateQuantity } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [error, setError] = useState('');

  const [featuredProducts, setFeaturedProducts] = useState<ProductT[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const sliderRef = useRef<HTMLDivElement>(null);

  /* ================= FETCH MAIN PRODUCT ================= */
  useEffect(() => {
    fetch(`${API_BASE}${id}/`)
      .then((res) => res.json())
      .then((data) => setProduct(data));
  }, [id]);

  /* ================= FETCH FEATURED PRODUCTS ================= */
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/products/?categories__slug=popularsection`,
          { next: { revalidate: 600 } }
        );
        if (!res.ok) throw new Error('Failed to fetch featured');
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.results || data.data || [];
        const shuffled = [...list].sort(() => Math.random() - 0.5);
        setFeaturedProducts(shuffled.slice(0, 20));
      } catch (err) {
        console.error('Featured fetch error:', err);
      } finally {
        setFeaturedLoading(false);
      }
    };
    loadFeatured();
  }, []);

  /* ================= WISHLIST & CART LOGIC ================= */
  useEffect(() => {
    const stored = localStorage.getItem('wishlist');
    if (stored) setWishlist(new Set(JSON.parse(stored)));
  }, []);

  const showSnackbar = (msg: string, severity: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message: msg, severity });

  const handleWishlistToggle = (prodId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) => {
      const updated = new Set(prev);
      updated.has(prodId) ? updated.delete(prodId) : updated.add(prodId);
      localStorage.setItem('wishlist', JSON.stringify(Array.from(updated)));
      return updated;
    });
  };

  const handleAddToCartFeatured = (product: ProductT, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return showSnackbar('Out of stock', 'error');
    const existing = cart[product.id];
    const newQty = existing ? existing.quantity + 1 : 1;
    if (newQty > product.stock) return showSnackbar(`Only ${product.stock} left`, 'error');

    const priceToUse = product.final_price && product.discount ? product.final_price : product.price;
    addToCart({
      id: product.id,
      title: product.title,
      price: priceToUse,
      quantity: 1,
      stock: product.stock,
    });
    showSnackbar(existing ? `+1 ${product.title}` : `${product.title} added!`);
  };

  const getImageUrl = (img: ProductImage | undefined): string => {
    if (!img) return '/images/fallback.jpg';
    if (typeof img === 'string') return img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_MEDIA_BASE}${img}`;
    if ('url' in img) return img.url.startsWith('http') ? img.url : `${process.env.NEXT_PUBLIC_MEDIA_BASE}${img.url}`;
    if ('image' in img) return getImageUrl(img.image);
    return '/images/fallback.jpg';
  };

  const getPriceDisplay = (p: ProductT) => {
    const hasDiscount = p.discount && p.discount > 0;
    const final = hasDiscount && p.final_price ? p.final_price : p.price;
    return hasDiscount
      ? `KSh ${final.toLocaleString()} - KSh ${p.price.toLocaleString()}`
      : `KSh ${final.toLocaleString()}`;
  };

  const renderFeaturedCard = (product: ProductT) => {
    const imageSrc = getImageUrl(product.cover_image);
    const galleryImages = product.images?.map(getImageUrl).filter(Boolean) || [];
    const hasDiscount = product.discount && product.discount > 0;
    const inCart = !!cart[product.id];

    return (
      <Card
        sx={{
          width: 290,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#fff',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          borderRadius: 0,
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
          },
          '&:hover .hover-overlay': { opacity: 1 },
        }}
        onClick={() => router.push(`/product/${product.id}`)}
      >
        <IconButton
          onClick={(e) => handleWishlistToggle(product.id, e)}
          sx={{
            position: 'absolute',
            top: 6,
            right: 6,
            zIndex: 10,
            bgcolor: 'rgba(255,255,255,0.9)',
            width: 30,
            height: 30,
          }}
        >
          <Favorite
            sx={{ color: wishlist.has(product.id) ? '#e91e63' : '#ccc', fontSize: 17 }}
          />
        </IconButton>

        {hasDiscount && (
          <Box
            sx={{
              position: 'absolute',
              top: 6,
              left: 6,
              bgcolor: '#e91e63',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.65rem',
              px: 1,
              py: 0.3,
              zIndex: 10,
            }}
          >
            {product.discount}% OFF
          </Box>
        )}

        <Box
          sx={{
            position: 'relative',
            height: 200,
            bgcolor: '#f9f9f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CardMedia
            component="img"
            image={imageSrc}
            alt={product.title}
            loading="lazy"
            sx={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }}
          />
          {(product.colors || product.ram_options || product.storage_options) && (
            <Box
              className="hover-overlay"
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'rgba(0,0,0,0.8)',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                p: 1.5,
                opacity: 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none',
              }}
            >
              <Stack spacing={1}>
                {product.colors && product.colors.length > 0 && (
                  <Box textAlign="center">
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      Colors
                    </Typography>
                    <Stack direction="row" spacing={0.7} justifyContent="center" mt={0.3}>
                      {product.colors.slice(0, 6).map((c, i) => (
                        <Box
                          key={i}
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            bgcolor: c.value.toLowerCase(),
                            border: '1.5px solid #fff',
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
                {product.ram_options && product.ram_options.length > 0 && (
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>
                    RAM: {product.ram_options.map((r) => r.value).join(' / ')}
                  </Typography>
                )}
                {product.storage_options && product.storage_options.length > 0 && (
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>
                    Storage: {product.storage_options.map((s) => s.value).join(' / ')}
                  </Typography>
                )}
              </Stack>
            </Box>
          )}
        </Box>

        <CardContent
          sx={{
            flexGrow: 1,
            p: 1.5,
            pb: '12px !important',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: '0.85rem',
                mb: 0.5,
                height: 36,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {product.title}
            </Typography>
            <Rating
              value={4.5}
              readOnly
              precision={0.5}
              size="small"
              sx={{ mb: 0.8 }}
            />
            <Typography
              sx={{
                fontWeight: 800,
                color: hasDiscount ? '#e91e63' : '#1a1a1a',
                fontSize: '0.95rem',
                mb: 1,
              }}
            >
              {getPriceDisplay(product)}
            </Typography>
          </Box>

          {inCart ? (
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  updateQuantity(product.id, -1);
                }}
                sx={{ bgcolor: '#f0f0f0', width: 30, height: 30 }}
              >
                <Remove fontSize="small" />
              </IconButton>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
                {cart[product.id].quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => handleAddToCartFeatured(product, e)}
                disabled={cart[product.id].quantity >= product.stock}
                sx={{
                  bgcolor: '#e91e63',
                  color: '#fff',
                  width: 30,
                  height: 30,
                }}
              >
                <Add fontSize="small" />
              </IconButton>
            </Stack>
          ) : (
            <Button
              fullWidth
              variant="contained"
              startIcon={<ShoppingCart sx={{ fontSize: 17 }} />}
              onClick={(e) => handleAddToCartFeatured(product, e)}
              disabled={product.stock === 0}
              sx={{
                bgcolor: '#e91e63',
                color: '#fff',
                fontWeight: 700,
                textTransform: 'none',
                py: 1.1,
                fontSize: '0.85rem',
                '&:hover': { bgcolor: '#c2185b' },
                '&[disabled]': { bgcolor: '#ddd', color: '#999' },
              }}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          )}
        </CardContent>

        {galleryImages.length > 0 && (
          <Box sx={{ px: 1.5, pb: 1.5 }}>
            <Stack direction="row" spacing={0.8} justifyContent="center">
              {galleryImages.slice(0, 3).map((src, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 40,
                    height: 40,
                    overflow: 'hidden',
                    border: '1.5px solid #eee',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/product/${product.id}`);
                  }}
                >
                  <img
                    src={src}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              ))}
              {galleryImages.length > 3 && (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  +{galleryImages.length - 3}
                </Box>
              )}
            </Stack>
          </Box>
        )}
      </Card>
    );
  };

  const renderSkeletonCard = () => (
    <Box sx={{ width: 290, height: 520, bgcolor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
      <Skeleton variant="rectangular" width="100%" height={200} />
      <Box sx={{ p: 1.5 }}>
        <Skeleton height={20} width="90%" sx={{ mb: 0.5 }} />
        <Skeleton height={18} width="70%" />
        <Skeleton height={40} width="100%" sx={{ mt: 2 }} />
      </Box>
      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <Stack direction="row" spacing={1} justifyContent="center">
          <Skeleton variant="rectangular" width={40} height={40} />
          <Skeleton variant="rectangular" width={40} height={40} />
          <Skeleton variant="rectangular" width={40} height={40} />
        </Stack>
      </Box>
    </Box>
  );

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -290, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 290, behavior: 'smooth' });
    }
  };

  const images = useMemo(() => {
    if (!product) return [];
    return [
      product.cover_image?.url || product.cover_image,
      ...(product.images?.map((i: any) => i.image?.url || i.image) || []),
    ].filter(Boolean);
  }, [product]);

  const parsedDescription = useMemo(() => {
    if (!product?.description) return [];
    return product.description.match(/\d+\.\s[\s\S]*?(?=\d+\.|$)/g) ?? [product.description];
  }, [product]);

  if (!product) return <Typography sx={{ p: 4 }}>Loading...</Typography>;

  const inStockVariants = product.variants?.filter((v: any) => v.stock > 0) ?? [];
  const displayPrice = selectedVariant?.price ?? product.final_price ?? product.price;

  const cartItem = cart[product.id];
  const currentQuantity = cartItem ? cartItem.quantity : 0;

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

  const handleWhatsAppOrder = () => {
    const message = `Hi! Can I get more information on ${product.title}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <Box sx={{ px: { xs: 2, md: 6 }, py: 5, bgcolor: '#fff', minHeight: '100vh' }}>
        <Paper sx={{ p: { xs: 2, md: 4 } }} elevation={0}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={5}>
            {/* LEFT COLUMN: Images + Trade-in */}
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
                  onClick={() => setActiveImg((p) => (p - 1 + images.length) % images.length)}
                  sx={{ position: 'absolute', left: 8 }}
                >
                  <ArrowBackIos />
                </IconButton>
                <IconButton
                  onClick={() => setActiveImg((p) => (p + 1) % images.length)}
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

              {/* TRADE-IN SECTION - now below image on the left */}
              <Paper
                elevation={3}
                sx={{
                  mt: 4,
                  p: 3,
                  borderRadius: 2,
                  bgcolor: '#fff8f8',
                  border: '1px solid #ffebee',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6" fontWeight={700} color="#e91e63" gutterBottom>
                  Trade-in Your Old Device?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Get an instant estimate and save more on this purchase!
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<SwapHoriz />}
                  onClick={() => router.push(TRADEIN_PAGE)}
                  size="medium"
                  fullWidth
                  sx={{
                    bgcolor: '#e91e63',
                    py: 1.2,
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#c2185b' },
                  }}
                >
                  Calculate Trade-in Value
                </Button>
              </Paper>
            </Box>

            {/* RIGHT COLUMN: Product Details */}
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

              {/* VARIANT TABLE */}
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
                                sx={{
                                  bgcolor: selectedVariant?.id === v.id ? '#e91e63' : undefined,
                                  color: selectedVariant?.id === v.id ? '#fff' : undefined,
                                  borderColor: '#e91e63',
                                  '&:hover': {
                                    bgcolor: '#e91e63',
                                    color: '#fff',
                                  },
                                }}
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

              {/* Add to Cart with Counter */}
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 3 }}>
                {currentQuantity > 0 ? (
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
                    <IconButton
                      size="medium"
                      onClick={() => updateQuantity(product.id, -1)}
                      sx={{ bgcolor: '#f0f0f0' }}
                    >
                      <Remove />
                    </IconButton>
                    <Chip
                      label={currentQuantity}
                      color="primary"
                      sx={{ bgcolor: '#e91e63', color: '#fff', fontWeight: 700, minWidth: 60 }}
                    />
                    <IconButton
                      size="medium"
                      onClick={handleAddToCart}
                      disabled={!selectedVariant || currentQuantity >= (selectedVariant?.stock ?? 0)}
                      sx={{ bgcolor: '#e91e63', color: '#fff' }}
                    >
                      <Add />
                    </IconButton>
                  </Stack>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ShoppingCart />}
                    disabled={!selectedVariant}
                    onClick={handleAddToCart}
                    sx={{
                      py: 1.8,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      bgcolor: '#e91e63',
                      '&:hover': { bgcolor: '#c2185b' },
                    }}
                  >
                    Add to Cart
                  </Button>
                )}
              </Stack>

              {/* WhatsApp Order Button */}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<WhatsApp />}
                onClick={handleWhatsAppOrder}
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontWeight: 700,
                  borderColor: '#25D366',
                  color: '#25D366',
                  '&:hover': {
                    bgcolor: '#25D366',
                    color: '#fff',
                    borderColor: '#25D366',
                  },
                }}
              >
                Order via WhatsApp
              </Button>
            </Box>
          </Stack>
        </Paper>

        {/* FEATURED PRODUCTS SECTION */}
        <Box sx={{ bgcolor: '#fdfdfd', py: { xs: 4, md: 6 }, px: { xs: 2, md: 6 }, position: 'relative' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                borderBottom: '4px solid #000',
                pb: 1,
                display: 'inline-block',
                color: '#000',
              }}
            >
              More Featured Products
            </Typography>
          </Box>

          <IconButton
            onClick={scrollLeft}
            sx={{
              position: 'absolute',
              top: '50%',
              left: 8,
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.8)',
              zIndex: 10,
              '&:hover': { bgcolor: '#e91e63', color: '#fff' },
            }}
          >
            <ArrowBackIos />
          </IconButton>

          <IconButton
            onClick={scrollRight}
            sx={{
              position: 'absolute',
              top: '50%',
              right: 8,
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.8)',
              zIndex: 10,
              '&:hover': { bgcolor: '#e91e63', color: '#fff' },
            }}
          >
            <ArrowForwardIos />
          </IconButton>

          <Box
            ref={sliderRef}
            sx={{
              display: 'flex',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              gap: 3,
              pb: 2,
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              px: { xs: 2, md: 4 },
            }}
          >
            {featuredLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <Box key={i} sx={{ flex: '0 0 290px' }}>
                    {renderSkeletonCard()}
                  </Box>
                ))
              : featuredProducts.map((prod) => (
                  <Box key={prod.id} sx={{ flex: '0 0 290px' }}>
                    {renderFeaturedCard(prod)}
                  </Box>
                ))}
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}