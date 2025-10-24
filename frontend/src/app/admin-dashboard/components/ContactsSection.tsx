"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
  Button,
  useTheme,
  Chip,
  Fade,
} from "@mui/material";
import { Delete, MarkEmailRead, WhatsApp } from "@mui/icons-material";

const API_ENDPOINT = "http://localhost:8000/api/contact-messages/";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  is_read?: boolean;
  phone?: string;
}

export default function ContactMessagesPage() {
  const theme = useTheme();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
    open: false,
    msg: "",
    severity: "success",
  });

  // ✅ Fetch contact messages safely
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(API_ENDPOINT);
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();

        // Handle different API response shapes
        if (Array.isArray(data)) {
          setMessages(data);
        } else if (data.results && Array.isArray(data.results)) {
          setMessages(data.results);
        } else {
          setMessages([]);
        }
      } catch (err: any) {
        setSnack({ open: true, msg: err.message || "Error fetching messages", severity: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  // ✅ Mark message as read
  const handleMarkRead = async (id: number) => {
    try {
      const res = await fetch(`${API_ENDPOINT}${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, is_read: true } : msg)));
      setSnack({ open: true, msg: "Marked as read ✅", severity: "success" });
    } catch (err: any) {
      setSnack({ open: true, msg: err.message, severity: "error" });
    }
  };

  // ✅ Delete message
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`${API_ENDPOINT}${id}/`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
      setSnack({ open: true, msg: "Message deleted 🗑️", severity: "success" });
    } catch (err: any) {
      setSnack({ open: true, msg: err.message, severity: "error" });
    }
  };

  // ✅ Open WhatsApp chat
  const handleReply = (msg: ContactMessage) => {
    const phone = msg.phone || msg.email; // fallback to email if no phone
    const messageText = encodeURIComponent(`Hi ${msg.name}, regarding your message: "${msg.message}"`);
    const url = msg.phone
      ? `https://wa.me/${msg.phone.replace(/\D/g, "")}?text=${messageText}`
      : `mailto:${msg.email}?subject=Re: ${msg.subject}&body=${messageText}`;
    window.open(url, "_blank");
  };

  return (
    <Fade in timeout={500}>
      <Box sx={{ p: 4, backgroundColor: "#fafafa", minHeight: "100vh" }}>

        <Card sx={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          <CardContent>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress />
              </Box>
            ) : !Array.isArray(messages) || messages.length === 0 ? (
              <Typography variant="body1" align="center" sx={{ py: 4, color: "#666" }}>
                No messages yet 💌
              </Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {messages.map((msg) => (
                    <TableRow
                      key={msg.id}
                      sx={{
                        backgroundColor: msg.is_read ? "#fff" : "#f0f9ff",
                        transition: "0.2s",
                        "&:hover": { backgroundColor: "#f7f7f7" },
                      }}
                    >
                      <TableCell>{msg.name}</TableCell>
                      <TableCell>{msg.email}</TableCell>
                      <TableCell>{msg.subject || "—"}</TableCell>
                      <TableCell sx={{ maxWidth: 280, whiteSpace: "pre-wrap" }}>{msg.message}</TableCell>
                      <TableCell>{new Date(msg.created_at).toLocaleString()}</TableCell>
                      <TableCell align="center">
                        {msg.is_read ? (
                          <Chip label="Read" color="success" size="small" />
                        ) : (
                          <Chip label="Unread" color="warning" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Reply">
                          <IconButton color="success" onClick={() => handleReply(msg)}>
                            <WhatsApp />
                          </IconButton>
                        </Tooltip>

                        {!msg.is_read && (
                          <Tooltip title="Mark as read">
                            <IconButton onClick={() => handleMarkRead(msg.id)} color="primary">
                              <MarkEmailRead />
                            </IconButton>
                          </Tooltip>
                        )}

                        <Tooltip title="Delete message">
                          <IconButton onClick={() => handleDelete(msg.id)} color="error">
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          <Alert severity={snack.severity}>{snack.msg}</Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
}
