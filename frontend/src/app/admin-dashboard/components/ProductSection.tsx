"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Button, TextField, Tabs, Tab, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Chip, Checkbox,
  FormControlLabel, Typography, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, Card, CardContent, CardMedia,
  Stack, Snackbar, Alert, Table, TableHead, TableRow,
  TableCell, TableBody, useTheme, useMediaQuery, styled, alpha,
  IconButton
} from "@mui/material";
import {
  Edit, Delete, AddPhotoAlternate, Image as ImageIcon,
  Close as CloseIcon
} from "@mui/icons-material";

/* ------------------------------------------------------------------ */
/*  CONFIG                                                            */
/* ------------------------------------------------------------------ */
const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE}/products/`;
const API_OPTS  = `${process.env.NEXT_PUBLIC_API_BASE}/options/`;
const API_CATS  = `${process.env.NEXT_PUBLIC_API_BASE}/categories/`;
const API_BRANDS= `${process.env.NEXT_PUBLIC_API_BASE}/brands/`;

/* ------------------------------------------------------------------ */
/*  STYLED COMPONENTS                                                 */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  HELPERS                                                           */
/* ------------------------------------------------------------------ */
const getCoverSrc = (p: any) => {
  if (p.cover_image?.url) return p.cover_image.url;
  if (p.cover_image) return p.cover_image;
  return "/placeholder.png";
};

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                    */
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
  const [selectedRam, setSelectedRam] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
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
  /*  CALC FINAL PRICE                                                  */
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
  /*  FETCH ALL DATA                                                    */
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
      const [pJson, cJson, bJson, oJson] = await Promise.all([
        pRes.json(),
        cRes.json(),
        bRes.json(),
        oRes.json()
      ]);
      setProducts(Array.isArray(pJson) ? pJson : pJson.results || []);
      setCategories(Array.isArray(cJson) ? cJson : cJson.results || []);
      setBrands(Array.isArray(bJson) ? bJson : bJson.results || []);
      setOptions(Array.isArray(oJson) ? oJson : oJson.results || []);
    } catch {
      setSnack({ open: true, msg: "Failed to load data", sev: "error" });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ------------------------------------------------------------------ */
  /*  IMAGE HANDLERS                                                    */
  /* ------------------------------------------------------------------ */
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

  const removeGallery = (idx: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== idx));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  /* ------------------------------------------------------------------ */
  /*  FORM RESET                                                        */
  /* ------------------------------------------------------------------ */
  const resetForm = () => {
    setEditId(null);
    setTitle(""); setDescription(""); setPrice(""); setStock("");
    setDiscount(0); setFinalPrice(""); setSelectedCats([]);
    setBrandId(""); setSelectedRam([]); setSelectedStorage([]);
    setSelectedColors([]); setTagNames([]); setCoverFile(null);
    setCoverPreview(null); setGalleryFiles([]); setGalleryPreviews([]);
    setIsActive(true); setIsFeatured(false); setVariants([]);
  };

  /* ------------------------------------------------------------------ */
  /*  START EDIT                                                        */
  /* ------------------------------------------------------------------ */
  const startEdit = (p: any) => {
    setEditId(p.id);
    setTitle(p.title ?? "");
    setDescription(p.description ?? "");
    setPrice(p.price ?? "");
    setStock(p.stock ?? "");
    setDiscount(p.discount ?? 0);
    setFinalPrice(p.final_price ?? "");
    setBrandId(p.brand?.id?.toString() ?? "");
    setSelectedCats(p.categories?.map((c: any) => c.id.toString()) ?? []);
    setSelectedRam(p.ram_options?.map((o: any) => o.id.toString()) ?? []);
    setSelectedStorage(p.storage_options?.map((o: any) => o.id.toString()) ?? []);
    setSelectedColors(p.colors?.map((o: any) => o.id.toString()) ?? []);
    setTagNames(p.tags?.map((t: any) => t.name) ?? []);
    setIsActive(p.is_active ?? true);
    setIsFeatured(p.is_featured ?? false);
    setCoverPreview(p.cover_image?.url ?? p.cover_image ?? null);
    setGalleryPreviews(p.images?.map((i: any) => i.image?.url ?? i.image) ?? []);
    setVariants(p.variants?.map((v: any) => ({
      ...v,
      price: v.price ?? "",
      compare_at_price: v.compare_at_price ?? "",
      stock: v.stock ?? ""
    })) ?? []);
    setTab(0);
  };

  /* ------------------------------------------------------------------ */
  /*  SAVE (CREATE / UPDATE) - FIXED                                    */
  /* ------------------------------------------------------------------ */
const saveProduct = async () => {
  if (!token || !title || price === "" || !brandId) {
    setSnack({ open: true, msg: "Fill required fields", sev: "error" });
    return;
  }

  const form = new FormData();
  form.append("title", title);
  form.append("description", description);
  form.append("price", String(price));
  form.append("stock", String(stock || 0));
  form.append("discount", String(discount));
  form.append("is_active", isActive ? "true" : "false");
  form.append("is_featured", isFeatured ? "true" : "false");
  form.append("brand_id", brandId);

  selectedCats.map(Number).forEach(id => form.append("category_ids", String(id)));
  selectedRam.map(Number).forEach(id => form.append("ram_option_ids", String(id)));
  selectedStorage.map(Number).forEach(id => form.append("storage_option_ids", String(id)));
  selectedColors.map(Number).forEach(id => form.append("color_option_ids", String(id)));
  tagNames.forEach(tag => form.append("tag_names", tag));
  form.append("variants", JSON.stringify(variants));

  if (coverFile) form.append("cover_image", coverFile);
  galleryFiles.forEach(f => form.append("gallery", f));

  // ADD THIS LOG BLOCK
  console.log("Sending to:", editId ? "PATCH" : "POST", editId ? `${API_BASE}${editId}/` : API_BASE);
  console.log("FORM DATA:");
  for (const [key, value] of form.entries()) {
    if (value instanceof File) {
      console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
    } else {
      console.log(`  ${key}:`, value);
    }
  }
  // END LOG BLOCK

  setSaving(true);
  try {
    const url = editId ? `${API_BASE}${editId}/` : API_BASE;
    const method = editId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });

    // ADD THIS: Log response status + body
    console.log("Response status:", res.status);
    const responseText = await res.text();
    console.log("Response body:", responseText);

    if (res.ok) {
      setSnack({ open: true, msg: editId ? "Updated" : "Created", sev: "success" });
      resetForm();
      fetchAll();
      setTab(1);
    } else {
      setSnack({ open: true, msg: `Save failed: ${responseText}`, sev: "error" });
    }
  } catch (err: any) {
    console.error("Fetch error:", err);
    setSnack({ open: true, msg: `Network error: ${err.message}`, sev: "error" });
  } finally {
    setSaving(false);
  }
};

  /* ------------------------------------------------------------------ */
  /*  DELETE                                                            */
  /* ------------------------------------------------------------------ */
  const confirmDel = (id: string) => { setDeleteId(id); setConfirmOpen(true); };
  const doDelete = async () => {
    if (!token || !deleteId) return;
    try {
      await fetch(`${API_BASE}${deleteId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnack({ open: true, msg: "Deleted", sev: "success" });
      fetchAll();
    } catch {
      setSnack({ open: true, msg: "Delete failed", sev: "error" });
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  QUICK DISCOUNT UPDATE                                             */
  /* ------------------------------------------------------------------ */
  const updateDiscount = async (p: any) => {
    if (!token) return;
    setSavingId(p.id);
    const final = Math.round(p.price * (1 - (p.discount ?? 0) / 100) * 100) / 100;
    try {
      await fetch(`${API_BASE}${p.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ discount: p.discount, final_price: final })
      });
      setSnack({ open: true, msg: "Discount updated", sev: "success" });
      fetchAll();
    } catch {
      setSnack({ open: true, msg: "Update failed", sev: "error" });
    } finally {
      setSavingId(null);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  FILTERED LISTS                                                    */
  /* ------------------------------------------------------------------ */
  const filtered = categoryFilter === "all"
    ? products
    : products.filter(p => p.categories?.some((c: any) => c.id === categoryFilter));
  const discounted = products.filter(p => p.discount && p.discount > 0);

  /* ------------------------------------------------------------------ */
  /*  VARIANT HELPERS                                                   */
  /* ------------------------------------------------------------------ */
  const addVariant = () => {
    setVariants(prev => [...prev, {
      sku: "", color: "", ram: "", storage: "", processor: "", size: "",
      price: "", compare_at_price: "", stock: ""
    }]);
  };
  const updateVariant = (idx: number, field: string, value: any) => {
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  };
  const removeVariant = (idx: number) => {
    setVariants(prev => prev.filter((_, i) => i !== idx));
  };

  /* ------------------------------------------------------------------ */
  /*  RENDER                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", p: { xs: 2, md: 4 } }}>
      {/* TABS */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 4 }}>
        <Tab label={editId ? "Edit Product" : "Add Product"} />
        <Tab label="All Products" />
        <Tab label="Discounted" />
      </Tabs>

      {/* FORM TAB */}
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

              {/* CATEGORIES */}
              <FormControl fullWidth>
                <InputLabel>Categories</InputLabel>
                <Select multiple value={selectedCats} onChange={e => setSelectedCats(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)}
                  renderValue={sel => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(sel as string[]).map(v => {
                        const cat = categories.find(c => c.id.toString() === v);
                        return <Chip key={v} label={cat?.name} size="small" sx={{ bgcolor: "#DC1A8A", color: "#fff" }} />;
                      })}
                    </Box>
                  )}
                >
                  {categories.map(c => (
                    <MenuItem key={c.id} value={c.id.toString()}>
                      <Checkbox checked={selectedCats.includes(c.id.toString())} />
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* BRAND */}
              <FormControl fullWidth>
                <InputLabel>Brand *</InputLabel>
                <Select value={brandId} onChange={e => setBrandId(e.target.value)}>
                  <MenuItem value="">—</MenuItem>
                  {brands.map(b => (
                    <MenuItem key={b.id} value={b.id.toString()}>{b.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* OPTIONS */}
              {["RAM", "STORAGE", "COLOR"].map(type => (
                <FormControl key={type} fullWidth>
                  <InputLabel>{type === "COLOR" ? "Colors" : `${type} Options`}</InputLabel>
                  <Select
                    multiple
                    value={type === "RAM" ? selectedRam : type === "STORAGE" ? selectedStorage : selectedColors}
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

              {/* TAGS */}
              <TextField
                label="Tags (comma separated)"
                value={tagNames.join(", ")}
                onChange={e => setTagNames(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                fullWidth
                helperText="Separate tags with commas"
              />

              {/* COVER */}
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

              {/* GALLERY */}
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
                    <Box key={i} sx={{ position: "relative" }}>
                      <img src={src} alt="" />
                      <IconButton size="small" sx={{ position: "absolute", top: -8, right: -8, bgcolor: "rgba(0,0,0,0.5)" }} onClick={() => removeGallery(i)}>
                        <CloseIcon fontSize="small" sx={{ color: "#fff" }} />
                      </IconButton>
                    </Box>
                  ))}
                </GalleryPreview>
              </Box>

              {/* VARIANTS */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Variants</Typography>
                <Button variant="outlined" size="small" onClick={addVariant} sx={{ mb: 2 }}>Add Variant</Button>
                {variants.map((v, idx) => (
                  <Stack key={idx} direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <TextField size="small" label="SKU" value={v.sku} onChange={e => updateVariant(idx, "sku", e.target.value)} />
                    <TextField size="small" label="Color" value={v.color} onChange={e => updateVariant(idx, "color", e.target.value)} />
                    <TextField size="small" label="RAM" value={v.ram} onChange={e => updateVariant(idx, "ram", e.target.value)} />
                    <TextField size="small" label="Storage" value={v.storage} onChange={e => updateVariant(idx, "storage", e.target.value)} />
                    <TextField size="small" label="Processor" value={v.processor} onChange={e => updateVariant(idx, "processor", e.target.value)} />
                    <TextField size="small" label="Size" value={v.size} onChange={e => updateVariant(idx, "size", e.target.value)} />
                    <TextField size="small" label="Price" type="number" value={v.price} onChange={e => updateVariant(idx, "price", Number(e.target.value) || "")} />
                    <TextField size="small" label="Compare At" type="number" value={v.compare_at_price} onChange={e => updateVariant(idx, "compare_at_price", Number(e.target.value) || "")} />
                    <TextField size="small" label="Stock" type="number" value={v.stock} onChange={e => updateVariant(idx, "stock", Number(e.target.value) || "")} />
                    <IconButton size="small" color="error" onClick={() => removeVariant(idx)}><CloseIcon /></IconButton>
                  </Stack>
                ))}
              </Box>

              <Stack direction="row" spacing={3}>
                <FormControlLabel control={<Checkbox checked={isActive} onChange={e => setIsActive(e.target.checked)} />} label="Active" />
                <FormControlLabel control={<Checkbox checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />} label="Featured" />
              </Stack>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <StyledButton className="primary" onClick={saveProduct} disabled={saving}>
                  {saving ? "Saving…" : editId ? "Update Product" : "Add Product"}
                </StyledButton>
              </Box>
            </Stack>
          </Box>
        </StyledPaper>
      )}

      {/* ALL PRODUCTS TAB */}
      {tab === 1 && (
        <Box>
          <Tabs value={categoryFilter} onChange={(_, v) => setCategoryFilter(v)} variant={isMobile ? "scrollable" : "standard"} sx={{ mb: 3 }}>
            <Tab label="All" value="all" />
            {categories.map(c => <Tab key={c.id} label={c.name} value={c.id} />)}
          </Tabs>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={60} thickness={5} sx={{ color: "#DC1A8A" }} />
            </Box>
          ) : filtered.length === 0 ? (
            <Typography textAlign="center" color="text.secondary" py={8}>No products found</Typography>
          ) : (
            <Box sx={{
              display: isMobile ? "flex" : "grid",
              overflowX: isMobile ? "auto" : "unset",
              gap: 3,
              gridTemplateColumns: { md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" },
              pb: 2,
            }}>
              {filtered.map(p => (
                <StyledCard key={p.id}>
                  {p.discount && p.discount > 0 && (
                    <DiscountBadge>{p.discount}% OFF</DiscountBadge>
                  )}
                  <Box onClick={() => startEdit(p)} sx={{ height: 200, cursor: "pointer", overflow: "hidden" }}>
                    <CardMedia component="img" image={getCoverSrc(p)} sx={{ width: "100%", height: "100%", objectFit: "cover", transition: "0.3s", "&:hover": { transform: "scale(1.05)" } }} />
                  </Box>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: "#222" }}>{p.title}</Typography>
                    <Typography variant="body2" sx={{ color: "#666", mb: 1.5, height: 40, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.description}</Typography>
                    <Box sx={{ mb: 2 }}>
                      {p.discount && p.discount > 0 && (
                        <Typography sx={{ textDecoration: "line-through", color: "#999", fontSize: "0.9rem" }}>
                          KES {p.price?.toLocaleString()}
                        </Typography>
                      )}
                      <Typography sx={{ fontWeight: 700, color: "#DC1A8A", fontSize: "1.1rem" }}>
                        KES {(p.final_price ?? p.price)?.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <StyledButton size="small" startIcon={<Edit />} onClick={() => startEdit(p)}>Edit</StyledButton>
                      <StyledButton size="small" className="danger" startIcon={<Delete />} onClick={() => confirmDel(p.id)}>Delete</StyledButton>
                    </Box>
                  </CardContent>
                </StyledCard>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* DISCOUNTED TABLE */}
      {tab === 2 && (
        <StyledPaper elevation={0}>
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: "#222" }}>Discounted Products</Typography>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={50} sx={{ color: "#DC1A8A" }} />
              </Box>
            ) : discounted.length === 0 ? (
              <Typography textAlign="center" color="text.secondary" py={6}>No discounted products</Typography>
            ) : (
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha("#DC1A8A", 0.05) }}>
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
                      <TableCell sx={{ fontWeight: 600 }}>{p.title}</TableCell>
                      <TableCell><Typography sx={{ textDecoration: "line-through", color: "#999" }}>KES {p.price?.toLocaleString()}</Typography></TableCell>
                      <TableCell>
                        <TextField type="number" size="small" value={p.discount ?? 0}
                          onChange={e => setProducts(prev => prev.map(x => x.id === p.id ? { ...x, discount: Number(e.target.value) } : x))}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#DC1A8A" }}>
                        KES {(p.price! - (p.price! * (p.discount || 0)) / 100).toFixed(0)}
                      </TableCell>
                      <TableCell>{p.brand?.name || "—"}</TableCell>
                      <TableCell>
                        <StyledButton size="small" className="primary" onClick={() => updateDiscount(p)} disabled={savingId === p.id}>
                          {savingId === p.id ? "…" : "Update"}
                        </StyledButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        </StyledPaper>
      )}

      {/* DELETE DIALOG */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent><Typography>This action cannot be undone. Are you sure?</Typography></DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <StyledButton className="danger" onClick={doDelete} variant="contained">Delete</StyledButton>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.sev}
          sx={{
            width: "100%", fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            ...(snack.sev === "success" && { bgcolor: "#4caf50", color: "#fff" }),
            ...(snack.sev === "error" && { bgcolor: "#f44336", color: "#fff" }),
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductAdminPage;