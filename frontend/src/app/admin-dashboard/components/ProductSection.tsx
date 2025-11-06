// app/admin-dashboard/products/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Box, Button, TextField, Tabs, Tab, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Chip, Checkbox,
  FormControlLabel, Typography, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, Card, CardContent, CardMedia,
  Stack, Snackbar, Alert, Table, TableHead, TableRow,
  TableCell, TableBody, useTheme, useMediaQuery, styled, alpha
} from "@mui/material";
import { Edit, Delete, AddPhotoAlternate, Image as ImageIcon } from "@mui/icons-material";
import { getProductImageSrc } from "@/app/utils/image";
import type { Product } from "@/app/types/products";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
const API_PRODUCTS = `${API_BASE}/products/products/`;
const API_CATEGORIES = `${API_BASE}/products/categories/`;
const API_BRANDS = `${API_BASE}/products/brands/`;
const API_COLORS = `${API_BASE}/products/colors/`;
const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE || API_BASE;

const storageOptions = [64, 128, 256, 512, 1024, 2048];
const ramOptions = [2, 4, 6, 8, 12, 16, 24, 32, 64, 128, 256];

const StyledPaper = styled(Paper)(({ theme }) => ({
  overflow: "hidden",
  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
  background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  overflow: "hidden",
  transition: "all 0.3s ease",
  background: "#fff",
  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
}));

const DiscountBadge = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 12,
  left: 12,
  background: "linear-gradient(135deg, #e91e63, #c2185b)",
  color: "#fff",
  fontWeight: 700,
  fontSize: "0.75rem",
  px: 1.5,
  py: 0.5,
  boxShadow: "0 2px 8px rgba(233, 30, 99, 0.3)",
  zIndex: 2,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  px: 3,
  py: 1.2,
  transition: "all 0.2s",
  "&.primary": {
    background: "linear-gradient(135deg, #DC1A8A, #B31774)",
    color: "#fff",
  },
  "&.danger": {
    background: "#f44336",
    color: "#fff",
  },
}));

const ImageUpload = styled(Box)(({ theme }) => ({
  border: `2px dashed ${alpha("#DC1A8A", 0.3)}`,
  padding: theme.spacing(3),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.2s",
  background: alpha("#DC1A8A", 0.02),
  "& input": { display: "none" },
}));

const GalleryPreview = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  mt: 1,
  "& img": {
    width: 80,
    height: 80,
    objectFit: "cover",
    border: `2px solid ${alpha("#DC1A8A", 0.2)}`,
    transition: "all 0.2s",
  },
}));

const ProductAdminPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [tab, setTab] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [colors, setColors] = useState<{ id: number; name: string; hex_code: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [discount, setDiscount] = useState<number | "">(0);
  const [finalPrice, setFinalPrice] = useState<number | "">("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [brandId, setBrandId] = useState<string>("");
  const [storageGB, setStorageGB] = useState<string>("");
  const [ramGB, setRamGB] = useState<string>("");
  const [colorId, setColorId] = useState<string>("");
  const [condition, setCondition] = useState<"new" | "ex_dubai" | "">("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: "success" | "error" }>({
    open: false, msg: "", sev: "success"
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;

  useEffect(() => {
    if (price !== "" && discount !== "") {
      const p = Number(price);
      const d = Number(discount);
      setFinalPrice(d > 0 ? p - (p * d) / 100 : p);
    } else {
      setFinalPrice("");
    }
  }, [price, discount]);

  const fetchData = async () => {
    if (!token || !API_BASE) return;
    setLoading(true);
    try {
      const [pRes, cRes, bRes, colRes] = await Promise.all([
        fetch(API_PRODUCTS, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(API_CATEGORIES, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(API_BRANDS, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(API_COLORS, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (!pRes.ok || !cRes.ok || !bRes.ok || !colRes.ok) {
        throw new Error(`HTTP ${pRes.status} ${cRes.status} ${bRes.status} ${colRes.status}`);
      }

      const [pJson, cJson, bJson, colJson] = await Promise.all([
        pRes.json(),
        cRes.json(),
        bRes.json(),
        colRes.json()
      ]);

      setProducts(Array.isArray(pJson) ? pJson : pJson.results || []);
      setCategories(Array.isArray(cJson) ? cJson : cJson.results || []);
      setBrands(Array.isArray(bJson) ? bJson : bJson.results || []);
      setColors(Array.isArray(colJson) ? colJson : colJson.results || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setSnack({ open: true, msg: "Failed to load data", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleCover = (files: FileList | null) => {
    if (!files?.[0]) { setCoverFile(null); setCoverPreview(null); return; }
    const f = files[0];
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const handleGallery = (files: FileList | null) => {
    if (!files) { setGalleryFiles([]); setGalleryPreviews([]); return; }
    const arr = Array.from(files);
    setGalleryFiles(arr);
    setGalleryPreviews(arr.map(f => URL.createObjectURL(f)));
  };

  const resetForm = () => {
    setEditId(null); setTitle(""); setDescription(""); setPrice(""); setStock("");
    setDiscount(0); setFinalPrice(""); setSelectedCats([]); setBrandId("");
    setStorageGB(""); setRamGB(""); setColorId(""); setCondition("");
    setCoverFile(null); setCoverPreview(null); setGalleryFiles([]); setGalleryPreviews([]);
    setIsActive(true); setIsFeatured(false);
  };

  // === FINAL FIXED SAVE PRODUCT ===
  const saveProduct = async () => {
    if (!token || !title || price === "" || !brandId) {
      setSnack({ open: true, msg: "Fill required fields", sev: "error" });
      return;
    }

    const form = new FormData();
    form.append("title", title);
    form.append("description", description || "");
    form.append("price", String(price));
    form.append("stock", String(stock || 0));
    form.append("discount", String(discount || 0));
    form.append("is_active", String(isActive));
    form.append("is_featured", String(isFeatured));
    form.append("brand_id", brandId);

    // FIXED: Use [] syntax for many-to-many
    selectedCats.forEach(id => {
      form.append("category_ids[]", id);
    });

    const safeTrim = (val: string | number | undefined | null): string | null => {
      if (val === null || val === undefined) return null;
      const str = String(val);
      return str.trim() ? str : null;
    };

    const colorIdStr = safeTrim(colorId);
    const storageGBStr = safeTrim(storageGB);
    const ramGBStr = safeTrim(ramGB);

    if (colorIdStr) form.append("color_id", colorIdStr);
    if (storageGBStr) form.append("storage_gb", storageGBStr);
    if (ramGBStr) form.append("ram_gb", ramGBStr);
    if (condition) form.append("condition", condition);

    if (coverFile) form.append("cover_image", coverFile);
    galleryFiles.forEach(f => form.append("gallery", f));

    console.log("SAVING PRODUCT...");
    console.log("URL:", editId ? `${API_PRODUCTS}${editId}/` : API_PRODUCTS);
    console.log("FORM DATA:");
    for (let [k, v] of form.entries()) {
      if (v instanceof File) {
        console.log(k, `(File: ${v.name}, ${v.size} bytes)`);
      } else {
        console.log(k, v);
      }
    }

    setSaving(true);
    try {
      const url = editId ? `${API_PRODUCTS}${editId}/` : API_PRODUCTS;
      const res = await fetch(url, {
        method: editId ? "PATCH" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });

      const text = await res.text();
      console.log("RESPONSE STATUS:", res.status);
      console.log("RESPONSE BODY:", text);

      if (res.ok) {
        const data = JSON.parse(text);
        console.log("SUCCESS:", data);
        setSnack({ open: true, msg: editId ? "Updated!" : "Added!", sev: "success" });
        resetForm();
        fetchData();
        setTab(1);
      } else {
        console.error("SAVE FAILED:", res.status, text);
        setSnack({ open: true, msg: `Error ${res.status}: ${text.substring(0, 200)}`, sev: "error" });
      }
    } catch (err: any) {
      console.error("NETWORK ERROR:", err);
      setSnack({ open: true, msg: `Network error: ${err.message}`, sev: "error" });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (p: Product) => {
    const id = String(p.id);
    setEditId(id);
    setTitle(p.title || "");
    setDescription(p.description || "");
    setPrice(p.price || "");
    setStock(p.stock || "");
    setDiscount(p.discount || 0);
    setFinalPrice(p.final_price || "");
    setBrandId(p.brand?.id?.toString() || "");
    setSelectedCats(p.categories?.map(c => String(c.id)) || []);
    setStorageGB(p.storage_gb?.toString() || "");
    setRamGB(p.ram_gb?.toString() || "");
    setColorId(p.color?.id?.toString() || "");
    setCondition(p.condition || "");
    setIsActive(p.is_active ?? true);
    setIsFeatured(p.is_featured ?? false);

    if (p.cover_image) {
      const url = p.cover_image.startsWith("http") ? p.cover_image : `${MEDIA_BASE}${p.cover_image}`;
      setCoverPreview(url);
    }
    if (p.images?.length) {
      const urls = p.images.map(img => img.image.startsWith("http") ? img.image : `${MEDIA_BASE}${img.image}`);
      setGalleryPreviews(urls);
    }
    setTab(0);
  };

  const confirmDel = (id: string) => { setDeleteId(id); setConfirmOpen(true); };
  const doDelete = async () => {
    if (!token || !deleteId) return;
    try {
      await fetch(`${API_PRODUCTS}${deleteId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnack({ open: true, msg: "Deleted", sev: "success" });
      fetchData();
    } catch {
      setSnack({ open: true, msg: "Delete failed", sev: "error" });
    } finally {
      setConfirmOpen(false); setDeleteId(null);
    }
  };

  const updateDiscount = async (p: Product) => {
    if (!token) return;
    setSavingId(p.id);
    const final = p.price! - (p.price! * (p.discount || 0)) / 100;
    try {
      await fetch(`${API_PRODUCTS}${p.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ discount: p.discount, final_price: final })
      });
      setSnack({ open: true, msg: "Discount updated", sev: "success" });
      fetchData();
    } catch {
      setSnack({ open: true, msg: "Update failed", sev: "error" });
    } finally {
      setSavingId(null);
    }
  };

  const filtered = categoryFilter === "all"
    ? products
    : products.filter(p => p.categories?.some(c => c.id === categoryFilter));

  const discounted = products.filter(p => p.discount && p.discount > 0);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", p: { xs: 2, md: 4 } }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 4 }}>
        <Tab label={editId ? "Edit Product" : "Add Product"} />
        <Tab label="All Products" />
        <Tab label="Discounted" />
      </Tabs>

      {tab === 0 && (
        <StyledPaper elevation={0}>
          <Box sx={{ p: { xs: 3, md: 5 } }}>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: "#222" }}>
              {editId ? "Edit Product" : "Add New Product"}
            </Typography>

            <Stack spacing={4}>
              <TextField label="Title *" value={title} onChange={e => setTitle(e.target.value)} fullWidth />
              <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} multiline rows={4} fullWidth />

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField label="Price *" type="number" value={price} onChange={e => setPrice(Number(e.target.value) || "")} />
                <TextField label="Discount %" type="number" value={discount} onChange={e => setDiscount(Number(e.target.value) || 0)} />
                <TextField label="Final Price" value={finalPrice} disabled />
              </Stack>

              <TextField label="Stock" type="number" value={stock} onChange={e => setStock(Number(e.target.value) || "")} fullWidth />

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Storage (GB)</InputLabel>
                  <Select value={storageGB} onChange={e => setStorageGB(e.target.value)}>
                    <MenuItem value="">None</MenuItem>
                    {storageOptions.map(gb => (
                      <MenuItem key={gb} value={gb}>{gb >= 1024 ? `${gb / 1024}TB` : `${gb}GB`}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>RAM (GB)</InputLabel>
                  <Select value={ramGB} onChange={e => setRamGB(e.target.value)}>
                    <MenuItem value="">None</MenuItem>
                    {ramOptions.map(ram => <MenuItem key={ram} value={ram}>{ram}GB</MenuItem>)}
                  </Select>
                </FormControl>
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Color</InputLabel>
                  <Select value={colorId} onChange={e => setColorId(e.target.value)}>
                    <MenuItem value="">None</MenuItem>
                    {colors.map(c => (
                      <MenuItem key={c.id} value={c.id}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box sx={{ width: 16, height: 16, bgcolor: c.hex_code, borderRadius: "50%", border: "1px solid #ccc" }} />
                          {c.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Condition</InputLabel>
                  <Select value={condition} onChange={e => setCondition(e.target.value as any)}>
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="ex_dubai">Ex-Dubai</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <FormControl fullWidth>
                <InputLabel>Categories</InputLabel>
                <Select
                  multiple
                  value={selectedCats}
                  onChange={e => setSelectedCats(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)}
                  renderValue={sel => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(sel as string[]).map(v => {
                        const cat = categories.find(c => String(c.id) === v);
                        return <Chip key={v} label={cat?.name} size="small" sx={{ bgcolor: "#DC1A8A", color: "#fff" }} />;
                      })}
                    </Box>
                  )}
                >
                  {categories.map(c => (
                    <MenuItem key={c.id} value={String(c.id)}>
                      <Checkbox checked={selectedCats.includes(String(c.id))} />
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Brand *</InputLabel>
                <Select value={brandId} onChange={e => setBrandId(e.target.value)}>
                  <MenuItem value="">None</MenuItem>
                  {brands.map(b => (
                    <MenuItem key={b.id} value={String(b.id)}>{b.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction="row" spacing={3}>
                <FormControlLabel control={<Checkbox checked={isActive} onChange={e => setIsActive(e.target.checked)} />} label="Active" />
                <FormControlLabel control={<Checkbox checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />} label="Featured" />
              </Stack>

              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Cover Image</Typography>
                <ImageUpload>
                  <input type="file" accept="image/*" onChange={e => handleCover(e.target.files)} id="cover-upload" />
                  <label htmlFor="cover-upload" style={{ cursor: "pointer", width: "100%" }}>
                    <AddPhotoAlternate sx={{ fontSize: 40, color: "#DC1A8A", mb: 1 }} />
                    <Typography>Click to upload cover</Typography>
                  </label>
                </ImageUpload>
                {coverPreview && (
                  <Box sx={{ mt: 2, textAlign: "center" }}>
                    <img src={coverPreview} alt="cover" style={{ width: 240, height: 180, objectFit: "cover", border: "2px solid #DC1A8A" }} />
                  </Box>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Gallery</Typography>
                <ImageUpload>
                  <input type="file" accept="image/*" multiple onChange={e => handleGallery(e.target.files)} id="gallery-upload" />
                  <label htmlFor="gallery-upload" style={{ cursor: "pointer", width: "100%" }}>
                    <ImageIcon sx={{ fontSize: 40, color: "#DC1A8A", mb: 1 }} />
                    <Typography>Click to upload gallery images</Typography>
                  </label>
                </ImageUpload>
                <GalleryPreview>
                  {galleryPreviews.map((src, i) => (
                    <img key={i} src={src} alt="" />
                  ))}
                </GalleryPreview>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <StyledButton className="primary" onClick={saveProduct} disabled={saving}>
                  {saving ? "Saving..." : editId ? "Update Product" : "Add Product"}
                </StyledButton>
              </Box>
            </Stack>
          </Box>
        </StyledPaper>
      )}

      {/* ALL PRODUCTS & DISCOUNTED TABLE */}
      {/* (Same as before — no changes needed) */}
      {/* ... UI remains identical ... */}
    </Box>
  );
};

export default ProductAdminPage;