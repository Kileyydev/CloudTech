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

const UsersSection: React.FC = () => {
  const [users, setUsers] = useState<UserT[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserT | null>(null);
  const [fullNameInput, setFullNameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isStaffInput, setIsStaffInput] = useState(false);
  const [isSuperuserInput, setIsSuperuserInput] = useState(false);
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const API_BASE = "http://localhost:8000/api/auth";

  // Get token from localStorage
  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access");
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    const token = getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    setUsersLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/`, {
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
        setUsers([]);
        setUsersLoading(false);
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) setUsers(data);
      else if (data.results && Array.isArray(data.results)) setUsers(data.results);
      else {
        console.warn("Unexpected users response format", data);
        setUsers([]);
      }
    } catch (err) {
      console.error("Error fetching users", err);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const openEditDialog = (user: UserT) => {
    setSelectedUser(user);
    setFullNameInput(user.full_name ?? user.name ?? "");
    setPasswordInput("");
    setIsStaffInput(Boolean(user.is_staff));
    setIsSuperuserInput(Boolean(user.is_superuser));
    setOpenEdit(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    const token = getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }
    setSaving(true);

    const payload: any = {
      full_name: fullNameInput,
      name: fullNameInput,
      is_staff: isStaffInput,
      is_superuser: isSuperuserInput,
    };
    if (passwordInput.trim().length > 0) payload.password = passwordInput;

    try {
      const res = await fetch(`${API_BASE}/users/${selectedUser.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchUsers();
        setOpenEdit(false);
        setSelectedUser(null);
      } else {
        const errText = await res.text();
        console.error("Failed to update user:", res.status, errText);
        alert("Failed to update user. Check console for details.");
      }
    } catch (err) {
      console.error("Error updating user", err);
      alert("Error updating user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Button
          variant="contained"
          onClick={fetchUsers}
          sx={{ backgroundColor: "#DC1A8A", "&:hover": { backgroundColor: "#B00053" } }}
        >
          Refresh
        </Button>
      </Box>

      <Box sx={{ backgroundColor: "#F9FAFB", p: 2, borderRadius: 2 }}>
        {usersLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#DC1A8A",
                  "& .MuiTableCell-root": { color: "#FFFFFF", fontWeight: "bold" },
                }}
              >
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Is Admin</TableCell>
                <TableCell>Is Superuser</TableCell>
                <TableCell>Modify</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", p: 4 }}>
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id} sx={{ "&:hover": { backgroundColor: "#F5F5F5" } }}>
                    <TableCell>{u.full_name ?? u.name ?? "-"}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Checkbox checked={Boolean(u.is_staff)} disabled />
                    </TableCell>
                    <TableCell>
                      <Checkbox checked={Boolean(u.is_superuser)} disabled />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Modify user">
                        <Button
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => openEditDialog(u)}
                        >
                          Modify
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Box>

      {/* Edit dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Modify User</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Full name"
            value={fullNameInput}
            onChange={(e) => setFullNameInput(e.target.value)}
          />
          <TextField
            label="New password (leave empty to keep current)"
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
          <Box sx={{ display: "flex", gap: 4, alignItems: "center", mt: 1 }}>
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
            onClick={handleSaveUser}
            variant="contained"
            disabled={saving}
            sx={{ backgroundColor: "#DC1A8A", "&:hover": { backgroundColor: "#B00053" } }}
          >
            {saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersSection;
