"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Tabs,
  Tab,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Checkbox,
  FormControlLabel,
  Typography,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Stack,
  Avatar,
  Tooltip,
  Zoom,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Add,
  Remove,
  Edit,
  Delete,
  Favorite,
  ShoppingCart,
  Image as ImageIcon,
  Palette,
  Category,
  Store,
  AttachMoney,
  Inventory,
} from "@mui/icons-material";

type ProductT = {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  stock?: number;
  discount?: number;
  final_price?: number;
  categories?: { id: number; name: string }[];
  brand?: { id: number; name: string };
  cover_image?: string;
  images?: { id: string; image: string }[];
  colors?: string[];
  is_active?: boolean;
  is_featured?: boolean;
};

type CategoryT = { id: number; name: string };
type BrandT = { id: number; name: string };

const API_HOST = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const API_BASE = `${API_HOST}/api/products`;
const API_CATEGORIES = `${API_HOST}/api/categories/`;
const API_BRANDS = `${API_HOST}/api/brands/`;
const MEDIA_BASE = API_HOST;

const ProductSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [activeTab, setActiveTab] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");

  const [products, setProducts] = useState<ProductT[]>([]);
  const [categories, setCategories] = useState<CategoryT[]>([]);
  const [brands, setBrands] = useState<BrandT[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [discount, setDiscount] = useState<number | "">(0);
  const [finalPrice, setFinalPrice] = useState<number | "">("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [brand, setBrand] = useState<string>("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("access") : null);

  // Final price
  useEffect(() => {
    if (price !== "" && discount !== "") {
      const final = discount > 0 ? Number(price) - (Number(price) * Number(discount)) / 100 : Number(price);
      setFinalPrice(parseFloat(final.toFixed(2)));
    } else {
      setFinalPrice("");
    }
  }, [price, discount]);

  // Fetch
  const fetchData = async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const [pRes, cRes, bRes] = await Promise.all([
        fetch(`${API_BASE}/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(API_CATEGORIES, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(API_BRANDS, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [pData, cData, bData] = await Promise.all([pRes.json(), cRes.json(), bRes.json()]);
      setProducts(Array.isArray(pData) ? pData : pData.results ?? []);
      setCategories(Array.isArray(cData) ? cData : cData.results ?? []);
      setBrands(Array.isArray(bData) ? bData : bData.results ?? []);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to load data", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Image handlers
  const handleCoverChange = (files: FileList | null) => {
    if (!files?.[0]) {
      setCoverFile(null);
      setCoverPreview(null);
      return;
    }
    const f = files[0];
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const handleGalleryChange = (files: FileList | null) => {
    if (!files) {
      setGalleryFiles([]);
      setGalleryPreviews([]);
      return;
    }
    const arr = Array.from(files);
    setGalleryFiles(arr);
    setGalleryPreviews(arr.map((f) => URL.createObjectURL(f)));
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setStock("");
    setDiscount(0);
    setFinalPrice("");
    setSelectedCategories([]);
    setBrand("");
    setCoverFile(null);
    setCoverPreview(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setIsActive(true);
    setIsFeatured(false);
    setSelectedColors([]);
    setQuantities({});
  };

  // Save
  const handleSave = async () => {
    const token = getToken();
    if (!token || !title || price === "" || !brand) {
      setSnackbar({ open: true, message: "Fill required fields", severity: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", String(price));
    formData.append("stock", String(stock));
    formData.append("discount", String(discount));
    formData.append("final_price", String(finalPrice));
    formData.append("brand", brand);
    formData.append("is_active", String(isActive));
    formData.append("is_featured", String(isFeatured));
    selectedCategories.forEach((c) => formData.append("categories", c));
    selectedColors.forEach((c) => formData.append("colors", c));
    if (coverFile) formData.append("cover_image", coverFile);
    galleryFiles.forEach((f) => formData.append("images", f));

    setSaving(true);
    try {
      const url = editingId ? `${API_BASE}/${editingId}/` : `${API_BASE}/`;
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setSnackbar({ open: true, message: editingId ? "Updated!" : "Added!", severity: "success" });
        resetForm();
        fetchData();
        setActiveTab(1);
      } else {
        const err = await res.text();
        console.error(err);
        setSnackbar({ open: true, message: "Save failed", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Network error", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Edit
  const handleEdit = (p: ProductT) => {
    setEditingId(p.id);
    setTitle(p.title ?? "");
    setDescription(p.description ?? "");
    setPrice(p.price ?? "");
    setStock(p.stock ?? "");
    setDiscount(p.discount ?? 0);
    setFinalPrice(p.final_price ?? p.price ?? "");
    setBrand(p.brand?.id?.toString() ?? "");
    setSelectedCategories(p.categories?.map((c) => String(c.id)) || []);
    setIsActive(p.is_active ?? true);
    setIsFeatured(p.is_featured ?? false);
    setSelectedColors(p.colors ?? []);

    if (p.cover_image) {
      const url = p.cover_image.startsWith("http") ? p.cover_image : `${MEDIA_BASE}${p.cover_image}`;
      setCoverPreview(url);
    }

    if (p.images?.length) {
      const urls = p.images.map((img) => (img.image.startsWith("http") ? img.image : `${MEDIA_BASE}${img.image}`));
      setGalleryPreviews(urls);
    }

    setActiveTab(0);
  };

  // Delete
  const confirmDelete = (id: string) => {
    setDeleteTarget(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    const id = deleteTarget;
    const token = getToken();
    setConfirmOpen(false);
    if (!id || !token) return;

    try {
      const res = await fetch(`${API_BASE}/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "Deleted", severity: "success" });
        fetchData();
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Delete failed", severity: "error" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.categories?.some((c) => c.id === activeCategory));

  const renderProductCard = (p: ProductT) => {
    const images = [
      p.cover_image,
      ...(p.images?.map((i) => i.image) || []),
    ].filter(Boolean) as string[];

    const imageSrc =
      images.length > 0
        ? images[0].startsWith("http")
          ? images[0]
          : `${MEDIA_BASE}${images[0]}`
        : "/images/fallback.jpg";

    const finalPrice = p.final_price ?? (p.discount && p.discount > 0
      ? p.price! - (p.price! * p.discount) / 100
      : p.price);

    return (
      <Card
        key={p.id}
        sx={{
          width: 220,
          height: 360,
          flex: "0 0 220px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          borderRadius: 0,
          overflow: "hidden",
          position: "relative",
          backgroundColor: "#fff",
          transition: "transform 0.2s",
          "&:hover": { transform: "translateY(-4px)" },
        }}
      >
        {p.discount && p.discount > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              backgroundColor: "#e91e63",
              color: "#fff",
              fontSize: "0.8rem",
              fontWeight: 700,
              px: 1,
              py: 0.5,
              borderRadius: 0,
            }}
          >
            {p.discount}% OFF
          </Box>
        )}

        <Box
          sx={{
            width: 220,
            height: 180,
            cursor: "pointer",
            overflow: "hidden",
          }}
          onClick={() => handleEdit(p)}
        >
          <CardMedia
            component="img"
            image={imageSrc}
            alt={p.title}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {p.stock !== undefined && p.stock < 5 && p.stock > 0 && (
            <Box
              sx={{
                position: "absolute",
                bottom: 8,
                left: 8,
                backgroundColor: "rgba(0,0,0,0.75)",
                color: "#fff",
                padding: "4px 8px",
                fontSize: "0.8rem",
                fontWeight: 500,
              }}
            >
              Only {p.stock} left!
            </Box>
          )}
        </Box>

        <CardContent
          sx={{
            flexGrow: 1,
            p: 1.5,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: 180,
          }}
        >
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: "#222",
                fontSize: "1rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {p.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#666",
                fontSize: "0.85rem",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                mt: 0.5,
              }}
            >
              {p.description}
            </Typography>
            <Box sx={{ mt: 1 }}>
              {p.discount && p.discount > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    textDecoration: "line-through",
                    color: "#888",
                    fontSize: "0.85rem",
                    mr: 1,
                  }}
                >
                  KES {p.price?.toLocaleString()}
                </Typography>
              )}
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: "#222",
                  fontSize: "1rem",
                  display: "inline",
                }}
              >
                KES {finalPrice?.toLocaleString()}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
            <Button
              startIcon={<Edit />}
              size="small"
              variant="contained"
              onClick={() => handleEdit(p)}
              sx={{ flex: 1, fontSize: "0.8rem" }}
            >
              Edit
            </Button>
            <Button
              startIcon={<Delete />}
              size="small"
              color="error"
              variant="outlined"
              onClick={() => confirmDelete(p.id)}
              sx={{ flex: 1, fontSize: "0.8rem" }}
            >
              Delete
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", p: { xs: 2, md: 4 } }}>
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        centered
        sx={{
          mb: 4,
          "& .MuiTabs-indicator": { bgcolor: "#e91e63", height: 4, borderRadius: 2 },
        }}
      >
        <Tab label={editingId ? "Edit Product" : "Add Product"} />
        <Tab label="View Products" />
      </Tabs>

      {/* ADD / EDIT FORM */}
      {activeTab === 0 && (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Stack spacing={3}>
            <TextField label="Title *" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
            <TextField label="Description *" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={3} fullWidth />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField label="Price (KES) *" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
              <TextField label="Discount (%)" type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
              <TextField label="Final Price" value={finalPrice} disabled />
            </Stack>

            <TextField label="Stock *" type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />

            <FormControl fullWidth>
              <InputLabel>Categories *</InputLabel>
              <Select
                multiple
                value={selectedCategories}
                onChange={(e) => setSelectedCategories(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(selected as string[]).map((v) => {
                      const cat = categories.find((c) => String(c.id) === v);
                      return <Chip key={v} label={cat?.name ?? v} size="small" />;
                    })}
                  </Box>
                )}
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    <Checkbox checked={selectedCategories.includes(String(c.id))} />
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Brand *</InputLabel>
              <Select value={brand} onChange={(e) => setBrand(e.target.value)}>
                <MenuItem value="">None</MenuItem>
                {brands.map((b) => (
                  <MenuItem key={b.id} value={String(b.id)}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={3}>
              <FormControlLabel control={<Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />} label="Active" />
              <FormControlLabel control={<Checkbox checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />} label="Featured" />
            </Stack>

            <Box>
              <Typography variant="subtitle1" gutterBottom>Cover Image *</Typography>
              <input type="file" accept="image/*" onChange={(e) => handleCoverChange(e.target.files)} />
              {coverPreview && (
                <Box sx={{ mt: 2, borderRadius: 2, overflow: "hidden", boxShadow: 2, width: 200 }}>
                  <img src={coverPreview} alt="cover" style={{ width: "100%", height: 150, objectFit: "cover" }} />
                </Box>
              )}
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>Gallery Images</Typography>
              <input type="file" accept="image/*" multiple onChange={(e) => handleGalleryChange(e.target.files)} />
              {galleryPreviews.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
                  {galleryPreviews.map((src, i) => (
                    <Box key={i} sx={{ width: 80, height: 80, borderRadius: 2, overflow: "hidden", border: "1px solid #eee" }}>
                      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            <Button variant="contained" onClick={handleSave} disabled={saving} size="large">
              {saving ? "Saving..." : editingId ? "Update" : "Add Product"}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* VIEW PRODUCTS - CARDS LIKE DEALSSECTION */}
      {activeTab === 1 && (
        <Box>
          <Tabs
            value={activeCategory}
            onChange={(_, v) => setActiveCategory(v)}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons
            allowScrollButtonsMobile
            sx={{
              mb: 3,
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "#666",
                "&.Mui-selected": { color: "#e91e63", fontWeight: 700 },
              },
              "& .MuiTabs-indicator": { backgroundColor: "#e91e63" },
            }}
          >
            <Tab label="All" value="all" />
            {categories.map((c) => (
              <Tab key={c.id} label={c.name} value={c.id} />
            ))}
          </Tabs>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
              <CircularProgress />
            </Box>
          ) : filteredProducts.length === 0 ? (
            <Typography sx={{ textAlign: "center", mt: 4, color: "#888" }}>
              No products found.
            </Typography>
          ) : (
            <Box
              sx={{
                maxWidth: "1200px",
                mx: "auto",
                ...(isMobile
                  ? {
                      display: "flex",
                      flexWrap: "nowrap",
                      overflowX: "auto",
                      gap: 2,
                      pb: 2,
                      scrollSnapType: "x mandatory",
                      msOverflowStyle: "none",
                      scrollbarWidth: "none",
                      "&::-webkit-scrollbar": { display: "none" },
                      "& > *": { scrollSnapAlign: "start" },
                    }
                  : {
                      display: "grid",
                      gridTemplateColumns: {
                        md: "repeat(4, minmax(220px, 1fr))",
                        lg: "repeat(5, minmax(220px, 1fr))",
                      },
                      gap: 3,
                    }),
              }}
            >
              {filteredProducts.map(renderProductCard)}
            </Box>
          )}
        </Box>
      )}

      {/* Dialogs */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete Product?</DialogTitle>
        <DialogContent>
          <Typography>This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete} variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductSection;