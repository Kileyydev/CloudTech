"use client";

import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Button, Card, CardContent, CircularProgress, Chip, Snackbar, Alert, Tooltip
} from "@mui/material";
import { Done, Close, Delete } from "@mui/icons-material";

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

const API_BASE = "http://localhost:8000/api/testimonials/";

export default function TestimonialsAdminPage() {
  const [items, setItems] = useState<TestimonialT[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [snack, setSnack] = useState<{open:boolean; msg:string; severity:"success"|"error"}>({open:false,msg:"",severity:"success"});

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
      // handle paginated or direct list
      const list = Array.isArray(data) ? data : (data.results && Array.isArray(data.results) ? data.results : []);
      setItems(list);
    } catch (err:any) {
      console.error(err);
      setSnack({open:true,msg:err.message || "Error",severity:"error"});
    } finally { setLoading(false); }
  };

  const toggleApprove = async (id:number, approve:boolean) => {
    setSavingId(id);
    try {
      const res = await fetch(`${API_BASE}${id}/`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ is_approved: approve }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setSnack({open:true,msg:"Updated",severity:"success"});
      fetchList();
    } catch (err:any) {
      console.error(err);
      setSnack({open:true,msg:err.message || "Error",severity:"error"});
    } finally { setSavingId(null); }
  };

  const handleDelete = async (id:number) => {
    if (!confirm("Delete testimonial?")) return;
    try {
      const res = await fetch(`${API_BASE}${id}/`, { method:"DELETE", headers });
      if (!res.ok) throw new Error("Failed to delete");
      setSnack({open:true,msg:"Deleted",severity:"success"});
      fetchList();
    } catch (err:any) {
      setSnack({open:true,msg:err.message||"Error",severity:"error"});
    }
  };

  return (
    <Box sx={{ p:4 }}>
      <Card>
        <CardContent>
          {loading ? <CircularProgress /> : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map(item=>(
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.product}</TableCell>
                    <TableCell>{item.rating}/5</TableCell>
                    <TableCell style={{maxWidth:360, whiteSpace:"pre-wrap"}}>{item.experience}</TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip label={item.is_approved ? "Approved" : "Pending"} color={item.is_approved ? "success" : "warning"} size="small" />
                    </TableCell>
                    <TableCell>
                      {item.is_approved ? (
                        <Tooltip title="Disapprove">
                          <IconButton onClick={()=>toggleApprove(item.id, false)} disabled={savingId===item.id}><Close/></IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Approve">
                          <IconButton onClick={()=>toggleApprove(item.id, true)} disabled={savingId===item.id}><Done/></IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete"><IconButton color="error" onClick={()=>handleDelete(item.id)}><Delete/></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={()=>setSnack(s=>({...s,open:false}))}>
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
