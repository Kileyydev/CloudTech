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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE + "/products/";
const API_CATEGORIES = process.env.NEXT_PUBLIC_API_BASE + "/categories/";
const API_BRANDS = process.env.NEXT_PUBLIC_API_BASE + "/brands/";
const MEDIA_BASE = process.env.NEXT_PUBLIC_API_BASE;


// === STYLED COMPONENTS ===
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
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 16px 32px rgba(220, 26, 138, 0.15)",
  },
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
    "&:hover": { background: "linear-gradient(135deg, #B31774, #9a165c)" },
  },
  "&.danger": {
    background: "#f44336",
    color: "#fff",
    "&:hover": { background: "#d32f2f" },
  },
}));

const ImageUpload = styled(Box)(({ theme }) => ({
  border: `2px dashed ${alpha("#DC1A8A", 0.3)}`,
  padding: theme.spacing(3),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.2s",
  background: alpha("#DC1A8A", 0.02),
  "&:hover": {
    borderColor: "#DC1A8A",
    background: alpha("#DC1A8A", 0.05),
  },
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
    "&:hover": {
      transform: "scale(1.05)",
      borderColor: "#DC1A8A",
    },
  },
}));

// === MAIN COMPONENT ===
const ProductAdminPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [tab, setTab] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Form
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [discount, setDiscount] = useState<number | "">(0);
  const [finalPrice, setFinalPrice] = useState<number | "">("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [brandId, setBrandId] = useState<string>("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Snackbar
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: "success" | "error" }>({
    open: false, msg: "", sev: "success"
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;

  // Final price calc
  useEffect(() => {
    if (price !== "" && discount !== "") {
      const p = Number(price);
      const d = Number(discount);
      setFinalPrice(d > 0 ? p - (p * d) / 100 : p);
    } else {
      setFinalPrice("");
    }
  }, [price, discount]);

  // Fetch all
  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [pRes, cRes, bRes] = await Promise.all([
        fetch(API_BASE, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(API_CATEGORIES, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(API_BRANDS, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const [pJson, cJson, bJson] = await Promise.all([pRes.json(), cRes.json(), bRes.json()]);
      setProducts(Array.isArray(pJson) ? pJson : pJson.results || []);
      setCategories(Array.isArray(cJson) ? cJson : cJson.results || []);
      setBrands(Array.isArray(bJson) ? bJson : bJson.results || []);
    } catch (err) {
      setSnack({ open: true, msg: "Failed to load", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Image handlers
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
    setCoverFile(null); setCoverPreview(null); setGalleryFiles([]); setGalleryPreviews([]);
    setIsActive(true); setIsFeatured(false);
  };

  // Save
  const saveProduct = async () => {
    if (!token || !title || price === "" || !brandId) {
      setSnack({ open: true, msg: "Fill required", sev: "error" });
      return;
    }

    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    form.append("price", String(price));
    form.append("stock", String(stock || 0));
    form.append("discount", String(discount));
    form.append("is_active", String(isActive));
    form.append("is_featured", String(isFeatured));
    selectedCats.forEach(c => form.append("category_ids", c));
    form.append("brand_id", brandId);
    if (coverFile) form.append("cover_image", coverFile);
    galleryFiles.forEach(f => form.append("gallery", f));

    setSaving(true);
    try {
      const url = editId ? `${API_BASE}${editId}/` : API_BASE;
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });

      if (res.ok) {
        setSnack({ open: true, msg: editId ? "Updated" : "Added", sev: "success" });
        resetForm();
        fetchData();
        setTab(1);
      } else {
        setSnack({ open: true, msg: "Save failed", sev: "error" });
      }
    } catch {
      setSnack({ open: true, msg: "Network error", sev: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Edit
  const startEdit = (p: Product) => {
    setEditId(p.id);
    setTitle(p.title || "");
    setDescription(p.description || "");
    setPrice(p.price || "");
    setStock(p.stock || "");
    setDiscount(p.discount || 0);
    setFinalPrice(p.final_price || "");
    setBrandId(p.brand?.id?.toString() || "");
    setSelectedCats(p.categories?.map(c => String(c.id)) || []);
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

  // Delete
  const confirmDel = (id: string) => { setDeleteId(id); setConfirmOpen(true); };
  const doDelete = async () => {
    if (!token || !deleteId) return;
    try {
      await fetch(`${API_BASE}${deleteId}/`, {
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

  // Discount quick update
  const updateDiscount = async (p: Product) => {
    if (!token) return;
    setSavingId(p.id);
    const final = p.price! - (p.price! * (p.discount || 0)) / 100;
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
      {/* TABS */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        centered
        sx={{
          mb: 4,
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1.1rem",
            color: "#666",
            "&.Mui-selected": { color: "#DC1A8A" },
          },
          "& .MuiTabs-indicator": { backgroundColor: "#DC1A8A", height: 3 },
        }}
      >
        <Tab label={editId ? "Edit Product" : "Add Product"} />
        <Tab label="All Products" />
        <Tab label="Discounted" />
      </Tabs>

      {/* === FORM === */}
      {tab === 0 && (
        <StyledPaper elevation={0}>
          <Box sx={{ p: { xs: 3, md: 5 } }}>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: "#222" }}>
              {editId ? "Edit Product" : "Add New Product"}
            </Typography>

            <Stack spacing={4}>
              <TextField
                label="Title *"
                value={title}
                onChange={e => setTitle(e.target.value)}
                fullWidth
                variant="outlined"
              />

              <TextField
                label="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                
              />

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="Price *"
                  type="number"
                  value={price}
                  onChange={e => setPrice(Number(e.target.value) || "")}
                  
                />
                <TextField
                  label="Discount %"
                  type="number"
                  value={discount}
                  onChange={e => setDiscount(Number(e.target.value) || 0)}
                  
                />
                <TextField
                  label="Final Price"
                  value={finalPrice}
                  disabled
                
                />
              </Stack>

              <TextField
                label="Stock"
                type="number"
                value={stock}
                onChange={e => setStock(Number(e.target.value) || "")}
                fullWidth
                
              />

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
                <Select
                  value={brandId}
                  onChange={e => setBrandId(e.target.value)}
                  
                >
                  <MenuItem value="">None</MenuItem>
                  {brands.map(b => (
                    <MenuItem key={b.id} value={String(b.id)}>{b.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction="row" spacing={3}>
                <FormControlLabel
                  control={<Checkbox checked={isActive} onChange={e => setIsActive(e.target.checked)} />}
                  label="Active"
                />
                <FormControlLabel
                  control={<Checkbox checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />}
                  label="Featured"
                />
              </Stack>

              {/* Cover Image */}
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

              {/* Gallery */}
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

      {/* === ALL PRODUCTS === */}
      {tab === 1 && (
        <Box>
          <Tabs
            value={categoryFilter}
            onChange={(_, v) => setCategoryFilter(v)}
            variant={isMobile ? "scrollable" : "standard"}
            sx={{
              mb: 3,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                color: "#666",
                "&.Mui-selected": { color: "#DC1A8A" },
              },
              "& .MuiTabs-indicator": { backgroundColor: "#DC1A8A" },
            }}
          >
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
                    <CardMedia
                      component="img"
                      image={getProductImageSrc(p)}
                      sx={{ width: "100%", height: "100%", objectFit: "cover", transition: "0.3s", "&:hover": { transform: "scale(1.05)" } }}
                    />
                  </Box>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: "#222" }}>
                      {p.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#666", mb: 1.5, height: 40, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {p.description}
                    </Typography>
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
                      <StyledButton size="small" startIcon={<Edit />} onClick={() => startEdit(p)}>
                        Edit
                      </StyledButton>
                      <StyledButton size="small" className="danger" startIcon={<Delete />} onClick={() => confirmDel(p.id)}>
                        Delete
                      </StyledButton>
                    </Box>
                  </CardContent>
                </StyledCard>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* === DISCOUNTED TABLE === */}
      {tab === 2 && (
        <StyledPaper elevation={0}>
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: "#222" }}>
              Discounted Products
            </Typography>

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
                    <TableRow key={p.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell>
                        <img src={getProductImageSrc(p)} width={60} height={60} style={{ objectFit: "cover", border: "2px solid #eee" }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{p.title}</TableCell>
                      <TableCell>
                        <Typography sx={{ textDecoration: "line-through", color: "#999" }}>
                          KES {p.price?.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={p.discount ?? 0}
                          onChange={e => setProducts(prev => prev.map(x => x.id === p.id ? { ...x, discount: Number(e.target.value) } : x))}
                          
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#DC1A8A" }}>
                        KES {(p.price! - (p.price! * (p.discount || 0)) / 100).toFixed(0)}
                      </TableCell>
                      <TableCell>{p.brand?.name || "—"}</TableCell>
                      <TableCell>
                        <StyledButton
                          size="small"
                          className="primary"
                          onClick={() => updateDiscount(p)}
                          disabled={savingId === p.id}
                        >
                          {savingId === p.id ? "..." : "Update"}
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
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>This action cannot be undone. Are you sure?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setConfirmOpen(false)} >Cancel</Button>
          <StyledButton className="danger" onClick={doDelete} variant="contained">
            Delete
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          severity={snack.sev}
          sx={{
            width: "100%",
           
            fontWeight: 600,
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
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