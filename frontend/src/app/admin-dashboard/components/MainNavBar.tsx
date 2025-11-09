"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  styled,
  IconButton,
  Button,
  Badge,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,

  ShoppingCart as ShoppingCartIcon,
  Build as BuildIcon,
  Star as StarIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  ReceiptLong as ReceiptLongIcon, // ✅ new icon for Orders
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

type Props = {
  activeSection: string;
  setActiveSection: React.Dispatch<React.SetStateAction<string>>;
};

// ✅ Navigation items
const navItems = [

  { text: "Products", icon: <ShoppingCartIcon />, section: "products" },
  { text: "Orders", icon: <ReceiptLongIcon />, section: "orders" },
  { text: "Repairs", icon: <BuildIcon />, section: "repairs" },
  { text: "Testimonials", icon: <StarIcon />, section: "testimonials" },
  { text: "Users", icon: <PeopleIcon />, section: "users" },
];

// ✅ Styled Components
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
  [theme.breakpoints.up("lg")]: {
    flexDirection: "row",
    justifyContent: "center",
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
  transition: "all 0.25s ease-in-out",
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
      borderRadius: "2px",
    },
  },
  "&:hover": {
    backgroundColor: "rgba(220, 26, 138, 0.1)",
    transform: "scale(1.02)",
    "& .nav-text::after": {
      width: "100%",
    },
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

// ✅ Main Component
const MainNavBar: React.FC<Props> = ({ activeSection, setActiveSection }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  // Placeholder for pending orders count
  const pendingOrders = 3; // later replace this with API data

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

      {/* Navigation Buttons */}
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
            onClick={() => setActiveSection(item.section)}
            startIcon={
              item.text === "Orders" ? (
                <Badge
                  badgeContent={pendingOrders}
                  color="secondary"
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "#DC1A8A",
                      color: "#fff",
                      fontSize: "0.7rem",
                      minWidth: "18px",
                      height: "18px",
                    },
                  }}
                >
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )
            }
          >
            <Typography className="nav-text" sx={{ ml: 1 }}>
              {item.text}
            </Typography>
          </NavButton>
        ))}

        {/* Logout Button (Mobile) */}
        <LogoutButton
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ display: { xs: "flex", lg: "none" } }}
        >
          Logout
        </LogoutButton>
      </NavList>

      {/* Logout Button (Desktop) */}
      {isDesktop && (
        <LogoutButton startIcon={<LogoutIcon />} onClick={handleLogout}>
          Logout
        </LogoutButton>
      )}
    </NavContainer>
  );
};

export default MainNavBar;
