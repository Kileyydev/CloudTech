"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  Stack,
  Snackbar,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CheckCircle,
  Inventory,
  AccessTime,
  LocalShipping,
  DoneAll,
  Refresh,
} from "@mui/icons-material";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api"
    : "https://api.cloudtechstore.net/api");

interface OrderItem {
  product_id: string;
  title: string;
  price: number;
  quantity: number;
}

interface OrderData {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  payment: string;
  cash_amount: number;
  subtotal: number;
  total: number;
  status: string;
  date: string;
  items: OrderItem[];
}

const STATUS_STEPS = [
  { key: "confirmed", label: "Confirmed", icon: <CheckCircle />, color: "#e91e63" },
  { key: "received", label: "Received", icon: <Inventory />, color: "#ff9800" },
  { key: "processing", label: "Processing", icon: <AccessTime />, color: "#2196f3" },
  { key: "packaging", label: "Packaging", icon: <Inventory />, color: "#9c27b0" },
  { key: "dispatched", label: "Dispatched", icon: <LocalShipping />, color: "#4caf50" },
  { key: "delivered", label: "Delivered", icon: <DoneAll />, color: "#2e7d32" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    severity: "success" | "error";
  }>({ open: false, msg: "", severity: "success" });
  const [nextUrl, setNextUrl] = useState<string | null>(null);

  // ----- AUTH -----
  const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // ----- FETCH ALL ORDERS -----
  const fetchOrders = async (url: string = `${API_BASE}/purchases/`) => {
    if (!token) {
      setSnack({ open: true, msg: "Login as admin first", severity: "error" });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt || "Unknown error"}`);
      }

      const raw = await res.json();
      console.log("RAW API RESPONSE:", raw); // <-- DEBUG: see exactly what Django returns

      // ---- NORMALISE PAYLOAD ----
      let list: OrderData[] = [];

      if (Array.isArray(raw)) {
        list = raw;
      } else if (raw.results && Array.isArray(raw.results)) {
        list = raw.results;
      } else if (raw.id) {
        // single object returned
        list = [raw];
      }

      setOrders((prev) => (url.includes("page=") ? [...prev, ...list] : list));
      setNextUrl(raw.next || null);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setSnack({ open: true, msg: err.message || "Failed to load orders", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ----- UPDATE STATUS -----
  const updateStatus = async (id: string, status: string) => {
    setSavingId(id);
    try {
      const res = await fetch(`${API_BASE}/purchases/${id}/`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");

      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
      setSnack({ open: true, msg: "Status updated", severity: "success" });
    } catch (err: any) {
      setSnack({ open: true, msg: err.message || "Update failed", severity: "error" });
    } finally {
      setSavingId(null);
    }
  };

  // ----- HELPERS -----
  const formatDate = (d: string) =>
    new Date(d).toLocaleString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStep = (status: string) =>
    STATUS_STEPS.find((s) => s.key === status) ?? STATUS_STEPS[0];

  // ----- UI -----
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9f9f9", py: 4 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{ mb: 4, fontWeight: 700, color: "#e91e63", textAlign: "center" }}
        >
          Admin — Orders Management
        </Typography>

        <Card>
          <CardContent>
            {loading && orders.length === 0 ? (
              <Box textAlign="center" py={4}>
                <CircularProgress />
                <Typography mt={2}>Loading orders…</Typography>
              </Box>
            ) : orders.length === 0 ? (
              <Typography textAlign="center" color="text.secondary" py={4}>
                No orders found in the database.
              </Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Customer</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Total</strong></TableCell>
                    <TableCell><strong>Items</strong></TableCell>
                    <TableCell><strong>Payment</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Refresh</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => {
                    const step = getStep(order.status);
                    return (
                      <TableRow key={order.id} hover>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>
                          <strong>{order.name}</strong>
                          <br />
                          <Typography variant="body2" color="text.secondary">
                            {order.phone}
                            <br />
                            {order.city}, {order.address}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(order.date)}</TableCell>
                        <TableCell>
                          <Typography fontWeight={600} color="#e91e63">
                            KES {order.total.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>{order.items.length} item{order.items.length > 1 ? "s" : ""}</TableCell>
                        <TableCell>{order.payment.toUpperCase()}</TableCell>
                        <TableCell>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={order.status}
                              onChange={(e) => updateStatus(order.id, e.target.value)}
                              disabled={savingId === order.id}
                              sx={{ "& .MuiSelect-select": { py: 0.5, fontSize: "0.875rem" } }}
                            >
                              {STATUS_STEPS.map((s) => (
                                <MenuItem key={s.key} value={s.key}>
                                  <Chip
                                    label={s.label}
                                    icon={s.icon}
                                    size="small"
                                    sx={{
                                      bgcolor: `${s.color}20`,
                                      color: s.color,
                                      fontWeight: 600,
                                    }}
                                  />
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Refresh list">
                            <IconButton size="small" onClick={() => fetchOrders()}>
                              <Refresh />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {/* Load More */}
            {nextUrl && (
              <Box textAlign="center" mt={3}>
                <Button
                  variant="outlined"
                  onClick={() => fetchOrders(nextUrl)}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : "Load More"}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Snackbar */}
        <Snackbar
          open={snack.open}
          autoHideDuration={3000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={snack.severity}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}