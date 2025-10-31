"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Chip,
  Avatar,
  Stack,
  LinearProgress,
  useTheme,
  useMediaQuery,
  alpha,
  styled,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
} from "@mui/material";
import {
  Inventory,
  Build,
  ShoppingCart,
  Star,
  TrendingUp,
  Warning,
  CheckCircle,
  Notifications,
  ArrowForward,
} from "@mui/icons-material";

// Use Build as a wrench icon substitute
const Wrench = Build;
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_BASE = "http://localhost:8000/api";

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("access") : null;

// === STYLED COMPONENTS ===
const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: 0,
  overflow: "hidden",
  background: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  transition: "all 0.3s ease",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
}));

const PriorityChip = styled(Chip)(({ theme }) => ({
  fontWeight: 700,
  fontSize: "0.75rem",
  height: 24,
  borderRadius: 0,
}));

const SectionCard = styled(Card)(({ theme }) => ({
  borderRadius: 0,
  p: 3,
  background: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  border: `1px solid ${alpha("#DC1A8A", 0.1)}`,
}));

const NotificationList = styled(List)(({ theme }) => ({
  "& .MuiListItem-root": {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    "&:last-child": { borderBottom: "none" },
  },
}));

// === MAIN COMPONENT ===
const AdminDashboardPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRepairs: 0,
    pendingRepairs: 0,
    totalTestimonials: 0,
    pendingTestimonials: 0,
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [productTrend, setProductTrend] = useState<any[]>([]);
  const [repairStatus, setRepairStatus] = useState<any[]>([]);
  const [pendingRepairs, setPendingRepairs] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      // Fetch products (EXACTLY LIKE BEFORE – no changes)
      const productRes = await fetch(`${API_BASE}/products/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const productData = await productRes.json();
      const products = Array.isArray(productData) ? productData : productData.results || [];

      // Fetch orders
      const orderRes = await fetch(`${API_BASE}/orders/`, { headers: { Authorization: `Bearer ${token}` } });
      const orderData = await orderRes.json();
      const orders = Array.isArray(orderData) ? orderData : orderData.results || [];

      // Fetch repairs (for notifications + stats)
      const repairRes = await fetch(`${API_BASE}/repairs/`, { headers: { Authorization: `Bearer ${token}` } });
      const repairData = await repairRes.json();
      const repairs = Array.isArray(repairData) ? repairData : repairData.results || [];

      // Fetch testimonials
      const testimonialRes = await fetch(`${API_BASE}/testimonials/`, { headers: { Authorization: `Bearer ${token}` } });
      const testimonialData = await testimonialRes.json();
      const testimonials = Array.isArray(testimonialData) ? testimonialData : testimonialData.results || [];

      // Stats (from real data)
      setStats({
        totalProducts: products.length,
        lowStock: products.filter((p: any) => p.stock < 10).length,
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: any) => o.status === "pending").length,
        totalRepairs: repairs.length,
        pendingRepairs: repairs.filter((r: any) => r.status === "pending").length,
        totalTestimonials: testimonials.length,
        pendingTestimonials: testimonials.filter((t: any) => !t.is_approved).length,
      });

      // Recent Activity (from real data)
      const activity = [
        ...products.slice(0, 3).map((p: any) => ({ type: "product", title: p.title, time: p.created_at || new Date().toISOString() })),
        ...orders.slice(0, 2).map((o: any) => ({ type: "order", title: `Order #${o.id}`, time: o.created_at || new Date().toISOString() })),
        ...repairs.slice(0, 2).map((r: any) => ({ type: "repair", title: `Repair #${r.id}`, time: r.created_at || new Date().toISOString() })),
      ]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 6);

      setRecentActivity(activity);

      // Product Trend (built from your real products data – group by month)
      const monthlyProducts = products.reduce((acc: any, p: any) => {
        const month = new Date(p.created_at || new Date()).toLocaleString('en', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});
      setProductTrend(
        Object.keys(monthlyProducts).map(month => ({ month, added: monthlyProducts[month] }))
      );

      // Repair Status (from real data)
      const statusCount = repairs.reduce((acc: any, r: any) => {
        const status = r.status || "pending";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      setRepairStatus(Object.entries(statusCount).map(([name, value]) => ({ name, value })));

      // Pending Repairs for Notifications
      setPendingRepairs(repairs.filter((r: any) => r.status === "pending").slice(0, 5));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f8f9fa" }}>
        <CircularProgress size={60} thickness={5} sx={{ color: "#DC1A8A" }} />
      </Box>
    );
  }

  const COLORS = ["#DC1A8A", "#B31774", "#9a165c", "#e91e63"];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 800, color: "#111", textAlign: { xs: "center", md: "left" } }}>
        Admin Dashboard
      </Typography>

      {/* TOP STATS */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mb: 5 }}>
        {[
          {
            title: "Total Products",
            value: stats.totalProducts,
            icon: <Inventory sx={{ fontSize: 32, color: "#DC1A8A" }} />,
            trend: "+12%",
          },
          {
            title: "Pending Orders",
            value: stats.pendingOrders,
            icon: <ShoppingCart sx={{ fontSize: 32, color: "#e91e63" }} />,
            chip: stats.pendingOrders > 0 ? "warning" : "success",
          },
          {
            title: "Pending Repairs",
            value: stats.pendingRepairs,
            icon: <Wrench sx={{ fontSize: 32, color: "#B31774" }} />,
            chip: stats.pendingRepairs > 0 ? "error" : "success",
          },
          {
            title: "Pending Testimonials",
            value: stats.pendingTestimonials,
            icon: <Star sx={{ fontSize: 32, color: "#9a165c" }} />,
            chip: "info",
          },
        ].map((stat, i) => (
          <StatCard key={i} sx={{ flex: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography sx={{ fontSize: "0.9rem", color: "#666", fontWeight: 600 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: "#111", mt: 1 }}>
                    {stat.value}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1, gap: 1 }}>
                    <TrendingUp sx={{ fontSize: 16, color: "#4caf50" }} />
                    <Typography sx={{ fontSize: "0.8rem", color: "#666" }}>
                      {stat.trend || (stat.chip === "success" ? "On Track" : "Needs Review")}
                    </Typography>
                  </Box>
                </Box>
                {stat.icon}
              </Box>
              {stat.chip && (
                <PriorityChip
                  label={stat.chip === "warning" ? "Attention" : stat.chip === "error" ? "Urgent" : "Pending"}
                  color={stat.chip === "success" ? "success" : stat.chip === "error" ? "error" : "secondary"}
                  size="small"
                  sx={{ mt: 2 }}
                />
              )}
            </CardContent>
          </StatCard>
        ))}
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={4}>
        <Box sx={{ flex: 2 }}>
          {/* Product Trend Chart (built from real data) */}
          <SectionCard sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: "#222" }}>
              Product Additions (Last 6 Months)
            </Typography>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={productTrend}>
                <CartesianGrid strokeDasharray="4 4" stroke="#eee" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 0, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
                <Line type="monotone" dataKey="added" stroke="#DC1A8A" strokeWidth={3} dot={{ fill: "#DC1A8A", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </SectionCard>

          {/* Low Stock Alert */}
          {stats.lowStock > 0 && (
            <SectionCard sx={{ mb: 4, borderLeft: "4px solid #ff9800" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Warning sx={{ color: "#ff9800" }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Low Stock Alert
                </Typography>
              </Box>
              <Typography sx={{ color: "#666", mb: 2 }}>
                {stats.lowStock} products need restocking
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(stats.lowStock / stats.totalProducts) * 100}
                sx={{
                  height: 8,
                  borderRadius: 0,
                  bgcolor: "#ffe0b2",
                  "& .MuiLinearProgress-bar": { bgcolor: "#ff9800" },
                }}
              />
            </SectionCard>
          )}
        </Box>

        <Box sx={{ flex: 1 }}>
          {/* Recent Activity */}
          <SectionCard sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: "#222" }}>
              Recent Activity
            </Typography>
            <Stack spacing={2}>
              {recentActivity.length === 0 ? (
                <Typography color="text.secondary">No recent activity</Typography>
              ) : (
                recentActivity.map((act, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                    <Avatar
                      sx={{
                        bgcolor:
                          act.type === "product"
                            ? "#DC1A8A"
                            : act.type === "order"
                            ? "#e91e63"
                            : "#B31774",
                        width: 36,
                        height: 36,
                      }}
                    >
                      {act.type === "product" ? <Inventory fontSize="small" /> : act.type === "order" ? <ShoppingCart fontSize="small" /> : <Wrench fontSize="small" />}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                        {act.title || act.customer_name || act.device || "New Item"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {act.type.charAt(0).toUpperCase() + act.type.slice(1)} · {new Date(act.time).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Stack>
          </SectionCard>

          {/* Repair Notifications */}
          <SectionCard>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#222" }}>
                Repair Notifications
              </Typography>
              <Badge badgeContent={pendingRepairs.length} color="error" sx={{ "& .MuiBadge-badge": { fontSize: "0.7rem" } }}>
                <Notifications sx={{ color: "#B31774" }} />
              </Badge>
            </Box>
            <NotificationList>
              {pendingRepairs.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No pending repairs" secondary="All repairs completed" />
                </ListItem>
              ) : (
                pendingRepairs.map((repair, i) => (
                  <ListItem key={i}>
                    <ListItemIcon>
                      <Wrench sx={{ color: "#B31774" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Repair #${repair.id}`}
                      secondary={`Device: ${repair.device || "Unknown"} · Status: Pending`}
                    />
                    <Button size="small" endIcon={<ArrowForward />} onClick={() => window.location.href = `/admin/repairs/${repair.id}`}>
                      View
                    </Button>
                  </ListItem>
                ))
              )}
            </NotificationList>
          </SectionCard>
        </Box>
      </Stack>
    </Box>
  );
};

export default AdminDashboardPage;