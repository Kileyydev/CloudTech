// src/app/admin/testimonials/page.tsx
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
  IconButton,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Snackbar,
  Alert,
  Tooltip,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
} from "@mui/material";
import { Done, Close, Delete, Search as SearchIcon } from "@mui/icons-material";

type TestimonialT = {
  id: number;
  name: string;
  product: string;
  category: string;
  rating: number;
  experience: string;
  email?: string;
  phone?: string;
  is_approved: boolean;
  created_at: string;
};

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE}/testimonials/`;

export default function TestimonialsAdminPage() {
  const [items, setItems] = useState<TestimonialT[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
    open: false,
    msg: "",
    severity: "success",
  });

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all");

  const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE, { headers });
      if (!res.ok) throw new Error("Failed to fetch testimonials");
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results && Array.isArray(data.results) ? data.results : [];
      setItems(list);
    } catch (err: any) {
      console.error(err);
      setSnack({ open: true, msg: err.message || "Error", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const toggleApprove = async (id: number, approve: boolean) => {
    setSavingId(id);
    try {
      const res = await fetch(`${API_BASE}${id}/`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ is_approved: approve }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setSnack({ open: true, msg: "Updated", severity: "success" });
      fetchList();
    } catch (err: any) {
      console.error(err);
      setSnack({ open: true, msg: err.message || "Error", severity: "error" });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete testimonial?")) return;
    try {
      const res = await fetch(`${API_BASE}${id}/`, { method: "DELETE", headers });
      if (!res.ok) throw new Error("Failed to delete");
      setSnack({ open: true, msg: "Deleted", severity: "success" });
      fetchList();
    } catch (err: any) {
      setSnack({ open: true, msg: err.message || "Error", severity: "error" });
    }
  };

  // Filter logic
  const filtered = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.experience.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "approved" && item.is_approved) ||
      (statusFilter === "pending" && !item.is_approved);

    return matchesSearch && matchesStatus;
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fff",
        color: "#000",
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif"',
        margin: 0,
        padding: 0,
      }}
    >
      

      {/* Search + Status Tabs (Same Level) */}
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search by name, product, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{
              flex: { xs: 1, sm: "0 1 350px" },
              minWidth: 250,
              "& .MuiInputBase-input": { color: "#000" },
              "& .MuiInputLabel-root": { color: "#000" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#000" },
                "&:hover fieldset": { borderColor: "#000" },
                "&.Mui-focused fieldset": { borderColor: "#000" },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#000" }} />
                </InputAdornment>
              ),
            }}
          />
          <Tabs
            value={statusFilter}
            onChange={(_, v) => setStatusFilter(v)}
            sx={{
              flex: 1,
              minWidth: 300,
              "& .MuiTab-root": {
                color: "#000",
                "&.Mui-selected": {
                  color: "#000",
                  fontWeight: 700,
                },
              },
              "& .MuiTabs-indicator": {
                bgcolor: "#000",
              },
            }}
          >
            <Tab label="All" value="all" />
            <Tab label="Approved" value="approved" />
            <Tab label="Pending" value="pending" />
          </Tabs>
        </Box>

        <Card sx={{ border: "1px solid #ddd" }}>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ py: 10, textAlign: "center" }}>
                <CircularProgress size={40} sx={{ color: "#e91e63" }} />
              </Box>
            ) : filtered.length === 0 ? (
              <Typography sx={{ py: 10, textAlign: "center", color: "#999" }}>
                {searchQuery || statusFilter !== "all"
                  ? "No testimonials match your filters."
                  : "No testimonials yet."}
              </Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#000" }}>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Product</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Rating</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Message</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell sx={{ fontWeight: 600, color: "#000" }}>{item.name}</TableCell>
                      <TableCell>{item.product}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Box
                              key={i}
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                bgcolor: i < item.rating ? "#e91e63" : "#ddd",
                              }}
                            />
                          ))}
                          <Typography sx={{ ml: 1, fontSize: "0.9rem" }}>{item.rating}/5</Typography>
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 360,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          color: "#000",
                        }}
                      >
                        {item.experience}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.85rem", color: "#666" }}>
                        {new Date(item.created_at).toLocaleString("en-KE", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.is_approved ? "Approved" : "Pending"}
                          color={item.is_approved ? "success" : "warning"}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            "&.MuiChip-root": {
                              bgcolor: item.is_approved ? "#4caf50" : "#ff9800",
                              color: "#fff",
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          {item.is_approved ? (
                            <Tooltip title="Disapprove">
                              <IconButton
                                onClick={() => toggleApprove(item.id, false)}
                                disabled={savingId === item.id}
                                size="small"
                                sx={{ color: "#f44336" }}
                              >
                                <Close />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Approve">
                              <IconButton
                                onClick={() => toggleApprove(item.id, true)}
                                disabled={savingId === item.id}
                                size="small"
                                sx={{ color: "#4caf50" }}
                              >
                                <Done />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => handleDelete(item.id)}
                              size="small"
                              sx={{ color: "#d32f2f" }}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ fontWeight: 600 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}