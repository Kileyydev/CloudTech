"use client";

import { useState, useEffect, useRef } from "react";
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
  Snackbar,
  Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

// Unified media type — supports string, { url }, { image: { url } }
type MediaImage = { image?: { url: string } } | { url: string } | string;

type RepairT = {
  id: number;
  full_name: string;
  phone_number: string;
  description: string;
  media?: MediaImage;
  created_at: string;
  is_resolved: boolean;
};

const CACHE_KEY = "repairs_cache_v3";
const CACHE_DURATION = 1000 * 60 * 5; // 5 mins
const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE}/repairs/`;

export default function AdminRepairsPage() {
  const [repairs, setRepairs] = useState<RepairT[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const mounted = useRef(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;

  const showSnackbar = (message: string, severity: "success" | "error" = "success") =>
    setSnackbar({ open: true, message, severity });

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  // FETCH REPAIRS
  const fetchRepairs = async () => {
    setLoading(true);
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setRepairs(data);
          setLoading(false);
          return;
        }
      }

      const res = await fetch(API_BASE, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to fetch repair requests");

      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];
      setRepairs(list);

      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: list, timestamp: Date.now() }));
    } catch (err: any) {
      console.error("Fetch failed:", err);
      showSnackbar(err.message || "Failed to load repairs", "error");
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
    return () => { mounted.current = false; };
  }, []);

  // MARK RESOLVED
  const markResolved = async (id: number) => {
    setRepairs((prev) => prev.map((r) => (r.id === id ? { ...r, is_resolved: true } : r)));

    try {
      const res = await fetch(`${API_BASE}${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_resolved: true }),
      });
      if (!res.ok) throw new Error("Failed to update");
      showSnackbar("Marked as resolved", "success");
    } catch (err: any) {
      showSnackbar(err.message || "Update failed", "error");
      setRepairs((prev) => prev.map((r) => (r.id === id ? { ...r, is_resolved: false } : r)));
    }
  };

  // WHATSAPP CHAT
  const chatWhatsApp = (name: string, phone: string) => {
    const message = `Hi ${name}, this is CloudTech Support. Regarding your repair request, please reply.`;
    const cleanPhone = phone.replace(/^\+?0/, "254");
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // EXACT SAME LOGIC AS AUDIO SECTION
  const getMediaUrl = (media: MediaImage | undefined): string => {
    if (!media) return "/images/fallback-repair.jpg";

    let url = "";
    if (typeof media === "string") url = media;
    else if ("url" in media) url = media.url;
    else if ("image" in media && media.image) return getMediaUrl(media.image);
    else return "/images/fallback-repair.jpg";

    // Clean leading slashes to avoid double //
    const cleanPath = url.replace(/^\/+/, "");
    return url.startsWith("http") ? url : `${process.env.NEXT_PUBLIC_MEDIA_BASE}${cleanPath}`;
  };

  const isVideo = (media: MediaImage | undefined): boolean => {
    if (!media) return false;
    const url = getMediaUrl(media);
    return /\.(mp4|webm|ogg)$/i.test(url);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f9f9fb", minHeight: "100vh" }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 800, color: "#1a1a1a" }}>
        Repair Requests
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={50} thickness={4.5} />
        </Box>
      ) : repairs.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: "center", bgcolor: "#fff", borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary">
            No repair requests yet.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                <TableCell sx={{ fontWeight: 700, color: "#333" }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Issue</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Media</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Submitted</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {repairs.map((r) => (
                <TableRow
                  key={r.id}
                  hover
                  sx={{
                    bgcolor: r.is_resolved ? "#f0fdf4" : "#fff",
                    "&:hover": { bgcolor: "#f5f5f5" },
                  }}
                >
                  <TableCell>#{r.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{r.full_name}</TableCell>
                  <TableCell>{r.phone_number}</TableCell>
                  <TableCell sx={{ maxWidth: 240, lineHeight: 1.5 }}>
                    {r.description}
                  </TableCell>

                  {/* MEDIA CELL — FULLY UPGRADED */}
                  <TableCell>
                    {r.media ? (
                      isVideo(r.media) ? (
                        <Box
                          sx={{
                            width: 180,
                            height: 120,
                            borderRadius: 2,
                            overflow: "hidden",
                            border: "1px solid #e0e0e0",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                          }}
                        >
                          <video
                            width="100%"
                            height="100%"
                            controls
                            style={{ objectFit: "cover" }}
                            poster="/images/video-placeholder.jpg"
                          >
                            <source src={getMediaUrl(r.media)} type="video/mp4" />
                            <Typography variant="caption" color="error">
                              Video failed
                            </Typography>
                          </video>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            width: 100,
                            height: 100,
                            borderRadius: 2,
                            overflow: "hidden",
                            border: "1px solid #e0e0e0",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                          }}
                        >
                          <img
                            src={getMediaUrl(r.media)}
                            alt="Repair photo"
                            loading="lazy"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              e.currentTarget.src = "/images/fallback-repair.jpg";
                            }}
                          />
                        </Box>
                      )
                    ) : (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        No media
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    {new Date(r.created_at).toLocaleString("en-KE", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </TableCell>

                  <TableCell>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        color: r.is_resolved ? "success.main" : "error.main",
                      }}
                    >
                      {r.is_resolved ? "Resolved" : "Pending"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {!r.is_resolved && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => markResolved(r.id)}
                          sx={{ textTransform: "none", fontWeight: 600 }}
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
                        sx={{ textTransform: "none", fontWeight: 600 }}
                      >
                        Chat on WhatsApp
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            fontWeight: 600,
            borderRadius: 2,
            ...(snackbar.severity === "success" && { bgcolor: "#4caf50", color: "#fff" }),
            ...(snackbar.severity === "error" && { bgcolor: "#f44336", color: "#fff" }),
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}