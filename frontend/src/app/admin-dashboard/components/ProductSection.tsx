"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Button, TextField, Tabs, Tab, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Chip, Checkbox,
  FormControlLabel, Typography, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, Card, CardContent, CardMedia,
  Stack, Snackbar, Alert, Table, TableHead, TableRow,
  TableCell, TableBody, useTheme, useMediaQuery, styled, alpha,
  IconButton, Avatar, Divider
} from "@mui/material";
import {
  Edit, Delete, AddPhotoAlternate, Image as ImageIcon,
  Close as CloseIcon, Category, Business, Palette, Memory,
  Storage, LocalOffer, CheckCircle, Error as ErrorIcon
} from "@mui/icons-material";

/* ------------------------------------------------------------------ */
/* CONFIG */
/* ------------------------------------------------------------------ */
const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE}/products/`;
const API_OPTS = `${process.env.NEXT_PUBLIC_API_BASE}/options/`;
const API_CATS = `${process.env.NEXT_PUBLIC_API_BASE}/categories/`;
const API_BRANDS = `${process.env.NEXT_PUBLIC_API_BASE}/brands/`;

/* ------------------------------------------------------------------ */
/* STYLED COMPONENTS */
/* ------------------------------------------------------------------ */
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: "linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)",
  padding: theme.spacing(3, 2, 6),
  [theme.breakpoints.up("md")]: { padding: theme.spacing(5, 4, 8) },
}));

const FormCard = styled(Paper)(({ theme }) => ({
  overflow: "hidden",
  background: "#fff",
  boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
  border: `1px solid ${alpha("#DC1A8A", 0.1)}`,
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: "#1a1a1a",
  fontSize: "1.15rem",
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: theme.spacing(2),
  "& .icon": { color: "#DC1A8A", fontSize: "1.3rem" }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: alpha("#DC1A8A", 0.02),
    transition: "all 0.2s ease",
    '&:hover': { backgroundColor: alpha("#DC1A8A", 0.05) },
    '&.Mui-focused': {
      backgroundColor: alpha("#DC1A8A", 0.08),
      boxShadow: `0 0 0 2px ${alpha("#DC1A8A", 0.2)}`
    }
  }
}));

const UploadBox = styled(Box)(({ theme }) => ({
  border: `2.5px dashed ${alpha("#DC1A8A", 0.3)}`,
  padding: theme.spacing(4),
  textAlign: "center",
  cursor: "pointer",
  background: alpha("#DC1A8A", 0.02),
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: "#DC1A8A",
    background: alpha("#DC1A8A", 0.05),
    transform: "translateY(-2px)"
  },
  "& input": { display: "none" }
}));

const GalleryThumb = styled(Box)(({ theme }) => ({
  position: "relative",
  width: 90,
  height: 90,
  overflow: "hidden",
  border: `2px solid ${alpha("#DC1A8A", 0.25)}`,
  transition: "all 0.2s",
  "&:hover": { borderColor: "#DC1A8A", transform: "scale(1.05)" },
  "& img": { width: "100%", height: "100%", objectFit: "cover" }
}));

const SaveButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 700,
  fontSize: "1rem",
  px: 5,
  py: 1.6,
  background: "linear-gradient(135deg, #DC1A8A, #B31774)",
  color: "#fff",
  boxShadow: "0 6px 20px rgba(220, 26, 138, 0.3)",
  "&:hover": {
    background: "linear-gradient(135deg, #c4177a, #a01468)",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 24px rgba(220, 26, 138, 0.4)"
  },
  "&:disabled": { background: "#ccc", transform: "none", boxShadow: "none" }
}));

const ProductCard = styled(Card)(({ theme }) => ({
  overflow: "hidden",
  transition: "all 0.3s ease",
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  "&:hover": { transform: "translateY(-6px)", boxShadow: "0 16px 32px rgba(0,0,0,0.12)" }
}));

const DiscountBadge = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 16,
  left: 16,
  background: "linear-gradient(135deg, #e91e63, #c2185b)",
  color: "#fff",
  fontWeight: 800,
  fontSize: "0.8rem",
  px: 2,
  py: 0.8,
  boxShadow: "0 4px 12px rgba(233, 30, 99, 0.4)",
  zIndex: 2,
  letterSpacing: "0.5px"
}));

/* ------------------------------------------------------------------ */
/* ERROR LOGGING */
/* ------------------------------------------------------------------ */
const logError = (msg: string, error: any, context?: { url?: string; status?: number }) => {
  console.error(`[ProductAdmin ERROR] ${msg}`, {
    message: error?.message || String(error),
    stack: error?.stack,
    context,
  });
};

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT */
/* ------------------------------------------------------------------ */
const ProductAdminPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  /* ---------- STATE ---------- */
  const [tab, setTab] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [discount, setDiscount] = useState<number | "">(0);
  const [finalPrice, setFinalPrice] = useState<number | "">("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [brandId, setBrandId] = useState<string>("");
  const [selectedRam, setSelectedRam] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]); // ← URLs to keep

  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: "success" | "error" }>({
    open: false, msg: "", sev: "success"
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;

  /* ------------------------------------------------------------------ */
  /* FINAL PRICE CALC */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (price !== "" && discount !== "") {
      const p = Number(price);
      const d = Number(discount);
      setFinalPrice(d > 0 ? Math.round(p * (1 - d / 100) * 100) / 100 : p);
    } else {
      setFinalPrice("");
    }
  }, [price, discount]);

  /* ------------------------------------------------------------------ */
  /* CLEANUP BLOB URLS */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    return () => {
      galleryPreviews.forEach(url => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [galleryPreviews]);

  /* ------------------------------------------------------------------ */
  /* FETCH DATA */
  /* ------------------------------------------------------------------ */
  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [pRes, cRes, bRes, oRes] = await Promise.all([
        fetch(API_BASE, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(API_CATS, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(API_BRANDS, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(API_OPTS, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (!pRes.ok || !cRes.ok || !bRes.ok || !oRes.ok) {
        throw new Error(`HTTP ${[pRes, cRes, bRes, oRes].map(r => r.status).join(", ")}`);
      }

      const [pJson, cJson, bJson, oJson] = await Promise.all([
        pRes.json(), cRes.json(), bRes.json(), oRes.json()
      ]);

      setProducts(Array.isArray(pJson) ? pJson : pJson.results || []);
      setCategories(Array.isArray(cJson) ? cJson : cJson.results || []);
      setBrands(Array.isArray(bJson) ? bJson : bJson.results || []);
      setOptions(Array.isArray(oJson) ? oJson : oJson.results || []);
    } catch (error: any) {
      logError("Failed to load data", error);
      setSnack({ open: true, msg: "Failed to load data", sev: "error" });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ------------------------------------------------------------------ */
  /* IMAGE HANDLERS */
  /* ------------------------------------------------------------------ */
  const handleCover = (files: FileList | null) => {
    if (!files?.[0]) { setCoverFile(null); setCoverPreview(null); return; }
    const f = files[0];
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const handleGallery = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setGalleryFiles(prev => [...prev, ...arr]);
    setGalleryPreviews(prev => [...prev, ...arr.map(f => URL.createObjectURL(f))]);
  };

  const removeGallery = (idx: number) => {
    const isNew = idx >= existingGallery.length;
    const realIdx = isNew ? idx - existingGallery.length : idx;

    if (isNew) {
      setGalleryFiles(prev => prev.filter((_, i) => i !== realIdx));
    } else {
      setExistingGallery(prev => prev.filter((_, i) => i !== realIdx));
    }

    setGalleryPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  /* ------------------------------------------------------------------ */
  /* FORM RESET & EDIT */
  /* ------------------------------------------------------------------ */
  const resetForm = () => {
    setEditId(null); setTitle(""); setDescription(""); setPrice(""); setStock("");
    setDiscount(0); setFinalPrice(""); setSelectedCats([]); setBrandId("");
    setSelectedRam([]); setSelectedStorage([]); setSelectedColors([]); setTagNames([]);
    setCoverFile(null); setCoverPreview(null);
    setGalleryFiles([]); setGalleryPreviews([]); setExistingGallery([]);
    setIsActive(true); setIsFeatured(false); setVariants([]);
  };

  const startEdit = (p: any) => {
    setEditId(p.id);
    setTitle(p.title ?? "");
    setDescription(p.description ?? "");
    setPrice(p.price ?? "");
    setStock(p.stock ?? "");
    setDiscount(p.discount ?? 0);
    setBrandId(p.brand?.id?.toString() ?? "");
    setSelectedCats(p.categories?.map((c: any) => c.id.toString()) ?? []);
    setSelectedRam(p.ram_options?.map((o: any) => o.id.toString()) ?? []);
    setSelectedStorage(p.storage_options?.map((o: any) => o.id.toString()) ?? []);
    setSelectedColors(p.colors?.map((o: any) => o.id.toString()) ?? []);
    setTagNames(p.tags?.map((t: any) => t.name).filter(Boolean) ?? []);
    setIsActive(p.is_active ?? true);
    setIsFeatured(p.is_featured ?? false);
    setCoverPreview(p.cover_image?.url ?? p.cover_image ?? null);

    // ← PRESERVE EXISTING GALLERY
    const existing = p.images?.map((i: any) => i.image?.url ?? i.image).filter(Boolean) ?? [];
    setExistingGallery(existing);
    setGalleryPreviews(existing);

    setVariants(p.variants?.map((v: any) => ({
      id: v.id,
      sku: v.sku || "",
      color: v.color || "",
      ram: v.ram || "",
      storage: v.storage || "",
      processor: v.processor || "",
      size: v.size || "",
      price: v.price || "",
      compare_at_price: v.compare_at_price || "",
      stock: v.stock || "",
      is_active: v.is_active ?? true
    })) ?? []);
    setTab(0);
  };

  /* ------------------------------------------------------------------ */
  /* SAVE PRODUCT — FULLY FIXED */
  /* ------------------------------------------------------------------ */
  const saveProduct = async () => {
    if (!token) return;

    const form = new FormData();

    // BASIC
    if (title.trim()) form.append("title", title.trim());
    if (description.trim()) form.append("description", description.trim());
    if (price !== "" && price != null) form.append("price", String(price));
    if (stock !== "" && stock != null) form.append("stock", String(stock));
    if (discount !== "" && discount != null) form.append("discount", String(discount));
    if (isActive !== null) form.append("is_active", String(isActive));
    if (isFeatured !== null) form.append("is_featured", String(isFeatured));
    if (brandId) form.append("brand_id", brandId);

    // LISTS
    selectedCats.forEach(id => form.append("category_ids", id));
    selectedRam.forEach(id => form.append("ram_option_ids", id));
    selectedStorage.forEach(id => form.append("storage_option_ids", id));
    selectedColors.forEach(id => form.append("color_option_ids", id));
    tagNames.filter(t => t.trim()).forEach(t => form.append("tag_names", t.trim()));

    // VARIANTS
    const cleanVariants = variants
      .map(v => {
        const variant: any = {};
        if (v.sku?.trim()) variant.sku = v.sku.trim();
        if (v.color?.trim()) variant.color = v.color.trim();
        if (v.ram?.trim()) variant.ram = v.ram.trim();
        if (v.storage?.trim()) variant.storage = v.storage.trim();
        if (v.processor?.trim()) variant.processor = v.processor.trim();
        if (v.size?.trim()) variant.size = v.size.trim();
        if (v.price !== "" && v.price != null) variant.price = Number(v.price);
        if (v.compare_at_price !== "" && v.compare_at_price != null) variant.compare_at_price = Number(v.compare_at_price);
        if (v.stock !== "" && v.stock != null) variant.stock = Number(v.stock);
        variant.is_active = v.is_active ?? true;
        return variant;
      })
      .filter(v => Object.keys(v).length > 1);

    if (cleanVariants.length > 0) {
      form.append("variants", JSON.stringify(cleanVariants));
    }

    // IMAGES
    if (coverFile) form.append("cover_image", coverFile);
    galleryFiles.forEach(f => form.append("gallery_images", f)); // ← NEW FILES

    // ← SEND EXISTING URLs TO KEEP!
    existingGallery.forEach(url => form.append("keep_gallery", url));

    setSaving(true);
    try {
      const url = editId ? `${API_BASE}${editId}/` : API_BASE;
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });

      if (res.ok) {
        setSnack({ open: true, msg: editId ? "Updated!" : "Created!", sev: "success" });
        resetForm();
        fetchAll();
        setTab(1);
      } else {
        const errText = await res.text();
        setSnack({ open: true, msg: `Error: ${errText.slice(0, 120)}`, sev: "error" });
      }
    } catch (err: any) {
      setSnack({ open: true, msg: `Network error: ${err.message}`, sev: "error" });
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* DELETE & DISCOUNT */
  /* ------------------------------------------------------------------ */
  const confirmDel = (id: string) => { setDeleteId(id); setConfirmOpen(true); };
  const doDelete = async () => {
    if (!token || !deleteId) return;
    try {
      const res = await fetch(`${API_BASE}${deleteId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSnack({ open: true, msg: "Deleted!", sev: "success" });
        fetchAll();
      } else {
        setSnack({ open: true, msg: "Delete failed", sev: "error" });
      }
    } catch {
      setSnack({ open: true, msg: "Delete failed", sev: "error" });
    } finally {
      setConfirmOpen(false); setDeleteId(null);
    }
  };

  const updateDiscount = async (p: any) => {
    if (!token) return;
    const final = p.price && p.discount ? Math.round(p.price * (1 - p.discount / 100) * 100) / 100 : p.price;
    try {
      const res = await fetch(`${API_BASE}${p.id}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ discount: p.discount, final_price: final })
      });
      if (res.ok) {
        setSnack({ open: true, msg: "Discount updated", sev: "success" });
        fetchAll();
      }
    } catch {
      setSnack({ open: true, msg: "Update failed", sev: "error" });
    }
  };

  const filtered = categoryFilter === "all" ? products : products.filter(p => p.categories?.some((c: any) => c.id === categoryFilter));
  const discounted = products.filter(p => p.discount && p.discount > 0);

  const addVariant = () => setVariants(prev => [...prev, { sku: "", price: "", stock: "", is_active: true }]);
  const updateVariant = (idx: number, field: string, value: any) => {
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  };
  const removeVariant = (idx: number) => setVariants(prev => prev.filter((_, i) => i !== idx));
  const getCoverSrc = (p: any) => p.cover_image?.url || p.cover_image || "/placeholder.png";

  /* ------------------------------------------------------------------ */
  /* RENDER */
  /* ------------------------------------------------------------------ */
  return (
    <PageContainer>
      {/* TABS */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 5 }}>
        <Tab label={editId ? "Edit Product" : "Add Product"} />
        <Tab label="All Products" />
        <Tab label="Discounted" />
      </Tabs>

      {/* FORM TAB */}
      {tab === 0 && (
        <FormCard elevation={0}>
          <Box sx={{ p: { xs: 3, md: 6 } }}>
            <Typography variant="h4" sx={{ mb: 5, fontWeight: 800, textAlign: "center" }}>
              {editId ? "Edit Product" : "Add New Product"}
            </Typography>

            <Stack spacing={5}>
              {/* BASIC INFO */}
              <Box>
                <SectionHeader><Category className="icon" /> Basic Information</SectionHeader>
                <Stack spacing={3}>
                  <StyledTextField label="Title" value={title} onChange={e => setTitle(e.target.value)} fullWidth />
                  <StyledTextField label="Description" value={description} onChange={e => setDescription(e.target.value)} multiline rows={3} fullWidth />
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <StyledTextField label="Price (KES)" type="number" value={price} onChange={e => setPrice(Number(e.target.value) || "")} sx={{ flex: 1 }} />
                    <StyledTextField label="Discount %" type="number" value={discount} onChange={e => setDiscount(Number(e.target.value) || 0)} sx={{ flex: 1 }} />
                    <StyledTextField label="Final Price" value={finalPrice} disabled sx={{ flex: 1 }} />
                  </Stack>
                  <StyledTextField label="Stock Quantity" type="number" value={stock} onChange={e => setStock(Number(e.target.value) || "")} fullWidth />
                </Stack>
              </Box>

              <Divider />

              {/* BRAND & CATEGORIES */}
              <Box>
                <SectionHeader><Business className="icon" /> Brand & Category</SectionHeader>
                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel>Brand</InputLabel>
                    <Select value={brandId} onChange={e => setBrandId(e.target.value)} label="Brand">
                      <MenuItem value="">None</MenuItem>
                      {brands.map(b => <MenuItem key={b.id} value={b.id.toString()}>{b.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel>Categories</InputLabel>
                    <Select multiple value={selectedCats} onChange={e => setSelectedCats(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)}
                      renderValue={sel => (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {(sel as string[]).map(v => {
                            const cat = categories.find((c: any) => c.id.toString() === v);
                            return <Chip key={v} label={cat?.name} size="small" sx={{ bgcolor: "#DC1A8A", color: "#fff" }} />;
                          })}
                        </Box>
                      )}
                    >
                      {categories.map(c => (
                        <MenuItem key={c.id} value={c.id.toString()}>
                          <Checkbox checked={selectedCats.includes(c.id.toString())} /> {c.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Box>

              <Divider />

              {/* OPTIONS */}
              <Box>
                <SectionHeader><Palette className="icon" /> Product Options</SectionHeader>
                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                  {["RAM", "STORAGE", "COLOR"].map(type => (
                    <FormControl key={type} sx={{ flex: 1 }}>
                      <InputLabel>{type === "COLOR" ? "Colors" : `${type} Options`}</InputLabel>
                      <Select multiple value={type === "RAM" ? selectedRam : type === "STORAGE" ? selectedStorage : selectedColors}
                        onChange={e => {
                          const val = typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value;
                          if (type === "RAM") setSelectedRam(val);
                          else if (type === "STORAGE") setSelectedStorage(val);
                          else setSelectedColors(val);
                        }}
                        renderValue={sel => (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {(sel as string[]).map(v => {
                              const o = options.find(o => o.id.toString() === v);
                              return <Chip key={v} label={o?.value} size="small" sx={{ bgcolor: "#DC1A8A", color: "#fff" }} />;
                            })}
                          </Box>
                        )}
                      >
                        {options.filter(o => o.type === type).map(o => (
                          <MenuItem key={o.id} value={o.id.toString()}>
                            <Checkbox checked={
                              type === "RAM" ? selectedRam.includes(o.id.toString()) :
                              type === "STORAGE" ? selectedStorage.includes(o.id.toString()) :
                              selectedColors.includes(o.id.toString())
                            } />
                            {o.value}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ))}
                </Stack>
              </Box>

              <Divider />

              {/* TAGS */}
              <Box>
                <SectionHeader><LocalOffer className="icon" /> Tags</SectionHeader>
                <StyledTextField
                  label="Tags (comma separated)"
                  value={tagNames.join(", ")}
                  onChange={e => setTagNames(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                  fullWidth
                  helperText="e.g. new, bestseller, limited"
                />
              </Box>

              <Divider />

              {/* IMAGES */}
              <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
                <Box sx={{ flex: 1 }}>
                  <SectionHeader><ImageIcon className="icon" /> Cover Image</SectionHeader>
                  <UploadBox>
                    <input type="file" accept="image/*" onChange={e => handleCover(e.target.files)} id="cover-upload" />
                    <label htmlFor="cover-upload">
                      <AddPhotoAlternate sx={{ fontSize: 50, color: "#DC1A8A", mb: 1 }} />
                      <Typography variant="body2" sx={{ color: "#666" }}>Drop or click</Typography>
                    </label>
                  </UploadBox>
                  {coverPreview && (
                    <Box sx={{ mt: 2, textAlign: "center" }}>
                      <Avatar variant="rounded" src={coverPreview} sx={{ width: 220, height: 160, mx: "auto", border: "3px solid #DC1A8A" }} />
                    </Box>
                  )}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <SectionHeader><ImageIcon className="icon" /> Gallery</SectionHeader>
                  <UploadBox>
                    <input type="file" accept="image/*" multiple onChange={e => handleGallery(e.target.files)} id="gallery-upload" />
                    <label htmlFor="gallery-upload">
                      <ImageIcon sx={{ fontSize: 50, color: "#DC1A8A", mb: 1 }} />
                      <Typography variant="body2" sx={{ color: "#666" }}>Add multiple</Typography>
                    </label>
                  </UploadBox>
                  <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 2 }}>
                    {galleryPreviews.map((src, i) => (
                      <GalleryThumb key={i}>
                        <img src={src} alt="" />
                        <IconButton size="small" onClick={() => removeGallery(i)} sx={{
                          position: "absolute", top: -10, right: -10,
                          bgcolor: "rgba(0,0,0,0.7)", "&:hover": { bgcolor: "rgba(0,0,0,0.9)" }
                        }}>
                          <CloseIcon fontSize="small" sx={{ color: "#fff" }} />
                        </IconButton>
                      </GalleryThumb>
                    ))}
                  </Box>
                </Box>
              </Stack>

              <Divider />

              {/* VARIANTS */}
              <Box>
                <SectionHeader><Memory className="icon" /> Variants</SectionHeader>
                <Button variant="outlined" size="small" onClick={addVariant} sx={{ mb: 2 }}>
                  Add Variant
                </Button>
                <Stack spacing={2}>
                  {variants.map((v, i) => (
                    <Card key={i} variant="outlined" sx={{ p: 2.5, bgcolor: alpha("#DC1A8A", 0.02) }}>
                      <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
                        <TextField size="small" label="SKU" value={v.sku} onChange={e => updateVariant(i, "sku", e.target.value)} />
                        <TextField size="small" label="Price" type="number" value={v.price} onChange={e => updateVariant(i, "price", e.target.value)} />
                        <TextField size="small" label="Stock" type="number" value={v.stock} onChange={e => updateVariant(i, "stock", e.target.value)} />
                        <IconButton size="small" color="error" onClick={() => removeVariant(i)}><CloseIcon /></IconButton>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Box>

              <Divider />

              {/* TOGGLES & SAVE */}
              <Box>
                <Stack direction="row" spacing={4} sx={{ mb: 4 }}>
                  <FormControlLabel control={<Checkbox checked={isActive} onChange={e => setIsActive(e.target.checked)} />} label="Active" />
                  <FormControlLabel control={<Checkbox checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />} label="Featured" />
                </Stack>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <SaveButton onClick={saveProduct} disabled={saving}>
                    {saving ? "Saving..." : editId ? "Update Product" : "Create Product"}
                  </SaveButton>
                </Box>
              </Box>
            </Stack>
          </Box>
        </FormCard>
      )}

      {/* ALL PRODUCTS TAB */}
      {tab === 1 && (
        <Box>
          <Tabs value={categoryFilter} onChange={(_, v) => setCategoryFilter(v)} variant={isMobile ? "scrollable" : "standard"} sx={{ mb: 4 }}>
            <Tab label="All" value="all" />
            {categories.map(c => <Tab key={c.id} label={c.name} value={c.id} />)}
          </Tabs>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress size={70} thickness={5} sx={{ color: "#DC1A8A" }} />
            </Box>
          ) : filtered.length === 0 ? (
            <Typography textAlign="center" color="text.secondary" py={10} variant="h6">No products found</Typography>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: isMobile ? "center" : "flex-start" }}>
              {filtered.map(p => (
                <Box key={p.id} sx={{ width: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)", lg: "calc(25% - 18px)" } }}>
                  <ProductCard>
                    {p.discount > 0 && <DiscountBadge>{p.discount}% OFF</DiscountBadge>}
                    <Box onClick={() => startEdit(p)} sx={{ height: 220, cursor: "pointer", overflow: "hidden" }}>
                      <CardMedia component="img" image={getCoverSrc(p)} sx={{ width: "100%", height: "100%", objectFit: "cover", transition: "0.3s", "&:hover": { transform: "scale(1.06)" } }} />
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" noWrap sx={{ fontWeight: 700, mb: 1 }}>{p.title || "Untitled"}</Typography>
                      <Typography variant="body2" sx={{ color: "#666", mb: 2, height: 44, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.description || "No description"}</Typography>
                      <Box sx={{ mb: 2 }}>
                        {p.discount > 0 && (
                          <Typography sx={{ textDecoration: "line-through", color: "#999", fontSize: "0.9rem" }}>
                            KES {p.price?.toLocaleString() || "—"}
                          </Typography>
                        )}
                        <Typography sx={{ fontWeight: 700, color: "#DC1A8A", fontSize: "1.2rem" }}>
                          KES {(p.final_price ?? p.price)?.toLocaleString() || "—"}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" startIcon={<Edit />} onClick={() => startEdit(p)} sx={{ flex: 1, bgcolor: alpha("#DC1A8A", 0.1), "&:hover": { bgcolor: alpha("#DC1A8A", 0.2) } }}>
                          Edit
                        </Button>
                        <Button size="small" startIcon={<Delete />} onClick={() => confirmDel(p.id)} sx={{ flex: 1, bgcolor: "#ffebee", color: "#d32f2f", "&:hover": { bgcolor: "#ffcdd2" } }}>
                          Delete
                        </Button>
                      </Stack>
                    </CardContent>
                  </ProductCard>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* DISCOUNTED TABLE */}
      {tab === 2 && (
        <Paper elevation={0} sx={{ overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
          <Box sx={{ p: { xs: 3, md: 5 } }}>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 700 }}>Discounted Products</Typography>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress size={60} sx={{ color: "#DC1A8A" }} />
              </Box>
            ) : discounted.length === 0 ? (
              <Typography textAlign="center" color="text.secondary" py={8}>No discounted products</Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha("#DC1A8A", 0.08) }}>
                    <TableCell><strong>Image</strong></TableCell>
                    <TableCell><strong>Title</strong></TableCell>
                    <TableCell><strong>Original</strong></TableCell>
                    <TableCell><strong>Discount %</strong></TableCell>
                    <TableCell><strong>Final Price</strong></TableCell>
                    <TableCell><strong>Brand</strong></TableCell>
                    <TableCell><strong>Action</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {discounted.map(p => (
                    <TableRow key={p.id} hover>
                      <TableCell><img src={getCoverSrc(p)} width={60} height={60} style={{ objectFit: "cover", border: "2px solid #eee" }} /></TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{p.title || "Untitled"}</TableCell>
                      <TableCell><Typography sx={{ textDecoration: "line-through", color: "#999" }}>KES {p.price?.toLocaleString() || "—"}</Typography></TableCell>
                      <TableCell>
                        <TextField type="number" size="small" value={p.discount ?? 0}
                          onChange={e => setProducts(prev => prev.map(x => x.id === p.id ? { ...x, discount: Number(e.target.value) } : x))}
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#DC1A8A" }}>
                        KES {(p.price! * (1 - (p.discount || 0) / 100)).toFixed(0)}
                      </TableCell>
                      <TableCell>{p.brand?.name || "—"}</TableCell>
                      <TableCell>
                        <Button size="small" variant="contained" sx={{ bgcolor: "#DC1A8A", "&:hover": { bgcolor: "#B31774" } }} onClick={() => updateDiscount(p)}>
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        </Paper>
      )}

      {/* DIALOG & SNACKBAR */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent><Typography>This action cannot be undone. Are you sure?</Typography></DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={doDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.sev} sx={{
          width: "100%", fontWeight: 600, boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
          ...(snack.sev === "success" && { bgcolor: "#4caf50", color: "#fff" }),
          ...(snack.sev === "error" && { bgcolor: "#f44336", color: "#fff" }),
        }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default ProductAdminPage;