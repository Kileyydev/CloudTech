// src/app/admin/products/page.tsx
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Paper,
  Divider,
  Tabs,
  Tab,
  TextField,
  Checkbox,
  FormControlLabel,
  Avatar,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  OutlinedInput,
} from '@mui/material';
import {
  Edit,
  Delete,
  AddPhotoAlternate,
  Image as ImageIcon,
  Close as CloseIcon,
  Category,
  Business,
  Palette,
  Memory,
  Storage,
  LocalOffer,
  CheckCircle,
  Refresh,
  Search as SearchIcon,
} from '@mui/icons-material';

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE}/products/`;
const API_OPTS = `${process.env.NEXT_PUBLIC_API_BASE}/options/`;
const API_CATS = `${process.env.NEXT_PUBLIC_API_BASE}/categories/`;
const API_BRANDS = `${process.env.NEXT_PUBLIC_API_BASE}/brands/`;

export default function ProductAdminPage() {
  const [tab, setTab] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [discount, setDiscount] = useState<number | ''>(0);
  const [finalPrice, setFinalPrice] = useState<number | ''>('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [brandId, setBrandId] = useState<string>('');
  const [selectedRam, setSelectedRam] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);

  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' }>({
    open: false,
    msg: '',
    sev: 'success',
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;

  // Final price calculation
  useEffect(() => {
    if (price !== '' && discount !== '') {
      const p = Number(price);
      const d = Number(discount);
      setFinalPrice(d > 0 ? Math.round(p * (1 - d / 100) * 100) / 100 : p);
    } else {
      setFinalPrice('');
    }
  }, [price, discount]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      galleryPreviews.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [galleryPreviews]);

  // Fetch all data
  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [pRes, cRes, bRes, oRes] = await Promise.all([
        fetch(API_BASE, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(API_CATS, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(API_BRANDS, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(API_OPTS, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!pRes.ok || !cRes.ok || !bRes.ok || !oRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [pJson, cJson, bJson, oJson] = await Promise.all([
        pRes.json(),
        cRes.json(),
        bRes.json(),
        oRes.json(),
      ]);

      setProducts(Array.isArray(pJson) ? pJson : pJson.results || []);
      setCategories(Array.isArray(cJson) ? cJson : cJson.results || []);
      setBrands(Array.isArray(bJson) ? bJson : bJson.results || []);
      setOptions(Array.isArray(oJson) ? oJson : oJson.results || []);
    } catch (error: any) {
      setSnack({ open: true, msg: 'Failed to load data', sev: 'error' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Image handlers
  const handleCover = (files: FileList | null) => {
    if (!files?.[0]) {
      setCoverFile(null);
      setCoverPreview(null);
      return;
    }
    const f = files[0];
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const handleGallery = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setGalleryFiles((prev) => [...prev, ...arr]);
    setGalleryPreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
  };

  const removeGallery = (idx: number) => {
    const isNew = idx >= existingGallery.length;
    const realIdx = isNew ? idx - existingGallery.length : idx;

    if (isNew) {
      setGalleryFiles((prev) => prev.filter((_, i) => i !== realIdx));
    } else {
      setExistingGallery((prev) => prev.filter((_, i) => i !== realIdx));
    }

    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // Form reset & edit
  const resetForm = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setStock('');
    setDiscount(0);
    setFinalPrice('');
    setSelectedCats([]);
    setBrandId('');
    setSelectedRam([]);
    setSelectedStorage([]);
    setSelectedColors([]);
    setTagNames([]);
    setCoverFile(null);
    setCoverPreview(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setExistingGallery([]);
    setIsActive(true);
    setIsFeatured(false);
    setVariants([]);
  };

  const startEdit = (p: any) => {
    setEditId(p.id);
    setTitle(p.title ?? '');
    setDescription(p.description ?? '');
    setPrice(p.price ?? '');
    setStock(p.stock ?? '');
    setDiscount(p.discount ?? 0);
    setBrandId(p.brand?.id?.toString() ?? '');
    setSelectedCats(p.categories?.map((c: any) => c.id.toString()) ?? []);
    setSelectedRam(p.ram_options?.map((o: any) => o.id.toString()) ?? []);
    setSelectedStorage(p.storage_options?.map((o: any) => o.id.toString()) ?? []);
    setSelectedColors(p.colors?.map((o: any) => o.id.toString()) ?? []);
    setTagNames(p.tags?.map((t: any) => t.name).filter(Boolean) ?? []);
    setIsActive(p.is_active ?? true);
    setIsFeatured(p.is_featured ?? false);
    setCoverPreview(p.cover_image?.url ?? p.cover_image ?? null);

    const existing = p.images?.map((i: any) => i.image?.url ?? i.image).filter(Boolean) ?? [];
    setExistingGallery(existing);
    setGalleryPreviews(existing);

    setVariants(
      p.variants?.map((v: any) => ({
        id: v.id,
        sku: v.sku || '',
        color: v.color || '',
        ram: v.ram || '',
        storage: v.storage || '',
        processor: v.processor || '',
        size: v.size || '',
        price: v.price || '',
        compare_at_price: v.compare_at_price || '',
        stock: v.stock || '',
        is_active: v.is_active ?? true,
      })) ?? []
    );
    setTab(0);
  };

  // Save product
  const saveProduct = async () => {
    if (!token) return;

    const form = new FormData();

    if (title.trim()) form.append('title', title.trim());
    if (description.trim()) form.append('description', description.trim());
    if (price !== '' && price != null) form.append('price', String(price));
    if (stock !== '' && stock != null) form.append('stock', String(stock));
    if (discount !== '' && discount != null) form.append('discount', String(discount));
    if (isActive !== null) form.append('is_active', String(isActive));
    if (isFeatured !== null) form.append('is_featured', String(isFeatured));
    if (brandId) form.append('brand_id', brandId);

    selectedCats.forEach((id) => form.append('category_ids', id));
    selectedRam.forEach((id) => form.append('ram_option_ids', id));
    selectedStorage.forEach((id) => form.append('storage_option_ids', id));
    selectedColors.forEach((id) => form.append('color_option_ids', id));
    tagNames.filter((t) => t.trim()).forEach((t) => form.append('tag_names', t.trim()));

    const cleanVariants = variants
      .map((v) => {
        const variant: any = {};
        if (v.sku?.trim()) variant.sku = v.sku.trim();
        if (v.color?.trim()) variant.color = v.color.trim();
        if (v.ram?.trim()) variant.ram = v.ram.trim();
        if (v.storage?.trim()) variant.storage = v.storage.trim();
        if (v.processor?.trim()) variant.processor = v.processor.trim();
        if (v.size?.trim()) variant.size = v.size.trim();
        if (v.price !== '' && v.price != null) variant.price = Number(v.price);
        if (v.compare_at_price !== '' && v.compare_at_price != null)
          variant.compare_at_price = Number(v.compare_at_price);
        if (v.stock !== '' && v.stock != null) variant.stock = Number(v.stock);
        variant.is_active = v.is_active ?? true;
        return variant;
      })
      .filter((v) => Object.keys(v).length > 1);

    if (cleanVariants.length > 0) {
      form.append('variants', JSON.stringify(cleanVariants));
    }

    if (coverFile) form.append('cover_image', coverFile);
    galleryFiles.forEach((f) => form.append('gallery_images', f));
    existingGallery.forEach((url) => form.append('keep_gallery', url));

    setSaving(true);
    try {
      const url = editId ? `${API_BASE}${editId}/` : API_BASE;
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (res.ok) {
        setSnack({ open: true, msg: editId ? 'Updated!' : 'Created!', sev: 'success' });
        resetForm();
        fetchAll();
        setTab(1);
      } else {
        const errText = await res.text();
        setSnack({ open: true, msg: `Error: ${errText.slice(0, 120)}`, sev: 'error' });
      }
    } catch (err: any) {
      setSnack({ open: true, msg: `Network error: ${err.message}`, sev: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Delete & discount
  const confirmDel = (id: string) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!token || !deleteId) return;
    try {
      const res = await fetch(`${API_BASE}${deleteId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSnack({ open: true, msg: 'Deleted!', sev: 'success' });
        fetchAll();
      } else {
        setSnack({ open: true, msg: 'Delete failed', sev: 'error' });
      }
    } catch {
      setSnack({ open: true, msg: 'Delete failed', sev: 'error' });
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const updateDiscount = async (p: any) => {
    if (!token) return;
    const final = p.price && p.discount ? Math.round(p.price * (1 - p.discount / 100) * 100) / 100 : p.price;
    try {
      const res = await fetch(`${API_BASE}${p.id}/`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ discount: p.discount, final_price: final }),
      });
      if (res.ok) {
        setSnack({ open: true, msg: 'Discount updated', sev: 'success' });
        fetchAll();
      }
    } catch {
      setSnack({ open: true, msg: 'Update failed', sev: 'error' });
    }
  };

  // Filtered products with search
  const filtered = useMemo(() => {
    let list = products;

    if (categoryFilter !== 'all') {
      list = list.filter((p) => p.categories?.some((c: any) => c.id === categoryFilter));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.brand?.name?.toLowerCase().includes(q) ||
        p.tags?.some((t: any) => t.name?.toLowerCase().includes(q))
      );
    }

    return list;
  }, [products, categoryFilter, searchQuery]);

  const discounted = products.filter((p) => p.discount && p.discount > 0);

  const addVariant = () => setVariants((prev) => [...prev, { sku: '', price: '', stock: '', is_active: true }]);
  const updateVariant = (idx: number, field: string, value: any) => {
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v)));
  };
  const removeVariant = (idx: number) => setVariants((prev) => prev.filter((_, i) => i !== idx));
  const getCoverSrc = (p: any) => p.cover_image?.url || p.cover_image || '/placeholder.png';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', color: '#000', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>

      {/* Tabs */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #ddd' }}>
        <Box sx={{ px: { xs: 2, md: 4 } }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label={editId ? 'EDIT PRODUCT' : 'ADD PRODUCT'} />
            <Tab label="ALL PRODUCTS" />
            <Tab label="DISCOUNTED" />
          </Tabs>
        </Box>
      </Box>

      {/* Form Tab */}
      {tab === 0 && (
        <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
          <Paper sx={{ p: { xs: 3, md: 5 }, border: '1px solid #ddd' }}>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>
              {editId ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}
            </Typography>

            <Stack spacing={4}>
              {/* Basic Info */}
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Category sx={{ fontSize: 18 }} /> BASIC INFORMATION
                </Typography>
                <Stack spacing={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Product Title</InputLabel>
                    <OutlinedInput value={title} onChange={(e) => setTitle(e.target.value)} />
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Description</InputLabel>
                    <OutlinedInput
                      multiline
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </FormControl>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <FormControl size="small" sx={{ flex: 1 }}>
                      <InputLabel>Price (KES)</InputLabel>
                      <OutlinedInput
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value) || '')}
                      />
                    </FormControl>
                    <FormControl size="small" sx={{ flex: 1 }}>
                      <InputLabel>Discount %</InputLabel>
                      <OutlinedInput
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormControl size="small" sx={{ flex: 1 }}>
                      <InputLabel>Final Price</InputLabel>
                      <OutlinedInput value={finalPrice} disabled />
                    </FormControl>
                  </Stack>

                  <FormControl fullWidth size="small">
                    <InputLabel>Stock Quantity</InputLabel>
                    <OutlinedInput
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value) || '')}
                    />
                  </FormControl>
                </Stack>
              </Box>

              <Divider />

              {/* Brand & Categories */}
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business sx={{ fontSize: 18 }} /> BRAND & CATEGORY
                </Typography>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel>Brand</InputLabel>
                    <Select
                      value={brandId}
                      onChange={(e) => setBrandId(e.target.value)}
                      displayEmpty
                      endAdornment={
                        brandId && (
                          <InputAdornment position="end" sx={{ mr: 1 }}>
                            <IconButton size="small" onClick={() => setBrandId('')}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    >
                      
                      {brands.map((b) => (
                        <MenuItem key={b.id} value={b.id.toString()}>
                          {b.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel>Categories</InputLabel>
                    <Select
                      multiple
                      value={selectedCats}
                      onChange={(e) => setSelectedCats(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as string[]).map((value) => {
                            const cat = categories.find((c: any) => c.id.toString() === value);
                            return <Chip key={value} label={cat?.name} size="small" sx={{ bgcolor: '#e91e63', color: '#fff' }} />;
                          })}
                        </Box>
                      )}
                      endAdornment={
                        selectedCats.length > 0 && (
                          <InputAdornment position="end" sx={{ mr: 1 }}>
                            <IconButton size="small" onClick={() => setSelectedCats([])}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    >
                      {categories.map((c) => (
                        <MenuItem key={c.id} value={c.id.toString()}>
                          <Checkbox checked={selectedCats.includes(c.id.toString())} /> {c.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Box>

              <Divider />

              {/* Product Options */}
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Palette sx={{ fontSize: 18 }} /> PRODUCT OPTIONS
                </Typography>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  {['RAM', 'STORAGE', 'COLOR'].map((type) => {
                    const value = type === 'RAM' ? selectedRam : type === 'STORAGE' ? selectedStorage : selectedColors;
                    const setValue = type === 'RAM' ? setSelectedRam : type === 'STORAGE' ? setSelectedStorage : setSelectedColors;
                    const filteredOptions = options.filter((o) => o.type === type);

                    return (
                      <FormControl key={type} size="small" sx={{ flex: 1 }}>
                        <InputLabel>{type === 'RAM' ? 'RAM Options' : type === 'STORAGE' ? 'Storage Options' : 'Colors'}</InputLabel>
                        <Select
                          multiple
                          value={value}
                          onChange={(e) => {
                            const val = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                            setValue(val);
                          }}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(selected as string[]).map((v) => {
                                const o = options.find((opt) => opt.id.toString() === v);
                                return <Chip key={v} label={o?.value} size="small" sx={{ bgcolor: '#e91e63', color: '#fff' }} />;
                              })}
                            </Box>
                          )}
                          endAdornment={
                            value.length > 0 && (
                              <InputAdornment position="end" sx={{ mr: 1 }}>
                                <IconButton size="small" onClick={() => setValue([])}>
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </InputAdornment>
                            )
                          }
                        >
                          {filteredOptions.map((o) => (
                            <MenuItem key={o.id} value={o.id.toString()}>
                              <Checkbox checked={value.includes(o.id.toString())} /> {o.value}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    );
                  })}
                </Stack>
              </Box>

              <Divider />

              {/* Tags */}
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalOffer sx={{ fontSize: 18 }} /> TAGS
                </Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Tags (comma separated)</InputLabel>
                  <OutlinedInput
                    value={tagNames.join(', ')}
                    onChange={(e) => setTagNames(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                    endAdornment={
                      tagNames.length > 0 && (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setTagNames([])}>
                            <CloseIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  />
                </FormControl>
              </Box>

              <Divider />

              {/* Images */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ImageIcon sx={{ fontSize: 18 }} /> COVER IMAGE
                  </Typography>
                  <Box sx={{ border: '2px dashed #ddd', p: 3, textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
                    <input type="file" accept="image/*" onChange={(e) => handleCover(e.target.files)} id="cover-upload" style={{ display: 'none' }} />
                    <label htmlFor="cover-upload">
                      <AddPhotoAlternate sx={{ fontSize: 40, color: '#666' }} />
                      <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                        Drop or click to upload cover
                      </Typography>
                    </label>
                    {coverPreview && (
                      <IconButton
                        size="small"
                        onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff' }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  {coverPreview && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Avatar variant="rounded" src={coverPreview} sx={{ width: 180, height: 120, mx: 'auto' }} />
                    </Box>
                  )}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ImageIcon sx={{ fontSize: 18 }} /> GALLERY IMAGES
                  </Typography>
                  <Box sx={{ border: '2px dashed #ddd', p: 3, textAlign: 'center', cursor: 'pointer' }}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleGallery(e.target.files)}
                      id="gallery-upload"
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="gallery-upload">
                      <ImageIcon sx={{ fontSize: 40, color: '#666' }} />
                      <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                        Add multiple images
                      </Typography>
                    </label>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                    {galleryPreviews.map((src, i) => (
                      <Box key={i} sx={{ position: 'relative', width: 80, height: 80 }}>
                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                        <IconButton
                          size="small"
                          onClick={() => removeGallery(i)}
                          sx={{ position: 'absolute', top: -8, right: -8, bgcolor: '#000', color: '#fff' }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Stack>

              <Divider />

              {/* Variants */}
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Memory sx={{ fontSize: 18 }} /> VARIANTS
                </Typography>
                <Button size="small" onClick={addVariant} variant="outlined" sx={{ mb: 2 }}>
                  Add Variant
                </Button>
                <Stack spacing={2}>
                  {variants.map((v, i) => (
                    <Paper key={i} sx={{ p: 2, bgcolor: '#fafafa' }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" gap={1}>
                        <TextField size="small" label="SKU" value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} />
                        <TextField size="small" label="Price" type="number" value={v.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} />
                        <TextField size="small" label="Stock" type="number" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} />
                        <IconButton size="small" color="error" onClick={() => removeVariant(i)}>
                          <CloseIcon />
                        </IconButton>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>

              <Divider />

              {/* Toggles & Save */}
              <Box>
                <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
                  <FormControlLabel control={<Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />} label="Product is Active" />
                  <FormControlLabel control={<Checkbox checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />} label="Featured Product" />
                </Stack>
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={saveProduct}
                    disabled={saving}
                    sx={{
                      bgcolor: '#000',
                      color: '#fff',
                      px: 6,
                      py: 1.5,
                      fontWeight: 700,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#333' },
                      '&:disabled': { bgcolor: '#ccc' },
                    }}
                  >
                    {saving ? 'Saving...' : editId ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}
                  </Button>
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Box>
      )}

      {/* All Products Tab */}
      {tab === 1 && (
        <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
          <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: '#999' }} />,
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Tabs value={categoryFilter} onChange={(_, v) => setCategoryFilter(v)} variant="scrollable">
              <Tab label="All" value="all" />
              {categories.map((c) => (
                <Tab key={c.id} label={c.name} value={c.id} />
              ))}
            </Tabs>
          </Box>

          {loading ? (
            <Box sx={{ py: 10, textAlign: 'center' }}>
              <CircularProgress size={40} sx={{ color: '#e91e63' }} />
            </Box>
          ) : filtered.length === 0 ? (
            <Typography sx={{ py: 10, textAlign: 'center', color: '#999' }}>
              {searchQuery ? 'No products match your search.' : 'No products found'}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {filtered.map((p) => (
                <Box key={p.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' } }}>
                  <Paper sx={{ height: '100%', p: 2, border: '1px solid #eee' }}>
                    <Box sx={{ position: 'relative' }}>
                      {p.discount > 0 && (
                        <Chip
                          label={`${p.discount}% OFF`}
                          size="small"
                          sx={{ position: 'absolute', top: 8, left: 8, bgcolor: '#e91e63', color: '#fff', fontWeight: 600 }}
                        />
                      )}
                      <Box
                        onClick={() => startEdit(p)}
                        sx={{
                          height: 220,
                          cursor: 'pointer',
                          overflow: 'hidden',
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#f9f9f9',
                        }}
                      >
                        <img
                          src={getCoverSrc(p)}
                          alt={p.title}
                          style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            objectFit: 'contain',
                          }}
                        />
                      </Box>
                    </Box>
                    <Typography sx={{ fontWeight: 600, mb: 1 }}>{p.title || 'Untitled'}</Typography>
                    <Typography sx={{ color: '#666', mb: 1, fontSize: '0.85rem', height: 40, overflow: 'hidden' }}>
                      {p.description || 'No description'}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {p.discount > 0 && (
                        <Typography sx={{ textDecoration: 'line-through', color: '#999', fontSize: '0.85rem' }}>
                          KES {p.price?.toLocaleString() || '—'}
                        </Typography>
                      )}
                      <Typography sx={{ fontWeight: 700, color: '#e91e63', fontSize: '1.1rem' }}>
                        KES {(p.final_price ?? p.price)?.toLocaleString() || '—'}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" startIcon={<Edit />} onClick={() => startEdit(p)} sx={{ flex: 1 }}>
                        Edit
                      </Button>
                      <Button size="small" startIcon={<Delete />} onClick={() => confirmDel(p.id)} color="error" sx={{ flex: 1 }}>
                        Delete
                      </Button>
                    </Stack>
                  </Paper>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Discounted Table */}
      {tab === 2 && (
        <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
          <Paper sx={{ border: '1px solid #ddd' }}>
            <Box sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                DISCOUNTED PRODUCTS
              </Typography>
              {loading ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <CircularProgress size={40} sx={{ color: '#e91e63' }} />
                </Box>
              ) : discounted.length === 0 ? (
                <Typography sx={{ py: 8, textAlign: 'center', color: '#999' }}>No discounted products</Typography>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#000' }}>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Image</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Title</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Original</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Discount %</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Final Price</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Brand</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {discounted.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Box sx={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f9f9f9' }}>
                            <img src={getCoverSrc(p)} width={55} height={55} style={{ objectFit: 'contain' }} />
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{p.title || 'Untitled'}</TableCell>
                        <TableCell>
                          <Typography sx={{ textDecoration: 'line-through', color: '#999' }}>
                            KES {p.price?.toLocaleString() || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={p.discount ?? 0}
                            onChange={(e) =>
                              setProducts((prev) =>
                                prev.map((x) => (x.id === p.id ? { ...x, discount: Number(e.target.value) } : x))
                              )
                            }
                            sx={{ width: 70 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#e91e63' }}>
                          KES {(p.price! * (1 - (p.discount || 0) / 100)).toFixed(0)}
                        </TableCell>
                        <TableCell>{p.brand?.name || '—'}</TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => updateDiscount(p)} variant="contained">
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
        </Box>
      )}

      {/* Delete Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>This action cannot be undone. Are you sure?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={doDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.sev} onClose={() => setSnack((s) => ({ ...s, open: false }))} sx={{ fontWeight: 600 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}