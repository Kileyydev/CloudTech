"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
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
  Fade,
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Wrench = Build
const Wrench = Build;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("access") : null;

// ──────────────────────────────────────
// Styled Components – fresh look
// ──────────────────────────────────────
const GlassHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(
    "#DC1A8A",
    0.08
  )} 100%)`,
  backdropFilter: "blur(12px)",
  borderRadius: (typeof theme.shape.borderRadius === "number" ? theme.shape.borderRadius * 2 : theme.shape.borderRadius),
  padding: theme.spacing(4, 3),
  marginBottom: theme.spacing(5),
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
}));

const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: (typeof theme.shape.borderRadius === "number" ? theme.shape.borderRadius * 2 : theme.shape.borderRadius),
  overflow: "hidden",
  background: theme.palette.background.paper,
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.06)}`,
  transition: "transform .25s ease, box-shadow .25s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: `0 12px 30px ${alpha(theme.palette.common.black, 0.12)}`,
  },
}));

const PriorityChip = styled(Chip)(({ theme }) => ({
  fontWeight: 800,
  fontSize: "0.75rem",
  height: 26,
  borderRadius: 8,
}));

const SectionCard = styled(Card)(({ theme }) => ({
  borderRadius: (typeof theme.shape.borderRadius === "number" ? theme.shape.borderRadius * 2 : theme.shape.borderRadius),
  padding: theme.spacing(3),
  background: theme.palette.background.paper,
  boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.04)}`,
  border: `1px solid ${alpha("#DC1A8A", 0.12)}`,
}));

const NotificationList = styled(List)(({ theme }) => ({
  "& .MuiListItem-root": {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    "&:last-child": { borderBottom: "none" },
    transition: "background .2s",
    "&:hover": { background: alpha(theme.palette.action.hover, 0.04) },
  },
}));

// ──────────────────────────────────────
// Main Component
// ──────────────────────────────────────
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

  // ────── Fetch ──────
  const fetchDashboardData = async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const [productRes, orderRes, repairRes, testimonialRes] = await Promise.all([
        fetch(`${API_BASE}/products/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/orders/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/repairs/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/testimonials/`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [productData, orderData, repairData, testimonialData] = await Promise.all([
        productRes.json(),
        orderRes.json(),
        repairRes.json(),
        testimonialRes.json(),
      ]);

      const products = Array.isArray(productData) ? productData : productData.results || [];
      const orders = Array.isArray(orderData) ? orderData : orderData.results || [];
      const repairs = Array.isArray(repairData) ? repairData : repairData.results || [];
      const testimonials = Array.isArray(testimonialData)
        ? testimonialData
        : testimonialData.results || [];

      // Stats
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

      // Recent Activity
      const activity = [
        ...products.slice(0, 3).map((p: any) => ({
          type: "product",
          title: p.title,
          time: p.created_at || new Date().toISOString(),
        })),
        ...orders.slice(0, 2).map((o: any) => ({
          type: "order",
          title: `Order #${o.id}`,
          time: o.created_at || new Date().toISOString(),
        })),
        ...repairs.slice(0, 2).map((r: any) => ({
          type: "repair",
          title: `Repair #${r.id}`,
          time: r.created_at || new Date().toISOString(),
        })),
      ]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 6);

      setRecentActivity(activity);

      // Product Trend (monthly)
      const monthly = products.reduce((acc: any, p: any) => {
        const month = new Date(p.created_at || Date.now()).toLocaleString("en", {
          month: "short",
        });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});
      setProductTrend(
        Object.entries(monthly).map(([month, added]) => ({ month, added }))
      );

      // Repair Status (for future chart if you want)
      const statusCount = repairs.reduce((acc: any, r: any) => {
        const s = r.status || "pending";
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {});
      setRepairStatus(Object.entries(statusCount).map(([name, value]) => ({ name, value })));

      // Pending Repairs for notifications
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

  // ────── Loading ──────
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress size={70} thickness={5} sx={{ color: "#DC1A8A" }} />
      </Box>
    );
  }

  const accent = "#DC1A8A";

  // ────── Render ──────
  return (
    <Fade in timeout={600}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: { xs: 2, md: 4 } }}>
        {/* HERO HEADER */}
        <GlassHeader>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{ fontWeight: 900, color: "text.primary" }}
          >
            Admin Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
            Real-time overview of inventory, orders, repairs & testimonials.
          </Typography>
        </GlassHeader>

        {/* TOP STAT CARDS */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          sx={{ mb: 5 }}
        >
          {[
            {
              title: "Total Products",
              value: stats.totalProducts,
              icon: <Inventory sx={{ fontSize: 34, color: accent }} />,
              trend: "+12%",
            },
            {
              title: "Pending Orders",
              value: stats.pendingOrders,
              icon: <ShoppingCart sx={{ fontSize: 34, color: "#e91e63" }} />,
              chip: stats.pendingOrders > 0 ? "warning" : "success",
            },
            {
              title: "Pending Repairs",
              value: stats.pendingRepairs,
              icon: <Wrench sx={{ fontSize: 34, color: "#B31774" }} />,
              chip: stats.pendingRepairs > 0 ? "error" : "success",
            },
            {
              title: "Pending Testimonials",
              value: stats.pendingTestimonials,
              icon: <Star sx={{ fontSize: 34, color: "#9a165c" }} />,
              chip: "info",
            },
          ].map((s, i) => (
            <StatCard key={i} sx={{ flex: 1 }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.95rem",
                        color: "text.secondary",
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                      }}
                    >
                      {s.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 900, color: "text.primary", mt: 0.5 }}
                    >
                      {s.value}
                    </Typography>

                    {s.trend && (
                      <Box sx={{ display: "flex", alignItems: "center", mt: 1, gap: 0.5 }}>
                        <TrendingUp sx={{ fontSize: 16, color: "#4caf50" }} />
                        <Typography sx={{ fontSize: "0.8rem", color: "#4caf50" }}>
                          {s.trend}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  {s.icon}
                </Box>

                {s.chip && (
                  <PriorityChip
                    label={
                      s.chip === "warning"
                        ? "Attention"
                        : s.chip === "error"
                        ? "Urgent"
                        : s.chip === "success"
                        ? "Good"
                        : "Pending"
                    }
                    color={
                      s.chip === "success"
                        ? "success"
                        : s.chip === "error"
                        ? "error"
                        : s.chip === "warning"
                        ? "warning"
                        : "info"
                    }
                    size="small"
                    sx={{ mt: 2 }}
                  />
                )}
              </CardContent>
            </StatCard>
          ))}
        </Stack>

        {/* MAIN GRID */}
        <Stack direction={{ xs: "column", lg: "row" }} spacing={4}>
          {/* LEFT COLUMN */}
          <Box sx={{ flex: 2 }}>
            {/* PRODUCT TREND CHART */}
            <SectionCard sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{ mb: 3, fontWeight: 800, color: "text.primary" }}
              >
                Product Additions (Last 6 Months)
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={productTrend}>
                  <CartesianGrid strokeDasharray="5 5" stroke={alpha("#000", 0.05)} />
                  <XAxis dataKey="month" tick={{ fontSize: 13 }} />
                  <YAxis tick={{ fontSize: 13 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: `0 4px 12px ${alpha("#000", 0.1)}`,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="added"
                    stroke={accent}
                    strokeWidth={3}
                    dot={{ fill: accent, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </SectionCard>

            {/* LOW STOCK ALERT */}
            {stats.lowStock > 0 && (
              <SectionCard sx={{ mb: 4, borderLeft: "5px solid #ff9800" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Warning sx={{ color: "#ff9800", fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Low Stock Alert
                  </Typography>
                </Box>
                <Typography sx={{ color: "text.secondary", mb: 2 }}>
                  {stats.lowStock} product{stats.lowStock > 1 ? "s" : ""} need restocking
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(stats.lowStock / stats.totalProducts) * 100}
                  sx={{
                    height: 10,
                    borderRadius: 2,
                    bgcolor: "#ffe0b2",
                    "& .MuiLinearProgress-bar": { bgcolor: "#ff9800" },
                  }}
                />
              </SectionCard>
            )}
          </Box>

          {/* RIGHT COLUMN */}
          <Box sx={{ flex: 1 }}>
            {/* RECENT ACTIVITY */}
            <SectionCard sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{ mb: 3, fontWeight: 800, color: "text.primary" }}
              >
                Recent Activity
              </Typography>
              <Stack spacing={2.5}>
                {recentActivity.length === 0 ? (
                  <Typography color="text.secondary">No recent activity</Typography>
                ) : (
                  recentActivity.map((act, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "flex-start",
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor:
                            act.type === "product"
                              ? accent
                              : act.type === "order"
                              ? "#e91e63"
                              : "#B31774",
                          width: 40,
                          height: 40,
                        }}
                      >
                        {act.type === "product" ? (
                          <Inventory fontSize="small" />
                        ) : act.type === "order" ? (
                          <ShoppingCart fontSize="small" />
                        ) : (
                          <Wrench fontSize="small" />
                        )}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.98rem" }}>
                          {act.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {act.type.charAt(0).toUpperCase() + act.type.slice(1)} ·{" "}
                          {new Date(act.time).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </Stack>
            </SectionCard>

            {/* REPAIR NOTIFICATIONS */}
            <SectionCard>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: "text.primary" }}
                >
                  Repair Notifications
                </Typography>
                <Badge
                  badgeContent={pendingRepairs.length}
                  color="error"
                  sx={{ "& .MuiBadge-badge": { fontSize: "0.75rem" } }}
                >
                  <Notifications sx={{ color: "#B31774" }} />
                </Badge>
              </Box>

              <NotificationList>
                {pendingRepairs.length === 0 ? (
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle sx={{ color: "#4caf50" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="All caught up!"
                      secondary="No pending repairs"
                    />
                  </ListItem>
                ) : (
                  pendingRepairs.map((repair, i) => (
                    <ListItem key={i}>
                      <ListItemIcon>
                        <Wrench sx={{ color: "#B31774" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Repair #${repair.id}`}
                        secondary={`Device: ${repair.device ?? "—"} · Status: Pending`}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        endIcon={<ArrowForward />}
                        onClick={() =>
                          (window.location.href = `/admin/repairs/${repair.id}`)
                        }
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
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
    </Fade>
  );
};

export default AdminDashboardPage;