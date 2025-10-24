"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const API_BASE = "http://localhost:8000/api/repairs/";

type RepairT = {
  id: number;
  full_name: string;
  phone_number: string;
  description: string;
  media?: string;
  created_at: string;
  is_resolved: boolean;
};

export default function AdminRepairsPage() {
  const [repairs, setRepairs] = useState<RepairT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access"); // JWT token stored on login

  const fetchRepairs = async () => {
    try {
      const res = await fetch(API_BASE, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to fetch repair requests");
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];
      setRepairs(list);
    } catch (err: any) {
      setError(err.message || "Failed to load repair requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const markResolved = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_resolved: true }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setRepairs((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_resolved: true } : r))
      );
    } catch (err: any) {
      alert(err.message || "Error updating status");
    }
  };

  // ✅ WhatsApp chat link
  const whatsappNumber = "0708835355";
  const chatWhatsApp = (customerName: string, customerPhone: string) => {
    const message = `Hi ${customerName}, this is CloudTech Support. Regarding your repair request, please reply to this message.`;
    const phone = customerPhone.replace(/^\+?0/, "254"); // convert to full Kenyan format if needed
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, color: "#db1b88" }}>
        Repair Requests Dashboard
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : repairs.length === 0 ? (
        <Typography>No repair requests yet.</Typography>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Media</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {repairs.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.full_name}</TableCell>
                  <TableCell>{r.phone_number}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflowWrap: "break-word" }}>
                    {r.description}
                  </TableCell>
                  <TableCell>
                    {r.media ? (
                      r.media.endsWith(".mp4") ? (
                        <video width={150} controls>
                          <source
                            src={
                              r.media.startsWith("http")
                                ? r.media
                                : `http://localhost:8000${r.media}`
                            }
                          />
                        </video>
                      ) : (
                        <img
                          src={
                            r.media.startsWith("http")
                              ? r.media
                              : `http://localhost:8000${r.media}`
                          }
                          alt="media"
                          width={100}
                        />
                      )
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Typography
                      color={r.is_resolved ? "green" : "red"}
                      sx={{ fontWeight: 700 }}
                    >
                      {r.is_resolved ? "Resolved" : "Pending"}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {!r.is_resolved && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => markResolved(r.id)}
                        startIcon={<CheckCircleIcon />}
                      >
                        Mark Resolved
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      color="success"
                      size="small"
                      startIcon={<WhatsAppIcon />}
                      onClick={() => chatWhatsApp(r.full_name, r.phone_number)}
                    >
                      Chat on WhatsApp
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
