"use client";
import React, { useState } from "react";
import { Box } from "@mui/material";
import TopNavBar from "../components/TopNavBar";
import MainNavBar from "@/app/admin-dashboard/components/MainNavBar";
import UsersSection from "./components/UsersSection";
import ProductsSection from "@/app/admin-dashboard/components/ProductSection";
import DashboardSection from "./components/DashboardSection";
import DiscountsSection from "./components/DiscountSection";
import TestimonialsAdminPage from "./components/TestimonialsSection";
import AdminRepairsPage from "./components/RepairSection";
import TickerBar from "../components/TickerBar";
import OrdersSection from "./components/OrdersSection";
import OrdersPage from "@/app/admin-dashboard/components/OrdersSection";

export default function AdminDashboardPageComponent() {
  const [activeSection, setActiveSection] = useState<string>("dashboard");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TickerBar/>
      <TopNavBar />
      <MainNavBar activeSection={activeSection} setActiveSection={setActiveSection} />
      <Box sx={{ padding: "16px", flexGrow: 1 }}>
        {activeSection === "dashboard" && <DashboardSection />}
        {activeSection === "products" && <ProductsSection />}
        {activeSection === "discounts" && <DiscountsSection />}
        {activeSection === "users" && <UsersSection />}
        {activeSection === "testimonials" && <TestimonialsAdminPage />}
        {activeSection === "repairs" && <AdminRepairsPage />}

        {activeSection === "OrdersSection" && <OrdersPage />}
        
      </Box>
    </Box>
  );
}