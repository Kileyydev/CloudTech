"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  styled,
  IconButton,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  Build as BuildIcon,
  Star as StarIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

type Props = {
  activeSection: string;
  setActiveSection: React.Dispatch<React.SetStateAction<string>>;
};

// NAV ITEMS (NO DISCOUNTS, NO CONTACTS)
const navItems = [
  { text: "Dashboard", icon: <DashboardIcon />, section: "dashboard" },
  { text: "Products", icon: <ShoppingCartIcon />, section: "products" },
  { text: "Orders", icon: <ShoppingCartIcon />, section: "orders" },
  { text: "Repairs", icon: <BuildIcon />, section: "repairs" },
  { text: "Testimonials", icon: <StarIcon />, section: "testimonials" },
  { text: "Users", icon: <PeopleIcon />, section: "users" },
];

// STYLED COMPONENTS
const NavContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing(1),
  background: "linear-gradient(180deg, #9a979fff 40%, #9a979fff 100%)",
  borderBottom: "1px solid rgba(0,0,0,0.1)",
  position: "sticky",
  top: 0,
  zIndex: 1200,
  [theme.breakpoints.up("lg")]: {
    flexDirection: "row",
    padding: theme.spacing(1.5, 3),
  },
  [theme.breakpoints.up("xl")]: {
    padding: theme.spacing(1.5, 4),
  },
}));

const NavList = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  transition: "opacity 0.3s ease-in-out, max-height 0.3s ease-in-out",
  overflow: "hidden",
  opacity: 1,
  maxHeight: "1000px",
  [theme.breakpoints.up("lg")]: {
    flexDirection: "row",
    justifyContent: "center",
    opacity: 1,
    maxHeight: "none",
    width: "auto",
  },
}));

const NavButton = styled(Button)<{ active: boolean }>(({ theme, active }) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: theme.spacing(1, 2),
  margin: theme.spacing(0.4, 0),
  borderRadius: "8px",
  textTransform: "none",
  fontWeight: 600,
  fontSize: "clamp(0.9rem, 2.2vw, 1rem)",
  color: active ? "#DC1A8A" : "#000000",
  backgroundColor: active ? "rgba(220, 26, 138, 0.08)" : "transparent",
  border: "1px solid rgba(0, 0, 0, 0.1)",
  transition: "all 0.2s ease-in-out",
  width: "100%",
  "& .nav-text": {
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: "-4px",
      left: 0,
      width: active ? "100%" : "0%",
      height: "3px",
      backgroundColor: "#DC1A8A",
      transition: "width 0.3s ease-in-out",
    },
  },
  "&:hover": {
    backgroundColor: "rgba(220, 26, 138, 0.1)",
    transform: "scale(1.02)",
    "& .nav-text::after": {
      width: "100%",
    },
  },
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(1.2, 2.5),
    margin: theme.spacing(0.5, 0),
  },
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(1.4, 3),
  },
  [theme.breakpoints.up("lg")]: {
    width: "auto",
    margin: theme.spacing(0, 1.2),
    padding: theme.spacing(0.8, 1.5),
    border: "none",
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: "transparent",
      transform: "none",
    },
  },
  [theme.breakpoints.up("xl")]: {
    margin: theme.spacing(0, 1.4),
    padding: theme.spacing(0.9, 1.8),
  },
}));

const ToggleButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: "#DC1A8A",
  color: "#000000",
  padding: theme.spacing(0.6),
  margin: theme.spacing(0.5),
  borderRadius: "50%",
  "&:hover": {
    backgroundColor: "#B31774",
    transform: "scale(1.12)",
  },
  animation: "bounce 2s ease-in-out infinite",
  "@keyframes bounce": {
    "0%, 100%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-4px)" },
  },
  [theme.breakpoints.up("lg")]: {
    display: "none",
  },
}));

const LogoutButton = styled(Button)(({ theme }) => ({
  marginLeft: "auto",
  backgroundColor: "#f44336",
  color: "#fff",
  borderRadius: "8px",
  padding: theme.spacing(1, 2),
  textTransform: "none",
  fontWeight: 600,
  "&:hover": {
    backgroundColor: "#d32f2f",
  },
  [theme.breakpoints.down("lg")]: {
    width: "100%",
    margin: theme.spacing(1, 0),
  },
}));

// MAIN COMPONENT
const MainNavBar: React.FC<Props> = ({ activeSection, setActiveSection }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    router.push("/admin/login");
  };

  return (
    <NavContainer>
      {/* Mobile Toggle */}
      {!isDesktop && (
        <ToggleButton onClick={toggleMenu} aria-label={isOpen ? "Close menu" : "Open menu"}>
          {isOpen ? <RemoveIcon /> : <AddIcon />}
        </ToggleButton>
      )}

      {/* Nav Items */}
      <NavList
        sx={{
          opacity: isDesktop || isOpen ? 1 : 0,
          maxHeight: isDesktop || isOpen ? "1000px" : "0px",
        }}
      >
        {navItems.map((item) => (
          <NavButton
            key={item.section}
            active={activeSection === item.section}
            startIcon={item.icon}
            onClick={() => setActiveSection(item.section)}
          >
            <Typography className="nav-text" sx={{ ml: 1 }}>
              {item.text}
            </Typography>
          </NavButton>
        ))}

        {/* Logout Button */}
        <LogoutButton
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ display: { xs: "flex", lg: "none" } }}
        >
          Logout
        </LogoutButton>
      </NavList>

      {/* Desktop Logout */}
      {isDesktop && (
        <LogoutButton startIcon={<LogoutIcon />} onClick={handleLogout}>
          Logout
        </LogoutButton>
      )}
    </NavContainer>
  );
};

export default MainNavBar;