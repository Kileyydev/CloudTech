"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Divider,
} from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ShoppingBag, Users, DollarSign, Tag } from "lucide-react";

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  });
  const [salesData, setSalesData] = useState([
    { month: "Jan", sales: 40000 },
    { month: "Feb", sales: 32000 },
    { month: "Mar", sales: 52000 },
    { month: "Apr", sales: 38000 },
    { month: "May", sales: 60000 },
    { month: "Jun", sales: 45000 },
  ]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);

  const API_BASE = "http://localhost:8000/api";

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("access") : null;

  const fetchDashboardData = async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      // Fetch products for count and recent
      const productRes = await fetch(`${API_BASE}/products/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const productData = await productRes.json();
      const products = Array.isArray(productData) ? productData : productData.results;

      // You can extend this logic to fetch orders, customers, etc. from your backend later.
      setStats({
        totalProducts: products.length,
        totalOrders: 42,
        totalCustomers: 12,
        totalRevenue: 128000,
      });

      // Just show latest 5 products
      setRecentProducts(products.slice(0, 5));
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f9fafb", p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#111" }}>
        Admin Dashboard
      </Typography>

      {/* Top Stats Section */}
      <Grid container spacing={3}>
        {[
          {
            title: "Total Products",
            value: stats.totalProducts,
            icon: <ShoppingBag color="#DC1A8A" size={28} />,
          },
          {
            title: "Total Orders",
            value: stats.totalOrders,
            icon: <Tag color="#DC1A8A" size={28} />,
          },
          {
            title: "Total Customers",
            value: stats.totalCustomers,
            icon: <Users color="#DC1A8A" size={28} />,
          },
          {
            title: "Total Revenue",
            value: `KES ${stats.totalRevenue.toLocaleString()}`,
            icon: <DollarSign color="#DC1A8A" size={28} />,
          },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                p: 2,
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>{stat.title}</Typography>
                  {stat.icon}
                </Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", color: "#111" }}
                >
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Sales Overview Chart */}
      <Box
        sx={{
          mt: 5,
          p: 3,
          backgroundColor: "#fff",
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Sales Overview
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#DC1A8A" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Recent Products Section */}
      <Box
        sx={{
          mt: 5,
          p: 3,
          backgroundColor: "#fff",
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Recent Products
        </Typography>
        {recentProducts.length === 0 ? (
          <Typography>No recent products found.</Typography>
        ) : (
          recentProducts.map((product) => (
            <Box key={product.id} sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 600 }}>{product.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                KES {product.price} — {product.discount ?? 0}% off
              </Typography>
              <Divider sx={{ mt: 1, mb: 1 }} />
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboardPage;
