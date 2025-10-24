"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { Favorite, Add, Remove, ShoppingCart } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

type ProductT = {
  id: string;
  title: string;
  description: string;
  price: number;
  discount?: number;
  final_price?: number;
  stock: number;
  cover_images?: string[];
  colors?: string[];
};

const PIDPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const [product, setProduct] = useState<ProductT | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<Record<string, any>>({});

  const MEDIA_BASE = "http://localhost:8000";

  // Load cart/wishlist from localStorage
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "{}");
    const storedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setCart(storedCart);
    setWishlist(new Set(storedWishlist));
  }, []);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetch(`http://localhost:8000/api/products/${productId}/`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        if (data.colors?.length) setSelectedColor(data.colors[0]);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [productId]);

  // Update localStorage on cart/wishlist change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(Array.from(wishlist)));
  }, [wishlist]);

  if (loading || !product) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const finalPrice =
    product.discount && product.discount > 0
      ? product.price - (product.price * product.discount) / 100
      : product.price;

  const handleAddToCart = () => {
    setCart((prev) => {
      const key = `${product.id}_${selectedColor}`;
      const newCart = { ...prev };
      if (newCart[key]) {
        if (newCart[key].quantity < product.stock) newCart[key].quantity += quantity;
      } else {
        newCart[key] = {
          id: product.id,
          title: product.title,
          price: finalPrice,
          quantity,
          color: selectedColor,
        };
      }
      return newCart;
    });
  };

  const handleWishlistToggle = () => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(product.id)) newSet.delete(product.id);
      else newSet.add(product.id);
      return newSet;
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, p: 3, gap: 4 }}>
      {/* Images */}
      <Box sx={{ flex: 1 }}>
        <Card sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            image={
              product.cover_images?.[currentImage]?.startsWith("http")
                ? product.cover_images[currentImage]
                : `${MEDIA_BASE}${product.cover_images?.[currentImage]}`
            }
            alt={product.title}
            sx={{ width: "100%", height: 400, objectFit: "cover" }}
          />
        </Card>
        {product.cover_images?.length && product.cover_images.length > 1 && (
          <Box sx={{ display: "flex", gap: 1, mt: 1, overflowX: "auto" }}>
            {product.cover_images.map((img, idx) => (
              <img
                key={idx}
                src={img.startsWith("http") ? img : `${MEDIA_BASE}${img}`}
                alt={`thumb ${idx}`}
                style={{
                  width: 80,
                  height: 80,
                  objectFit: "cover",
                  borderRadius: 4,
                  border: currentImage === idx ? "2px solid #DC1A8A" : "1px solid #ccc",
                  cursor: "pointer",
                }}
                onClick={() => setCurrentImage(idx)}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Product Info */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {product.title}
        </Typography>
        <Typography variant="body1" sx={{ color: "#555" }}>
          {product.description}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {product.discount && product.discount > 0 && (
            <Typography sx={{ textDecoration: "line-through", color: "#888" }}>
              KES {product.price}
            </Typography>
          )}
          <Typography sx={{ fontWeight: 700, fontSize: 20 }}>KES {finalPrice.toFixed(2)}</Typography>
          {product.discount && product.discount > 0 && (
            <Typography sx={{ color: "#fff", backgroundColor: "#DC1A8A", px: 1, borderRadius: 1, fontSize: 14 }}>
              {product.discount}% OFF
            </Typography>
          )}
        </Box>

        {/* Colors */}
        {product.colors?.length && (
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Color</InputLabel>
            <Select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              input={<OutlinedInput label="Color" />}
            >
              {product.colors.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Quantity */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => setQuantity(Math.max(quantity - 1, 1))}>
            <Remove />
          </IconButton>
          <Typography>{quantity}</Typography>
          <IconButton onClick={() => setQuantity(Math.min(quantity + 1, product.stock))}>
            <Add />
          </IconButton>
          <Typography sx={{ color: "#888" }}>(Stock: {product.stock})</Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<ShoppingCart />}
            onClick={handleAddToCart}
            sx={{ backgroundColor: "#DC1A8A", "&:hover": { backgroundColor: "#b1166f" } }}
          >
            Add to Cart
          </Button>
          <IconButton onClick={handleWishlistToggle} sx={{ color: wishlist.has(product.id) ? "#DC1A8A" : "#555" }}>
            <Favorite />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default PIDPage;
