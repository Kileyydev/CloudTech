'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Divider,
  Skeleton,
  Snackbar,
  Alert,
  useTheme,
  alpha,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Favorite,
  ShoppingCart,
  ArrowBack,
  Business,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/components/cartContext';

type ProductImage = { image?: { url: string } } | { url: string } | string;

interface OptionT {
  id: number;
  value: string;
}

interface VariantT {
  id?: number;
  color?: string;
  ram?: string;
  storage?: string;
  price?: number;
  compare_at_price?: number;
}

interface ProductT {
  id: number;
  title: string;
  description?: string;
  price: number;
  discount?: number;
  final_price?: number;
  cover_image?: ProductImage;
  images?: ProductImage[];
  brand?: { id: number; name: string };
  colors?: OptionT[];
  ram_options?: OptionT[];
  storage_options?: OptionT[];
  color_options?: OptionT[];
  variants?: VariantT[];
  stock?: number;
}

// ──────────────────────────────────────────────────────────────
// generateStaticParams – REQUIRED FOR `output: 'export'`
// ──────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE;

  if (!API_BASE_URL) {
    console.warn('NEXT_PUBLIC_API_BASE not set. Skipping generateStaticParams.');
    return [];
  }

  try {
    const res = await fetch(`${API_BASE_URL}/products/`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.status}`);
    }

    const products: Pick<ProductT, 'id'>[] = await res.json();

    return products.map((product) => ({
      id: product.id.toString(),
    }));
  } catch (error) {
    console.error('generateStaticParams error:', error);
    return [];
  }
}

// ──────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ──────────────────────────────────────────────────────────────
const ProductDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const theme = useTheme();
  const router = useRouter();
  const { cart, addToCart } = useCart();

  const [product, setProduct] = useState<ProductT | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const [selectedRam, setSelectedRam] = useState<string>('');
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [currentDiscount, setCurrentDiscount] = useState<number>(0);
  const [currentFinalPrice, setCurrentFinalPrice] = useState<number>(0);
  const [mainImage, setMainImage] = useState<string>('');

  // Fetch product
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE;
        if (!API_BASE_URL) throw new Error('API base URL not defined');

        const res = await fetch(`${API_BASE_URL}/products/${id}/`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch product');

        const data: ProductT = await res.json();
        setProduct(data);

        // Default selections
        if (data.ram_options?.length) setSelectedRam(data.ram_options[0].value);
        if (data.storage_options?.length) setSelectedStorage(data.storage_options[0].value);
        if (data.colors?.length) setSelectedColor(data.colors[0].value);
        else if (data.color_options?.length) setSelectedColor(data.color_options[0].value);

        setMainImage(getImageUrl(data.cover_image));
        updatePrice(data, '', '', '');
      } catch (err: any) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Load wishlist
  useEffect(() => {
    try {
      const stored = localStorage.getItem('wishlist');
      if (stored) setWishlist(new Set(JSON.parse(stored)));
    } catch (e) {
      console.error('Failed to load wishlist', e);
    }
  }, []);

  // Update price when variant changes
  useEffect(() => {
    if (product) updatePrice(product, selectedRam, selectedStorage, selectedColor);
  }, [selectedRam, selectedStorage, selectedColor, product]);

  const updatePrice = (prod: ProductT, ram: string, storage: string, color: string) => {
    if (prod.variants?.length) {
      const match = prod.variants.find(v =>
        (v.ram === ram || !ram) &&
        (v.storage === storage || !storage) &&
        (v.color === color || !color)
      );
      if (match) {
        const price = match.price || prod.price;
        const compare = match.compare_at_price;
        const discount = compare ? Math.round(((compare - price) / compare) * 100) : 0;
        setCurrentPrice(compare || price);
        setCurrentDiscount(discount);
        setCurrentFinalPrice(price);
        return;
      }
    }
    setCurrentPrice(prod.price);
    setCurrentDiscount(prod.discount || 0);
    setCurrentFinalPrice(prod.final_price || prod.price);
  };

  const showSnackbar = (msg: string, sev: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message: msg, severity: sev });

  const handleWishlist = () => {
    setWishlist(prev => {
      const updated = new Set(prev);
      updated.has(product!.id) ? updated.delete(product!.id) : updated.add(product!.id);
      localStorage.setItem('wishlist', JSON.stringify(Array.from(updated)));
      return updated;
    });
    showSnackbar(wishlist.has(product!.id) ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleAddToCart = () => {
    if (!product) return;
    const item = cart[product.id];
    addToCart({
      id: product.id,
      title: product.title,
      price: currentFinalPrice,
      quantity: 1,
      stock: product.stock ?? 0,
      cover_image: typeof product.cover_image === 'string'
        ? product.cover_image
        : getImageUrl(product.cover_image),
    });
    showSnackbar(item ? `+1 ${product.title}` : `${product.title} added to cart!`);
  };

  const getImageUrl = (img: ProductImage | undefined): string => {
    if (!img) return '/images/fallback.jpg';
    if (typeof img === 'string') return img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_MEDIA_BASE}${img}`;
    if ('url' in img) return img.url.startsWith('http') ? img.url : `${process.env.NEXT_PUBLIC_MEDIA_BASE}${img.url}`;
    if ('image' in img) return getImageUrl(img.image);
    return '/images/fallback.jpg';
  };

  const galleryImages = product?.images?.map(getImageUrl).filter(Boolean) || [];

  if (loading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
        <Skeleton height={40} width={200} />
        <Box sx={{ display: 'flex', gap: 4, mt: 3 }}>
          <Box sx={{ flex: '0 0 500px' }}>
            <Skeleton variant="rectangular" height={500} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Skeleton height={36} width="80%" />
            <Skeleton height={24} width="60%" sx={{ mt: 1 }} />
            <Skeleton height={100} sx={{ mt: 3 }} />
          </Box>
        </Box>
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={{ textAlign: 'center', py: 12 }}>
        <Typography variant="h6" color="error">{error || 'Product not found'}</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => router.back()} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  const hasDiscount = currentDiscount > 0;
  const displayPrice = hasDiscount ? currentFinalPrice : currentPrice;
  const isInWishlist = wishlist.has(product.id);

  const ramOptions = product.ram_options || [];
  const storageOptions = product.storage_options || [];
  const colorOptions = product.colors || product.color_options || [];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 }, bgcolor: '#fdfdfd' }}>
      <Button startIcon={<ArrowBack />} onClick={() => router.back()} sx={{ mb: 3, textTransform: 'none', fontWeight: 600 }}>
        Back to Deals
      </Button>

      <Box sx={{ display: 'flex', gap: { xs: 2, md: 4 }, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* LEFT: Cover + Gallery */}
        <Box sx={{ flex: '0 0 500px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box
            sx={{
              bgcolor: '#fff',
              border: '1px solid #eee',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}
          >
            <img
              src={mainImage}
              alt={product.title}
              style={{ width: '100%', height: 'auto', maxHeight: 500, objectFit: 'contain' }}
            />
          </Box>

          {(galleryImages.length > 0 || product.cover_image) && (
            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
              {[getImageUrl(product.cover_image), ...galleryImages].map((src, i) => (
                <Tooltip key={i} title="Click to enlarge">
                  <Box
                    onClick={() => setMainImage(src)}
                    sx={{
                      width: 80,
                      height: 80,
                      border: mainImage === src ? '2px solid #e91e63' : '1px solid #ddd',
                      borderRadius: 1,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: '#e91e63' },
                    }}
                  >
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                </Tooltip>
              ))}
            </Stack>
          )}
        </Box>

        {/* RIGHT: Details */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1 }}>
            {product.title}
          </Typography>

          {product.brand && (
            <Chip
              icon={<Business sx={{ fontSize: 16 }} />}
              label={product.brand.name}
              sx={{ mb: 2, bgcolor: alpha('#DC1A8A', 0.1), color: '#DC1A8A', fontWeight: 600 }}
            />
          )}

          <Box sx={{ mb: 3 }}>
            {hasDiscount ? (
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography sx={{ textDecoration: 'line-through', color: '#999', fontSize: '1.1rem' }}>
                  Was KES {currentPrice.toLocaleString()}
                </Typography>
                <Typography sx={{ fontWeight: 800, color: '#e91e63', fontSize: '1.8rem' }}>
                  KES {displayPrice.toLocaleString()}
                </Typography>
                <Chip label={`${currentDiscount}% OFF`} color="error" size="small" />
              </Stack>
            ) : (
              <Typography sx={{ fontWeight: 800, color: '#1a1a1a', fontSize: '1.8rem' }}>
                KES {displayPrice.toLocaleString()}
              </Typography>
            )}
          </Box>

          <Stack spacing={2} sx={{ mb: 4 }}>
            {ramOptions.length > 0 && (
              <FormControl fullWidth>
                <InputLabel>RAM</InputLabel>
                <Select value={selectedRam} onChange={e => setSelectedRam(e.target.value)} label="RAM">
                  {ramOptions.map(opt => (
                    <MenuItem key={opt.id} value={opt.value}>{opt.value}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {storageOptions.length > 0 && (
              <FormControl fullWidth>
                <InputLabel>Storage</InputLabel>
                <Select value={selectedStorage} onChange={e => setSelectedStorage(e.target.value)} label="Storage">
                  {storageOptions.map(opt => (
                    <MenuItem key={opt.id} value={opt.value}>{opt.value}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {colorOptions.length > 0 && (
              <FormControl fullWidth>
                <InputLabel>Color</InputLabel>
                <Select
                  value={selectedColor}
                  onChange={e => setSelectedColor(e.target.value)}
                  label="Color"
                  renderValue={sel => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: sel.toLowerCase(), border: '1px solid #ddd' }} />
                      {sel}
                    </Box>
                  )}
                >
                  {colorOptions.map(opt => (
                    <MenuItem key={opt.id} value={opt.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: opt.value.toLowerCase(), border: '1px solid #ddd' }} />
                        {opt.value}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>

          <Button
            fullWidth
            size="large"
            variant="contained"
            startIcon={<ShoppingCart />}
            onClick={handleAddToCart}
            sx={{
              bgcolor: '#e91e63',
              color: '#fff',
              fontWeight: 700,
              textTransform: 'none',
              py: 1.8,
              fontSize: '1.1rem',
              mb: 3,
              '&:hover': { bgcolor: '#c2185b' },
            }}
          >
            Add to Cart
          </Button>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<Favorite sx={{ color: isInWishlist ? '#e91e63' : '#bbb' }} />}
            onClick={handleWishlist}
            sx={{
              borderColor: '#ddd',
              color: '#1a1a1a',
              textTransform: 'none',
              fontWeight: 600,
              mb: 4,
            }}
          >
            {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </Button>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1a1a1a' }}>
            Description
          </Typography>
          <Typography sx={{ color: '#444', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {product.description || 'No description available.'}
          </Typography>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            fontWeight: 600,
            ...(snackbar.severity === 'success' && { bgcolor: '#4caf50', color: '#fff' }),
            ...(snackbar.severity === 'error' && { bgcolor: '#f44336', color: '#fff' }),
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductDetailPage;