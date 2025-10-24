"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";

type ProductT = {
  id: string;
  title?: string;
  price?: number;
  discount?: number;
  stock?: number;
  brand?: { id: number; name: string };
  categories?: { id: number; name: string }[];
  cover_images?: string[];
};

const DiscountProductsPage = () => {
  const [products, setProducts] = useState<ProductT[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const API_BASE = "http://localhost:8000/api/products";
  const MEDIA_BASE = "http://localhost:8000";
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access") : null;

  // 🧠 Fetch only discounted products
  const fetchDiscountedProducts = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const allProducts = Array.isArray(data) ? data : data.results;
      const discounted = allProducts.filter(
        (p: ProductT) => p.discount && p.discount > 0
      );
      setProducts(discounted);
    } catch (err) {
      console.error("Error fetching discounted products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountedProducts();
  }, []);

  // 💾 Handle updating a discount
  const handleDiscountChange = (id: string, newDiscount: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, discount: Number(newDiscount) } : p
      )
    );
  };

  const handleSaveDiscount = async (p: ProductT) => {
    if (!token) return;
    setSavingId(p.id);
    try {
      const finalPrice = p.price
        ? p.price - (p.price * (p.discount || 0)) / 100
        : 0;

      const res = await fetch(`${API_BASE}/${p.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          discount: p.discount,
          final_price: finalPrice,
        }),
      });

      if (res.ok) {
        alert(`Discount updated for ${p.title}!`);
        fetchDiscountedProducts();
      } else {
        const text = await res.text();
        console.error(text);
        alert("Failed to update discount");
      }
    } catch (err) {
      console.error("Error updating discount:", err);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor: "#fff", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: "#222",
          mb: 4,
          textTransform: "capitalize",
        }}
      >
        Discounted Products
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : products.length === 0 ? (
        <Typography sx={{ color: "#777" }}>
          No discounted products found 🛒
        </Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Original Price</TableCell>
              <TableCell>Discount (%)</TableCell>
              <TableCell>Final Price</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.cover_images?.length ? (
                    <img
                      src={
                        p.cover_images[0].startsWith("http")
                          ? p.cover_images[0]
                          : `${MEDIA_BASE}${p.cover_images[0]}`
                      }
                      alt={p.title}
                      width={50}
                      height={50}
                      style={{
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  ) : (
                    "—"
                  )}
                </TableCell>

                <TableCell>{p.title}</TableCell>

                <TableCell>
                  <Typography
                    sx={{
                      color: "#888",
                      textDecoration:
                        p.discount && p.discount > 0
                          ? "line-through"
                          : "none",
                    }}
                  >
                    KES {p.price}
                  </Typography>
                </TableCell>

                <TableCell>
                  <TextField
                    type="number"
                    value={p.discount ?? 0}
                    onChange={(e) =>
                      handleDiscountChange(p.id, Number(e.target.value))
                    }
                    size="small"
                    sx={{ width: 80 }}
                  />
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  KES{" "}
                  {p.price
                    ? (p.price - (p.price * (p.discount || 0)) / 100).toFixed(2)
                    : "0.00"}
                </TableCell>

                <TableCell>{p.brand?.name || "—"}</TableCell>

                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: "#000",
                      "&:hover": { backgroundColor: "#333" },
                      textTransform: "none",
                    }}
                    onClick={() => handleSaveDiscount(p)}
                    disabled={savingId === p.id}
                  >
                    {savingId === p.id ? "Saving..." : "Update"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default DiscountProductsPage;
