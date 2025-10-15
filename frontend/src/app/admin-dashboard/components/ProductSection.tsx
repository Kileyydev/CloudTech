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
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

type ProductT = {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  stock?: number;
  discount?: number;
  categories?: { id: number; name: string }[];
  brand?: { id: number; name: string };
  cover_image?: string;
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

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [brand, setBrand] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const API_BASE = "http://localhost:8000/api/products";
  const API_CATEGORIES = "http://localhost:8000/api/categories/";
  const API_BRANDS = "http://localhost:8000/api/brands/";

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("access") : null;

  // Fetch products
  const fetchProducts = async () => {
    const token = getToken();
    if (!token) return;
    setLoadingProducts(true);
    try {
      const res = await fetch(`${API_BASE}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : data.results);
      } else {
        console.error("Failed to fetch products", await res.text());
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products", err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(API_CATEGORIES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data.results);
      } else {
        console.error("Failed to fetch categories", await res.text());
      }
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  // Fetch brands
  const fetchBrands = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(API_BRANDS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBrands(Array.isArray(data) ? data : data.results);
      } else {
        console.error("Failed to fetch brands", await res.text());
      }
    } catch (err) {
      console.error("Error fetching brands", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) =>
    setActiveTab(newValue);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setStock("");
    setSelectedCategories([]);
    setBrand("");
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
  };

  const handleAddOrEditProduct = async () => {
    const token = getToken();
    if (!token) return;

    if (
      !title ||
      !description ||
      price === "" ||
      stock === "" ||
      selectedCategories.length === 0 ||
      !brand
    ) {
      alert("Please fill all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price.toString());
    formData.append("stock", stock.toString());
    formData.append("brand", brand);
    selectedCategories.forEach((c) => formData.append("categories", c));

    if (imageFile) {
      formData.append("cover_image", imageFile);
    }

    setSaving(true);
    try {
      const url = editingId
        ? `${API_BASE}/${editingId}/`
        : `${API_BASE}/`;

      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        alert(editingId ? "Product updated!" : "Product added!");
        resetForm();
        fetchProducts();
        setActiveTab(1);
      } else {
        console.error("Failed to save product", await res.text());
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
    setStock(p.stock ?? "");
    setBrand(p.brand?.id?.toString() ?? "");
    setSelectedCategories(p.categories?.map((c) => c.id.toString()) || []);
    setImagePreview(p.cover_image ?? null);
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
      if (res.ok) {
        fetchProducts();
      } else {
        alert("Failed to delete product");
      }
    } catch (err) {
      console.error("Error deleting product", err);
      alert("Error deleting product");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#FFFFFF",
        padding: 3,
        position: "relative",
        zIndex: 1,
      }}
    >
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          mb: 4,
          "& .MuiTabs-indicator": { backgroundColor: "#DC1A8A" },
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: "bold",
            color: "#666666",
            "&.Mui-selected": { color: "#DC1A8A" },
          },
        }}
      >
        <Tab label="Add/Edit Product" />
        <Tab label="View Products" />
      </Tabs>

      {activeTab === 0 && (
        <Box
          sx={{
            backgroundColor: "#F9FAFB",
            p: 4,
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          }}
        >
          <TextField
            label="Product Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                "& fieldset": { borderColor: "#E0E0E0" },
                "&:hover fieldset": { borderColor: "#DC1A8A" },
                "&.Mui-focused fieldset": { borderColor: "#DC1A8A" },
              },
            }}
          />
          <TextField
            label="Description *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                "& fieldset": { borderColor: "#E0E0E0" },
                "&:hover fieldset": { borderColor: "#DC1A8A" },
                "&.Mui-focused fieldset": { borderColor: "#DC1A8A" },
              },
            }}
          />
          <TextField
            label="Price (KES) *"
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            fullWidth
            variant="outlined"
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                "& fieldset": { borderColor: "#E0E0E0" },
                "&:hover fieldset": { borderColor: "#DC1A8A" },
                "&.Mui-focused fieldset": { borderColor: "#DC1A8A" },
              },
            }}
          />
          <TextField
            label="Stock *"
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            fullWidth
            variant="outlined"
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                "& fieldset": { borderColor: "#E0E0E0" },
                "&:hover fieldset": { borderColor: "#DC1A8A" },
                "&.Mui-focused fieldset": { borderColor: "#DC1A8A" },
              },
            }}
          />

          {/* Multi-select categories */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Categories *</InputLabel>
            <Select
              multiple
              value={selectedCategories}
              onChange={(e) =>
                setSelectedCategories(
                  typeof e.target.value === "string"
                    ? e.target.value.split(",")
                    : e.target.value
                )
              }
              input={<OutlinedInput label="Categories *" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as string[]).map((value) => {
                    const cat = categories.find((c) => c.id.toString() === value);
                    return <Chip key={value} label={cat?.name || value} sx={{ backgroundColor: "#F5F5F5" }} />;
                  })}
                </Box>
              )}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  "& fieldset": { borderColor: "#E0E0E0" },
                  "&:hover fieldset": { borderColor: "#DC1A8A" },
                  "&.Mui-focused fieldset": { borderColor: "#DC1A8A" },
                },
              }}
            >
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id.toString()}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Brand select */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Brand *</InputLabel>
            <Select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  "& fieldset": { borderColor: "#E0E0E0" },
                  "&:hover fieldset": { borderColor: "#DC1A8A" },
                  "&.Mui-focused fieldset": { borderColor: "#DC1A8A" },
                },
              }}
            >
              {brands.map((b) => (
                <MenuItem key={b.id} value={b.id.toString()}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
            style={{ marginBottom: 16 }}
          />
          {imagePreview && (
            <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ maxWidth: "200px", borderRadius: 8, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
              />
            </Box>
          )}

          <Button
            variant="contained"
            onClick={handleAddOrEditProduct}
            sx={{
              backgroundColor: "#DC1A8A",
              "&:hover": { backgroundColor: "#B00053" },
              borderRadius: 1,
              padding: "10px 20px",
              textTransform: "none",
              fontWeight: "bold",
              width: "100%",
            }}
            disabled={saving}
          >
            {saving ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : editingId ? (
              "Update Product"
            ) : (
              "Add Product"
            )}
          </Button>
        </Box>
      )}

      {activeTab === 1 && (
        <Box
          sx={{
            backgroundColor: "#F9FAFB",
            p: 3,
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          }}
        >
          {loadingProducts ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "#DC1A8A",
                    "& .MuiTableCell-root": {
                      color: "#fff",
                      fontWeight: "bold",
                    },
                  }}
                >
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Price (KES)</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Discount</TableCell>
                  <TableCell>Categories</TableCell>
                  <TableCell>Brand</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: "center", p: 4, color: "#666666" }}>
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => (
                    <TableRow
                      key={p.id}
                      sx={{ "&:hover": { backgroundColor: "#F5F5F5" } }}
                    >
                      <TableCell>
                        <a href={`/products/${p.id}`} style={{ color: "#DC1A8A", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                          {p.title ?? "-"}
                        </a>
                      </TableCell>
                      <TableCell>{p.description ?? "-"}</TableCell>
                      <TableCell>
                        {p.price?.toLocaleString("en-KE", {
                          style: "currency",
                          currency: "KES",
                        }) ?? "KES 0"}
                      </TableCell>
                      <TableCell>{p.stock ?? 0}</TableCell>
                      <TableCell>{p.discount ?? 0}%</TableCell>
                      <TableCell>
                        {p.categories?.map((c) => c.name).join(", ") ?? "-"}
                      </TableCell>
                      <TableCell>{p.brand?.name ?? "-"}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => handleEditClick(p)}
                          sx={{ mr: 1, backgroundColor: "#F9FAFB", "&:hover": { backgroundColor: "#E0E0E0" } }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDelete(p.id)}
                          sx={{ backgroundColor: "#F9FAFB", "&:hover": { backgroundColor: "#FFE0E0" } }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProductSection;