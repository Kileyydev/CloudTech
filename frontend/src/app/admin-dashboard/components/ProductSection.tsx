"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

type ProductT = {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  stock?: number;
  discount?: number;
  categories?: { id: number; name: string }[];
  brand?: { id: number; name: string };
  cover_images?: string[];
  colors?: string[];
  is_active?: boolean;
  is_featured?: boolean;
};

type CategoryT = { id: number; name: string };
type BrandT = { id: number; name: string };

const ProductSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [products, setProducts] = useState<ProductT[]>([]);
  const [categories, setCategories] = useState<CategoryT[]>([]);
  const [brands, setBrands] = useState<BrandT[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [discount, setDiscount] = useState<number | "">(0);
  const [finalPrice, setFinalPrice] = useState<number | "">("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [brand, setBrand] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Colors and quantity selection
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const API_BASE = "http://localhost:8000/api/products";
  const API_CATEGORIES = "http://localhost:8000/api/categories/";
  const API_BRANDS = "http://localhost:8000/api/brands/";
  const MEDIA_BASE = "http://localhost:8000";

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("access") : null;

  // Final price calculation
  useEffect(() => {
    if (price !== "" && discount !== "") {
      const final =
        discount && discount > 0
          ? Number(price) - (Number(price) * Number(discount)) / 100
          : Number(price);
      setFinalPrice(parseFloat(final.toFixed(2)));
    } else {
      setFinalPrice("");
    }
  }, [price, discount]);

  // Fetch data
  const fetchProducts = async () => {
    const token = getToken();
    if (!token) return;
    setLoadingProducts(true);
    try {
      const res = await fetch(`${API_BASE}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.results);
    } catch (err) {
      console.error("Error fetching products", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(API_CATEGORIES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : data.results);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  const fetchBrands = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(API_BRANDS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBrands(Array.isArray(data) ? data : data.results);
    } catch (err) {
      console.error("Error fetching brands", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  const handleImagesChange = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setImageFiles(fileArray);
    const previews = fileArray.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setDiscount(0);
    setFinalPrice("");
    setStock("");
    setSelectedCategories([]);
    setBrand("");
    setImageFiles([]);
    setImagePreviews([]);
    setEditingId(null);
    setIsActive(true);
    setIsFeatured(false);
    setAvailableColors([]);
    setSelectedColors([]);
    setQuantities({});
  };

  // Add/Edit product
  const handleAddOrEditProduct = async () => {
    const token = getToken();
    if (!token) return;
    if (!title || !description || price === "" || stock === "" || !brand) {
      alert("Please fill all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price.toString());
    formData.append("stock", stock.toString());
    formData.append("discount", discount?.toString() || "0");
    formData.append("final_price", finalPrice?.toString() || price.toString());
    formData.append("brand", brand);
    selectedCategories.forEach((c) => formData.append("categories", c));
    selectedColors.forEach((c) => formData.append("colors", c));
    Object.entries(quantities).forEach(([color, qty]) =>
      formData.append(`quantity_${color}`, qty.toString())
    );
    formData.append("is_active", isActive.toString());
    formData.append("is_featured", isFeatured.toString());
    imageFiles.forEach((file) => formData.append("cover_images", file));

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
        alert(editingId ? "Product updated!" : "Product added!");
        resetForm();
        fetchProducts();
        setActiveTab(1);
      } else {
        console.error(await res.text());
        alert("Failed to save product");
      }
    } catch (err) {
      console.error("Error saving product", err);
      alert("Error saving product");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (p: ProductT) => {
    setEditingId(p.id);
    setTitle(p.title ?? "");
    setDescription(p.description ?? "");
    setPrice(p.price ?? "");
    setDiscount(p.discount ?? 0);
    setStock(p.stock ?? "");
    setBrand(p.brand?.id?.toString() ?? "");
    setSelectedCategories(p.categories?.map((c) => c.id.toString()) || []);
    setImagePreviews(p.cover_images ?? []);
    setAvailableColors(p.colors ?? []);
    setSelectedColors(p.colors ?? []);
    const initQty: Record<string, number> = {};
    (p.colors ?? []).forEach((c) => (initQty[c] = 1));
    setQuantities(initQty);
    setIsActive(p.is_active ?? true);
    setIsFeatured(p.is_featured ?? false);
    setActiveTab(0);
  };

  const handleDelete = async (id: string) => {
    const token = getToken();
    if (!token) return;
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`${API_BASE}/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchProducts();
      else alert("Failed to delete product");
    } catch (err) {
      console.error("Error deleting product", err);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#FFFFFF", padding: 3 }}>
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{
          mb: 4,
          "& .MuiTabs-indicator": { backgroundColor: "#DC1A8A" },
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: "bold",
            color: "#666",
            "&.Mui-selected": { color: "#DC1A8A" },
          },
        }}
      >
        <Tab label="Add/Edit Product" />
        <Tab label="View Products" />
      </Tabs>

      {activeTab === 0 && (
        <Box sx={{ backgroundColor: "#F9FAFB", p: 4, borderRadius: 2 }}>
          <TextField label="Product Title *" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth sx={{ mb: 3 }} />
          <TextField label="Description *" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={3} sx={{ mb: 3 }} />

          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <TextField label="Price (KES) *" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} fullWidth />
            <TextField label="Discount (%)" type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} fullWidth />
            <TextField label="Final Price" type="number" value={finalPrice} disabled fullWidth />
          </Box>

          <TextField label="Stock *" type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} fullWidth sx={{ mb: 3 }} />

          {/* Colors */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Available Colors</InputLabel>
            <Select
              multiple
              value={selectedColors}
              onChange={(e) => setSelectedColors(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)}
              input={<OutlinedInput label="Available Colors" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as string[]).map((color) => <Chip key={color} label={color} />)}
                </Box>
              )}
            >
              {["Red","Blue","Green","Yellow","Black","White"].map((c) => (
                <MenuItem key={c} value={c}>
                  <Checkbox checked={selectedColors.includes(c)} />
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Quantity per color */}
          {selectedColors.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Quantity per color</Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                {selectedColors.map((c) => (
                  <Box key={c} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography>{c}:</Typography>
                    <IconButton size="small" onClick={() => setQuantities((q) => ({ ...q, [c]: Math.max((q[c] || 1) - 1, 1) }))}><Remove fontSize="small" /></IconButton>
                    <TextField type="number" value={quantities[c] || 1} onChange={(e) => setQuantities((q) => ({ ...q, [c]: Number(e.target.value) }))} sx={{ width: 60 }} />
                    <IconButton size="small" onClick={() => setQuantities((q) => ({ ...q, [c]: (q[c] || 1) + 1 }))}><Add fontSize="small" /></IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Categories, Brand, Active/Featured, Images */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Categories *</InputLabel>
            <Select
              multiple
              value={selectedCategories}
              onChange={(e) => setSelectedCategories(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)}
              input={<OutlinedInput label="Categories *" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as string[]).map((value) => {
                    const cat = categories.find((c) => c.id.toString() === value);
                    return <Chip key={value} label={cat?.name || value} />;
                  })}
                </Box>
              )}
            >
              {categories.map((c) => <MenuItem key={c.id} value={c.id.toString()}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Brand *</InputLabel>
            <Select value={brand} onChange={(e) => setBrand(e.target.value)}>
              {brands.map((b) => <MenuItem key={b.id} value={b.id.toString()}>{b.name}</MenuItem>)}
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
            <FormControlLabel control={<Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />} label="Is Active" />
            <FormControlLabel control={<Checkbox checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />} label="Is Featured" />
          </Box>

          <input type="file" accept="image/*" multiple onChange={(e) => handleImagesChange(e.target.files)} style={{ marginBottom: 16 }} />
          {imagePreviews.length > 0 && <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>{imagePreviews.map((src, i) => <img key={i} src={src} alt={`Preview ${i}`} style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8 }} />)}</Box>}

          <Button variant="contained" onClick={handleAddOrEditProduct} sx={{ width: "100%" }} disabled={saving}>{saving ? "Saving..." : editingId ? "Update Product" : "Add Product"}</Button>
        </Box>
      )}

      {/* View Products */}
      {activeTab === 1 && (
        <Box sx={{ backgroundColor: "#F9FAFB", p: 3, borderRadius: 2 }}>
          {loadingProducts ? <CircularProgress /> : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Original Price</TableCell>
                  <TableCell>Discount</TableCell>
                  <TableCell>Final Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Colors</TableCell>
                  <TableCell>Categories</TableCell>
                  <TableCell>Brand</TableCell>
                  <TableCell>Images</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow><TableCell colSpan={11} align="center">No products found</TableCell></TableRow>
                ) : products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.title}</TableCell>
                    <TableCell>{p.description}</TableCell>
                    <TableCell>{p.discount && p.discount > 0 ? <Typography sx={{ color: "#888", textDecoration: "line-through" }}>KES {p.price}</Typography> : <Typography>KES {p.price}</Typography>}</TableCell>
                    <TableCell>{p.discount ?? 0}%</TableCell>
                    <TableCell><Typography sx={{ fontWeight: "bold" }}>KES {p.discount && p.discount > 0 ? (p.price! - (p.price! * p.discount!) / 100).toFixed(2) : p.price}</Typography></TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell>{p.colors?.join(", ")}</TableCell>
                    <TableCell>{p.categories?.map(c => c.name).join(", ")}</TableCell>
                    <TableCell>{p.brand?.name}</TableCell>
                    <TableCell>{p.cover_images?.length ? p.cover_images.map((img, i) => <img key={i} src={img.startsWith("http") ? img : `${MEDIA_BASE}${img}`} alt={p.title} width={50} height={50} style={{ objectFit: "cover", borderRadius: 4, marginRight: 4 }} />) : "—"}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleEditClick(p)}>Edit</Button>
                      <Button color="error" onClick={() => handleDelete(p.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProductSection;
