"use client";

import React from "react";
import { Box, Button } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";

type Props = {
  activeSection: string;
  setActiveSection: React.Dispatch<React.SetStateAction<string>>;
};

const navItems = [
  { text: "Dashboard", icon: <DashboardIcon />, section: "dashboard" },
  { text: "Products", icon: <ShoppingCartIcon />, section: "products" },
  { text: "Orders", icon: <ShoppingCartIcon />, section: "orders" },
  { text: "Contacts", icon: <ContactMailIcon />, section: "contacts" },
  { text: "Discounts", icon: <LocalOfferIcon />, section: "discounts" },
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
    <Box sx={{ display: "flex", borderBottom: "1px solid #E0E0E0", px: 4, py: 1, gap: 2 }}>
      {navItems.map((item) => (
        <Button
          key={item.text}
          startIcon={item.icon}
          onClick={() => setActiveSection(item.section)}
          sx={{
            borderRadius: 1,
            backgroundColor: activeSection === item.section ? "#DC1A8A" : "transparent",
            color: activeSection === item.section ? "#fff" : "#333",
            "&:hover": { backgroundColor: "#B00053", color: "#fff" },
          }}
        >
          {item.text}
        </Button>
      ))}
      <Button
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        sx={{ borderRadius: 1, marginLeft: "auto", backgroundColor: "#f44336", color: "#fff", "&:hover": { backgroundColor: "#d32f2f" } }}
      >
        Logout
      </Button>
    </Box>
  );
};

export default MainNavBar;
