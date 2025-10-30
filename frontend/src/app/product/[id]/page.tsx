"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Link,
  TextField,
  Container,
} from "@mui/material";
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
} from "@mui/icons-material";
import { useParams, useRouter } from "next/navigation";
import { useCart } from '@/app/components/cartContext';
import TopNavBar from "@/app/components/TopNavBar";
import MainNavBar from "@/app/components/MainNavBar";


const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE || "http://localhost:8000";

type ProductT = {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  discount?: number;
  final_price?: number;
  cover_image?: string;
  images?: { id: string; image: string }[];
  colors?: string[];
  brand?: { id: number; name: string };
  is_active?: boolean;
};

const ProductDetailPage = () => {
  const { id: rawId } = useParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? "";
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { cart, addToCart, updateQuantity } = useCart() as {
    cart: Record<string, { id: number; title: string; price: number; quantity: number; stock: number }>;
    addToCart: (item: any) => void;
    updateQuantity: (id: number, delta: number) => void;
  };

  const [product, setProduct] = useState<ProductT | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const API_PRODUCT = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"}/products/${id}/`;
  const API_RELATED = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"}/products/`;


  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setIsWishlisted(wishlist.includes(id));
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, relatedRes] = await Promise.all([
          fetch(API_PRODUCT),
          fetch(API_RELATED),
        ]);

        if (!prodRes.ok) throw new Error("Product not found");
        const prodData = await prodRes.json();
        setProduct(prodData);

        const relatedData = await relatedRes.json();
        const all = Array.isArray(relatedData) ? relatedData : relatedData.results || [];
        const filtered = all.filter((p: ProductT) => p.id !== id && p.is_active);
        setRelatedProducts(filtered.slice(0, 6));
      } catch (err: any) {
        setError(err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    if (isWishlisted) {
      const updated = wishlist.filter((pid: string) => pid !== id);
      localStorage.setItem("wishlist", JSON.stringify(updated));
    } else {
      wishlist.push(id);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
    setIsWishlisted(!isWishlisted);
  };

  const cartItem = cart[id];
  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    addToCart({
      id: Number(product.id),
      title: product.title,
      price: product.final_price || product.price,
      quantity: quantity,
      stock: product.stock,
    });
    setQuantity(1);
  };

  const updateCartQuantity = (delta: number) => {
    if (!cartItem) return;
    const newQty = cartItem.quantity + delta;
    if (newQty > 0 && newQty <= product!.stock) {
      updateQuantity(Number(id), delta);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Product not found"}
        </Alert>
        <Button variant="outlined" onClick={() => router.back()}>
          Go Back
        </Button>
      </Container>
    );
  }

  const allImages = [
    product.cover_image,
    ...(product.images?.map((i) => i.image) || []),
  ].filter(Boolean) as string[];

  const currentImage = allImages[selectedImageIndex]?.startsWith("http")
    ? allImages[selectedImageIndex]
    : `${MEDIA_BASE}${allImages[selectedImageIndex]}`;

  const finalPrice = product.final_price || (product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price);

  const isLowStock = product.stock > 0 && product.stock < 5;

  return (
    <>
        <TopNavBar />
        <MainNavBar />
        <Box sx={{ bgcolor: "#fafafa", minHeight: "100vh" }}>
          <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ mb: 4, fontSize: "0.875rem" }}>
              <Link underline="hover" color="inherit" href="/">
                Home
              </Link>
              <Link underline="hover" color="inherit" href="/products">
                Products
              </Link>
              <Typography color="text.primary" sx={{ fontWeight: 500 }}>
                {product.title}
              </Typography>
            </Breadcrumbs>

            {/* Main Product Card */}
            <Box
              sx={{
                bgcolor: "white",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid #eaeaea",
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={0}
                divider={<Divider orientation="vertical" flexItem />}
              >
                {/* IMAGE SECTION */}
                <Box sx={{ flex: "0 0 45%", p: { xs: 2, md: 4 } }}>
                  {/* Main Image */}
                  <Box
                    sx={{
                      height: { xs: 280, sm: 360, md: 420 },
                      bgcolor: "#f5f5f5",
                      overflow: "hidden",
                      mb: 2,
                      position: "relative",
                    }}
                  >
                    <img
                      src={currentImage || "/images/fallback.jpg"}
                      alt={product.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        background: "#fff",
                      }}
                    />

                    {/* Navigation Arrows */}
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
                            position: "absolute",
                            left: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            bgcolor: "rgba(255,255,255,0.9)",
                            boxShadow: 1,
                            "&:hover": { bgcolor: "white" },
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
                            position: "absolute",
                            right: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            bgcolor: "rgba(255,255,255,0.9)",
                            boxShadow: 1,
                            "&:hover": { bgcolor: "white" },
                          }}
                        >
                          <ArrowForwardIos fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {/* Thumbnails */}
                  {allImages.length > 1 && (
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        overflowX: "auto",
                        py: 1,
                        "&::-webkit-scrollbar": { display: "none" },
                      }}
                    >
                      {allImages.map((img, i) => (
                        <Box
                          key={i}
                          onClick={() => setSelectedImageIndex(i)}
                          sx={{
                            width: 56,
                            height: 56,
                            border: i === selectedImageIndex ? "2px solid #333" : "1px solid #ddd",
                            overflow: "hidden",
                            cursor: "pointer",
                            flexShrink: 0,
                            bgcolor: "#fff",
                          }}
                        >
                          <img
                            src={img.startsWith("http") ? img : `${MEDIA_BASE}${img}`}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>

                {/* DETAILS SECTION */}
                <Box sx={{ flex: 1, p: { xs: 3, md: 4 } }}>
                  {/* Title */}
                  <Typography
                    variant="h4"
                    sx={{
                      fontSize: { xs: "1.5rem", md: "1.75rem" },
                      fontWeight: 600,
                      mb: 1,
                      lineHeight: 1.3,
                    }}
                  >
                    {product.title}
                  </Typography>

                  {/* Brand */}
                  {product.brand && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2 }}
                    >
                      <Store fontSize="small" />
                      {product.brand.name}
                    </Typography>
                  )}

                  {/* Low Stock Alert */}
                  {isLowStock && (
                    <Alert
                      severity="warning"
                      icon={<LocalFireDepartment fontSize="small" />}
                      sx={{
                        mb: 2,
                        py: 0.5,
                        fontSize: "0.875rem",
                        bgcolor: "#fff8e1",
                        border: "1px solid #ffecb3",
                        color: "#a66400",
                      }}
                    >
                      Only {product.stock} left in stock!
                    </Alert>
                  )}

                  {/* Description */}
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3, lineHeight: 1.6 }}
                  >
                    {product.description}
                  </Typography>

                  <Divider sx={{ mb: 3 }} />

                  {/* Price */}
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                    {product.discount && product.discount > 0 && (
                      <Typography
                        sx={{
                          fontSize: "1rem",
                          color: "text.secondary",
                          textDecoration: "line-through",
                        }}
                      >
                        KES {product.price.toLocaleString()}
                      </Typography>
                    )}
                    <Typography
                      sx={{
                        fontSize: "1.75rem",
                        fontWeight: 600,
                        color: "#1a1a1a",
                      }}
                    >
                      KES {finalPrice.toLocaleString()}
                    </Typography>
                    {product.discount && (
                      <Box
                        sx={{
                          bgcolor: "#e91e63",
                          color: "white",
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        -{product.discount}%
                      </Box>
                    )}
                  </Stack>

                  {/* Colors */}
                  {product.colors && product.colors.length > 0 && (
                    <Box mb={3}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Color
                      </Typography>
                      <Stack direction="row" spacing={1.5}>
                        {product.colors.map((c) => (
                          <Box
                            key={c}
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              bgcolor: c.toLowerCase(),
                              border: "2px solid #e0e0e0",
                              cursor: "pointer",
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Quantity */}
                  <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                    {cartItem ? (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => updateCartQuantity(-1)}
                          disabled={cartItem.quantity <= 1}
                          sx={{ border: "1px solid #ddd" }}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography sx={{ minWidth: 40, textAlign: "center", fontWeight: 500 }}>
                          {cartItem.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateCartQuantity(1)}
                          disabled={cartItem.quantity >= product.stock}
                          sx={{ border: "1px solid #ddd" }}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          sx={{ border: "1px solid #ddd" }}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <TextField
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
                          size="small"
                          inputProps={{ min: 1, max: product.stock, style: { textAlign: "center" } }}
                          sx={{ width: 64 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          disabled={quantity >= product.stock}
                          sx={{ border: "1px solid #ddd" }}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Stack>

                  {/* Action Buttons */}
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<ShoppingCart />}
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: "none",
                        bgcolor: "#1a1a1a",
                        "&:hover": { bgcolor: "#000" },
                      }}
                    >
                      {cartItem ? "Update Cart" : "Add to Cart"}
                    </Button>
                    <IconButton
                      onClick={toggleWishlist}
                      sx={{
                        border: "1px solid #ddd",
                        color: isWishlisted ? "#e91e63" : "#666",
                        p: 1.5,
                      }}
                    >
                      {isWishlisted ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>
                  </Stack>
                </Box>
              </Stack>
            </Box>

            {/* RELATED PRODUCTS */}
            {relatedProducts.length > 0 && (
              <Box sx={{ mt: 8 }}>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                  You May Also Like
                </Typography>
                <Stack
                  direction="row"
                  spacing={3}
                  sx={{
                    overflowX: "auto",
                    pb: 2,
                    "&::-webkit-scrollbar": { display: "none" },
                  }}
                >
                  {relatedProducts.map((p) => {
                    const img = p.cover_image?.startsWith("http") ? p.cover_image : `${MEDIA_BASE}${p.cover_image}`;
                    const price = p.final_price || (p.discount ? p.price - (p.price * p.discount) / 100 : p.price);

                    return (
                      <Box
                        key={p.id}
                        onClick={() => router.push(`/product/${p.id}`)}
                        sx={{
                          minWidth: 180,
                          cursor: "pointer",
                          transition: "0.2s",
                          "&:hover": { opacity: 0.9 },
                        }}
                      >
                        <Box
                          sx={{
                            height: 160,
                            bgcolor: "#f9f9f9",
                            mb: 1.5,
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={img || "/images/fallback.jpg"}
                            alt={p.title}
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          />
                        </Box>
                        <Typography variant="body2" noWrap fontWeight={500}>
                          {p.title}
                        </Typography>
                        <Typography variant="subtitle2" color="primary" fontWeight={600}>
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
    </>
  );
};

export default ProductDetailPage;