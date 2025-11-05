"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Snackbar,
  Alert,
  IconButton,
  Paper,
  alpha,
  styled,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";

type UserT = {
  id: number;
  email: string;
  full_name?: string | null;
  name?: string | null;
  is_staff?: boolean;
  is_superuser?: boolean;
};

// === STYLED COMPONENTS ===
const StyledPaper = styled(Paper)(({ theme }) => ({
  overflow: "hidden",
  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
  background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
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
    "&:hover": { background: "linear-gradient(135deg, #B00053, #90004D)" },
  },
}));

const API_BASE = process.env.NEXT_PUBLIC_API_BASE + "/accounts";
const API_USERS = `${API_BASE}/users/`;
const API_REGISTER = `${API_BASE}/register/`;

const UsersSection: React.FC = () => {
  const router = useRouter();
  const [users, setUsers] = useState<UserT[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    sev: "success" | "error";
  }>({
    open: false,
    msg: "",
    sev: "success",
  });

  // === DIALOG STATES ===
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserT | null>(null);

  // Edit Form
  const [fullNameInput, setFullNameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isStaffInput, setIsStaffInput] = useState(false);
  const [isSuperuserInput, setIsSuperuserInput] = useState(false);

  // Add Form
  const [addEmail, setAddEmail] = useState("");
  const [addFullName, setAddFullName] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addIsStaff, setAddIsStaff] = useState(false);
  const [addIsSuperuser, setAddIsSuperuser] = useState(false);

  // === TOKEN ===
  const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;

  // === FETCH USERS ===
  const fetchUsers = async () => {
    if (!token) {
      router.push("/admin/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_USERS, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        router.push("/admin/login");
        return;
      }

      if (!res.ok) throw new Error(`Failed: ${res.status}`);

      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];
      setUsers(list);
    } catch (err) {
      console.error("Fetch error:", err);
      setSnack({ open: true, msg: "Failed to load users", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // === CREATE USER ===
  const handleAddUser = async () => {
    if (!token || !addEmail || !addPassword) {
      setSnack({ open: true, msg: "Email and password required", sev: "error" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(API_REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: addEmail,
          full_name: addFullName,
          password: addPassword,
          is_staff: addIsStaff,
          is_superuser: addIsSuperuser,
        }),
      });

      if (res.ok) {
        setSnack({ open: true, msg: "User created!", sev: "success" });
        resetAddForm();
        setOpenAdd(false);
        fetchUsers();
      } else {
        const err = await res.json();
        setSnack({ open: true, msg: err.detail || "Failed to create user", sev: "error" });
      }
    } catch (err) {
      setSnack({ open: true, msg: "Network error", sev: "error" });
    } finally {
      setSaving(false);
    }
  };

  const resetAddForm = () => {
    setAddEmail("");
    setAddFullName("");
    setAddPassword("");
    setAddIsStaff(false);
    setAddIsSuperuser(false);
  };

  // === UPDATE USER ===
  const openEditDialog = (user: UserT) => {
    setSelectedUser(user);
    setFullNameInput(user.full_name ?? user.name ?? "");
    setPasswordInput("");
    setIsStaffInput(Boolean(user.is_staff));
    setIsSuperuserInput(Boolean(user.is_superuser));
    setOpenEdit(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser || !token) return;

    setSaving(true);
    const payload: any = {
      full_name: fullNameInput,
      name: fullNameInput,
      is_staff: isStaffInput,
      is_superuser: isSuperuserInput,
    };
    if (passwordInput.trim()) payload.password = passwordInput;

    try {
      const res = await fetch(`${API_USERS}${selectedUser.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSnack({ open: true, msg: "User updated!", sev: "success" });
        fetchUsers();
        setOpenEdit(false);
      } else {
        const err = await res.text();
        setSnack({ open: true, msg: "Update failed", sev: "error" });
      }
    } catch (err) {
      setSnack({ open: true, msg: "Network error", sev: "error" });
    } finally {
      setSaving(false);
    }
  };

  // === DELETE USER ===
  const confirmDelete = (user: UserT) => {
    setSelectedUser(user);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    if (!selectedUser || !token) return;

    setDeletingId(selectedUser.id);
    try {
      const res = await fetch(`${API_USERS}${selectedUser.id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok || res.status === 204) {
        setSnack({ open: true, msg: "User deleted!", sev: "success" });
        fetchUsers();
        setOpenDelete(false);
        setSelectedUser(null);
      } else {
        setSnack({ open: true, msg: "Delete failed", sev: "error" });
      }
    } catch (err) {
      setSnack({ open: true, msg: "Network error", sev: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#222" }}>
          Manage Users
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <StyledButton
            className="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenAdd(true)}
          >
            Add User
          </StyledButton>
          <StyledButton
            className="primary"
            onClick={fetchUsers}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Refresh"}
          </StyledButton>
        </Box>
      </Box>

      {/* TABLE */}
      <StyledPaper elevation={0}>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={60} thickness={5} sx={{ color: "#DC1A8A" }} />
            </Box>
          ) : users.length === 0 ? (
            <Typography textAlign="center" color="text.secondary" py={8}>
              No users found
            </Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background: "linear-gradient(135deg, #DC1A8A, #B31774)",
                    "& .MuiTableCell-root": { color: "#fff", fontWeight: "bold" },
                  }}
                >
                  <TableCell>Full Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Admin</TableCell>
                  <TableCell>Superuser</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} hover sx={{ "&:hover": { bgcolor: alpha("#DC1A8A", 0.05) } }}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {u.full_name ?? u.name ?? "—"}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Checkbox checked={Boolean(u.is_staff)} disabled />
                    </TableCell>
                    <TableCell>
                      <Checkbox checked={Boolean(u.is_superuser)} disabled />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(u)}
                            sx={{ color: "#DC1A8A" }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => confirmDelete(u)}
                            sx={{ color: "#f44336" }}
                            disabled={deletingId === u.id}
                          >
                            {deletingId === u.id ? (
                              <CircularProgress size={16} />
                            ) : (
                              <DeleteIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </StyledPaper>

      {/* === ADD USER DIALOG === */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Add New User</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Email *"
            type="email"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            fullWidth
          />
          <TextField
            label="Full Name"
            value={addFullName}
            onChange={(e) => setAddFullName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Password *"
            type="password"
            value={addPassword}
            onChange={(e) => setAddPassword(e.target.value)}
            fullWidth
          />
          <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox checked={addIsStaff} onChange={(e) => setAddIsStaff(e.target.checked)} />
              <Typography>Is Admin</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox checked={addIsSuperuser} onChange={(e) => setAddIsSuperuser(e.target.checked)} />
              <Typography>Is Superuser</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setOpenAdd(false)} disabled={saving}>
            Cancel
          </Button>
          <StyledButton className="primary" onClick={handleAddUser} disabled={saving}>
            {saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Create"}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* === EDIT DIALOG === */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Edit User</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Full Name"
            value={fullNameInput}
            onChange={(e) => setFullNameInput(e.target.value)}
            fullWidth
          />
          <TextField
            label="New Password (leave blank to keep)"
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            fullWidth
          />
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox checked={isStaffInput} onChange={(e) => setIsStaffInput(e.target.checked)} />
              <Typography>Is Admin</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox checked={isSuperuserInput} onChange={(e) => setIsSuperuserInput(e.target.checked)} />
              <Typography>Is Superuser</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setOpenEdit(false)} disabled={saving}>
            Cancel
          </Button>
          <StyledButton className="primary" onClick={handleSaveUser} disabled={saving}>
            {saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Save"}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* === DELETE CONFIRM DIALOG === */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete User?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedUser?.email}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <StyledButton
            className="primary"
            sx={{ bgcolor: "#f44336", "&:hover": { bgcolor: "#d32f2f" } }}
            onClick={handleDelete}
            disabled={deletingId !== null}
          >
            {deletingId ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Delete"}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.sev}
          sx={{
            width: "100%",
            fontWeight: 600,
            ...(snack.sev === "success" && { bgcolor: "#4caf50", color: "#fff" }),
            ...(snack.sev === "error" && { bgcolor: "#f44336", color: "#fff" }),
          }}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersSection;