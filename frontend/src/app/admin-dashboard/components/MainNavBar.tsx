"use client";

import React from "react";
import { Box, Button } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PeopleIcon from "@mui/icons-material/People";
import BuildIcon from "@mui/icons-material/Build"; // 🛠️ for Repairs
import StarIcon from "@mui/icons-material/Star"; // 🌟 for Testimonials
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";

type Props = {
  activeSection: string;
  setActiveSection: React.Dispatch<React.SetStateAction<string>>;
};

// 💎 Updated Navigation Items
const navItems = [
  { text: "Dashboard", icon: <DashboardIcon />, section: "dashboard" },
  { text: "Products", icon: <ShoppingCartIcon />, section: "products" },
  { text: "Orders", icon: <ShoppingCartIcon />, section: "orders" },
  { text: "Contacts", icon: <ContactMailIcon />, section: "contacts" },
  { text: "Discounts", icon: <LocalOfferIcon />, section: "discounts" },
  { text: "Repairs", icon: <BuildIcon />, section: "repairs" }, // ✨ NEW
  { text: "Testimonials", icon: <StarIcon />, section: "testimonials" }, // ✨ NEW
  { text: "Users", icon: <PeopleIcon />, section: "users" },
];

const MainNavBar: React.FC<Props> = ({ activeSection, setActiveSection }) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    router.push("/admin/login");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        borderBottom: "1px solid #E0E0E0",
        px: 4,
        py: 1.5,
        gap: 1.5,
        alignItems: "center",
        backgroundColor: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {navItems.map((item) => (
        <Button
          key={item.text}
          startIcon={item.icon}
          onClick={() => setActiveSection(item.section)}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 2.5,
            py: 1,
            backgroundColor: activeSection === item.section ? "#DC1A8A" : "transparent",
            color: activeSection === item.section ? "#fff" : "#333",
            transition: "0.3s",
            "&:hover": {
              backgroundColor: activeSection === item.section ? "#B00053" : "rgba(220, 26, 138, 0.08)",
              color: "#B00053",
            },
          }}
        >
          {item.text}
        </Button>
      ))}

      <Button
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        sx={{
          textTransform: "none",
          borderRadius: 2,
          marginLeft: "auto",
          backgroundColor: "#f44336",
          color: "#fff",
          px: 2.5,
          py: 1,
          "&:hover": { backgroundColor: "#d32f2f" },
        }}
      >
        Logout
      </Button>
    </Box>
  );
};

export default MainNavBar;
