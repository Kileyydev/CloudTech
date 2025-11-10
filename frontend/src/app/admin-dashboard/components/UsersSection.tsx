// src/app/admin/users/page.tsx
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
  Tabs,
  Tab,
  InputAdornment,
  alpha,
  styled,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
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
  border: "1px solid #ddd",
  boxShadow: "none",
  background: "#fff",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 700,
  px: 3,
  py: 1.2,
  bgcolor: "#000",
  color: "#fff",
  "&:hover": { bgcolor: "#333" },
  "&.delete": {
    bgcolor: "#d32f2f",
    "&:hover": { bgcolor: "#b71c1c" },
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

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "superuser" | "regular">("all");

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

  // === FILTERED USERS ===
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.full_name ?? u.name ?? "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "admin" && u.is_staff) ||
      (roleFilter === "superuser" && u.is_superuser) ||
      (roleFilter === "regular" && !u.is_staff && !u.is_superuser);

    return matchesSearch && matchesRole;
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

      {/* Search + Role Tabs (Same Level) */}
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search by email or name..."
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
            value={roleFilter}
            onChange={(_, v) => setRoleFilter(v)}
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
            <Tab label="Admin" value="admin" />
            <Tab label="Superuser" value="superuser" />
            <Tab label="Regular" value="regular" />
          </Tabs>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 2 }}>
          <StyledButton
            startIcon={<AddIcon />}
            onClick={() => setOpenAdd(true)}
            size="small"
          >
            Add User
          </StyledButton>
          <StyledButton
            onClick={fetchUsers}
            disabled={loading}
            size="small"
          >
            {loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Refresh"}
          </StyledButton>
        </Box>

        {/* Table */}
        <StyledPaper>
          <Box sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ py: 10, textAlign: "center" }}>
                <CircularProgress size={40} sx={{ color: "#000" }} />
              </Box>
            ) : filteredUsers.length === 0 ? (
              <Typography sx={{ py: 10, textAlign: "center", color: "#999" }}>
                {searchQuery || roleFilter !== "all"
                  ? "No users match your filters."
                  : "No users found"}
              </Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#000" }}>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Full Name</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Admin</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Superuser</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell sx={{ fontWeight: 600, color: "#000" }}>
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
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => openEditDialog(u)}
                              sx={{ color: "#000" }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => confirmDelete(u)}
                              sx={{ color: "#d32f2f" }}
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
      </Box>

      {/* === ADD USER DIALOG === */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700, color: "#000" }}>Add New User</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Email *"
            type="email"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            fullWidth
            size="small"
            sx={{ "& .MuiInputLabel-root": { color: "#000" } }}
          />
          <TextField
            label="Full Name"
            value={addFullName}
            onChange={(e) => setAddFullName(e.target.value)}
            fullWidth
            size="small"
            sx={{ "& .MuiInputLabel-root": { color: "#000" } }}
          />
          <TextField
            label="Password *"
            type="password"
            value={addPassword}
            onChange={(e) => setAddPassword(e.target.value)}
            fullWidth
            size="small"
            sx={{ "& .MuiInputLabel-root": { color: "#000" } }}
          />
          <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox checked={addIsStaff} onChange={(e) => setAddIsStaff(e.target.checked)} />
              <Typography sx={{ color: "#000" }}>Is Admin</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox checked={addIsSuperuser} onChange={(e) => setAddIsSuperuser(e.target.checked)} />
              <Typography sx={{ color: "#000" }}>Is Superuser</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setOpenAdd(false)} disabled={saving} sx={{ color: "#000" }}>
            Cancel
          </Button>
          <StyledButton onClick={handleAddUser} disabled={saving}>
            {saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Create"}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* === EDIT DIALOG === */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700, color: "#000" }}>Edit User</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Full Name"
            value={fullNameInput}
            onChange={(e) => setFullNameInput(e.target.value)}
            fullWidth
            size="small"
            sx={{ "& .MuiInputLabel-root": { color: "#000" } }}
          />
          <TextField
            label="New Password (leave blank to keep)"
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            fullWidth
            size="small"
            sx={{ "& .MuiInputLabel-root": { color: "#000" } }}
          />
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox checked={isStaffInput} onChange={(e) => setIsStaffInput(e.target.checked)} />
              <Typography sx={{ color: "#000" }}>Is Admin</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox checked={isSuperuserInput} onChange={(e) => setIsSuperuserInput(e.target.checked)} />
              <Typography sx={{ color: "#000" }}>Is Superuser</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setOpenEdit(false)} disabled={saving} sx={{ color: "#000" }}>
            Cancel
          </Button>
          <StyledButton onClick={handleSaveUser} disabled={saving}>
            {saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Save"}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* === DELETE CONFIRM DIALOG === */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle sx={{ fontWeight: 700, color: "#000" }}>Delete User?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#000" }}>
            Are you sure you want to delete <strong>{selectedUser?.email}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setOpenDelete(false)} sx={{ color: "#000" }}>
            Cancel
          </Button>
          <StyledButton className="delete" onClick={handleDelete} disabled={deletingId !== null}>
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
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{
            fontWeight: 600,
            width: "100%",
            bgcolor: snack.sev === "success" ? "#4caf50" : "#f44336",
            color: "#fff",
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersSection;