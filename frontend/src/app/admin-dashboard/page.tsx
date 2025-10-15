"use client";
import React, { useState } from "react";
import { Box } from "@mui/material";
import TopNavBar from "../components/TopNavBar";
import MainNavBar from "@/app/admin-dashboard/components/MainNavBar";
import UsersSection from "./components/UsersSection";
import ProductsSection from "@/app/admin-dashboard/components/ProductSection";
import Footer from "../components/FooterSection";

export default function AdminDashboardPage() {
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
      <TopNavBar />
      <MainNavBar activeSection={activeSection} setActiveSection={setActiveSection} />
      <Box sx={{ padding: "16px", flexGrow: 1 }}>
        {activeSection === "dashboard" && <Box>Dashboard content here...</Box>}
        {activeSection === "products" && <ProductsSection />}
        {activeSection === "orders" && <Box>Orders content here...</Box>}
        {activeSection === "contacts" && <Box>Contacts content here...</Box>}
        {activeSection === "discounts" && <Box>Discounts content here...</Box>}
        {activeSection === "users" && <UsersSection />}
        
      </Box>
      <Footer />
    </Box>
  );
}