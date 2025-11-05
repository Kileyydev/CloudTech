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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useRouter } from "next/navigation";

type UserT = {
  id: number;
  email: string;
  full_name?: string | null;
  name?: string | null;
  is_staff?: boolean;
  is_superuser?: boolean;
};

const API_USERS = process.env.NEXT_PUBLIC_API_BASE + "/auth/users/";

const UsersSection: React.FC = () => {
  const router = useRouter();

  const [users, setUsers] = useState<UserT[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: "success" | "error" }>({
    open: false,
    msg: "",
    sev: "success",
  });

  // Edit dialog states
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserT | null>(null);
  const [fullNameInput, setFullNameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isStaffInput, setIsStaffInput] = useState(false);
  const [isSuperuserInput, setIsSuperuserInput] = useState(false);

  // === TOKEN HANDLER ===
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

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to fetch users:", res.status, text);
        setSnack({ open: true, msg: "Failed to load users", sev: "error" });
        setUsers([]);
        return;
      }

      const data = await res.json();
      const usersList = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
        ? data.results
        : [];

      setUsers(usersList);
    } catch (err) {
      console.error("Error fetching users:", err);
      setSnack({ open: true, msg: "Network error while fetching users", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // === EDIT HANDLERS ===
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
        setSnack({ open: true, msg: "User updated successfully", sev: "success" });
        fetchUsers();
        setOpenEdit(false);
      } else {
        const text = await res.text();
        console.error("Update failed:", res.status, text);
        setSnack({ open: true, msg: "Failed to update user", sev: "error" });
      }
    } catch (err) {
      console.error("Error updating user:", err);
      setSnack({ open: true, msg: "Network error while updating user", sev: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Users
        </Typography>
        <Button
          variant="contained"
          onClick={fetchUsers}
          sx={{ backgroundColor: "#DC1A8A", "&:hover": { backgroundColor: "#B00053" } }}
        >
          Refresh
        </Button>
      </Box>

      {/* TABLE */}
      <Box sx={{ backgroundColor: "#fff", borderRadius: 2, boxShadow: 1, p: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress sx={{ color: "#DC1A8A" }} />
          </Box>
        ) : users.length === 0 ? (
          <Typography textAlign="center" py={4}>
            No users found
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#DC1A8A",
                  "& .MuiTableCell-root": { color: "#fff", fontWeight: "bold" },
                }}
              >
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>Superuser</TableCell>
                <TableCell>Modify</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.full_name ?? u.name ?? "-"}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Checkbox checked={Boolean(u.is_staff)} disabled />
                  </TableCell>
                  <TableCell>
                    <Checkbox checked={Boolean(u.is_superuser)} disabled />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit user">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => openEditDialog(u)}
                      >
                        Edit
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>

      {/* === EDIT DIALOG === */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Full Name"
            value={fullNameInput}
            onChange={(e) => setFullNameInput(e.target.value)}
          />
          <TextField
            label="New Password (optional)"
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox
                checked={isStaffInput}
                onChange={(e) => setIsStaffInput(e.target.checked)}
              />
              <Typography>Is Admin</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox
                checked={isSuperuserInput}
                onChange={(e) => setIsSuperuserInput(e.target.checked)}
              />
              <Typography>Is Superuser</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveUser}
            disabled={saving}
            sx={{ backgroundColor: "#DC1A8A", "&:hover": { backgroundColor: "#B00053" } }}
          >
            {saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snack.sev}
          sx={{ width: "100%" }}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersSection;
