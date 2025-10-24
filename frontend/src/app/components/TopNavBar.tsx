'use client';
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  InputBase,
  IconButton,
  Badge,
  Typography,
  Box,
} from "@mui/material";
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  FeedbackOutlined as FeedbackIcon,
} from "@mui/icons-material";
import { styled, useTheme } from "@mui/material/styles";
import Link from "next/link";
import { useCart } from '@/app/hooks/useCart'; // Import the cart hook

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  padding: theme.spacing(0.75),
  display: "none",
  [theme.breakpoints.up("sm")]: {
    display: "block",
    padding: theme.spacing(1.2),
  },
  [theme.breakpoints.up("lg")]: {
    padding: theme.spacing(1.2, 2.5),
  },
  [theme.breakpoints.up("xl")]: {
    padding: theme.spacing(1.5, 3),
  },
}));

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  backgroundColor: "#DC1A8A",
  border: "2px solid #DC1A8A",
  boxShadow: "0 0 8px rgba(220, 26, 138, 0.5)",
  "&:hover": {
    backgroundColor: "#B31774",
    boxShadow: "0 0 12px rgba(220, 26, 138, 0.7)",
  },
  marginLeft: theme.spacing(0.75),
  width: "100%",
  maxWidth: "400px",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1.2),
    width: "32vw",
    maxWidth: "280px",
  },
  [theme.breakpoints.up("md")]: {
    width: "40vw",
    maxWidth: "340px",
  },
  [theme.breakpoints.up("lg")]: {
    width: "50vw",
    maxWidth: "400px",
  },
  [theme.breakpoints.up("xl")]: {
    width: "45vw",
    maxWidth: "450px",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 0.75),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(0, 1.2),
  },
}));

const PinkCloud = styled("span")({
  color: "#DC1A8A",
  fontWeight: "bold",
});

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "white",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(0.6, 0.6, 0.6, 0),
    paddingLeft: `calc(1em + ${theme.spacing(2.2)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    fontSize: "clamp(0.65rem, 1.8vw, 0.75rem)",
    [theme.breakpoints.up("sm")]: {
      fontSize: "clamp(0.7rem, 1.8vw, 0.85rem)",
      paddingLeft: `calc(1em + ${theme.spacing(2.5)})`,
      width: "14ch",
      "&:focus": {
        width: "20ch",
      },
    },
    [theme.breakpoints.up("md")]: {
      width: "16ch",
      "&:focus": {
        width: "22ch",
      },
    },
    [theme.breakpoints.up("lg")]: {
      fontSize: "clamp(0.75rem, 1.8vw, 0.9rem)",
    },
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#FFFFFF",
    opacity: 0.8,
  },
}));

// Rectangle hover with no radius
const ActionButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.6),
  borderRadius: "0", // rectangular, no oval
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(220, 26, 138, 0.1)",
    transform: "translateY(-1px)",
  },
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(0.6),
  },
}));

const ActionText = styled("span")(({ theme }) => ({
  color: "#DC1A8A",
  fontWeight: "500",
  fontSize: "clamp(0.65rem, 1.8vw, 0.75rem)",
  marginLeft: theme.spacing(0.6),
  display: "none",
  [theme.breakpoints.up("sm")]: {
    display: "inline",
    fontSize: "clamp(0.7rem, 1.8vw, 0.85rem)",
  },
  [theme.breakpoints.up("lg")]: {
    fontSize: "clamp(0.75rem, 1.8vw, 0.9rem)",
  },
}));

const TopNavBar = () => {
  const theme = useTheme();
  const [searchValue, setSearchValue] = useState("");
  const { cart } = useCart(); // Get cart state

  return (
    <StyledAppBar position="static">
      <Toolbar sx={{ flexWrap: { sm: "nowrap" }, justifyContent: "space-between" }}>
        {/* Logo and name */}
        <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <img
              src="/images/logo.jpeg"
              alt="CloudTech"
              onError={(e) => {
                e.target.src = "/images/fallback-logo.png";
              }}
              style={{
                height: "clamp(22px, 5.5vw, 28px)",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                ml: { sm: 1.2 },
                color: "#000000ff",
                fontWeight: "bold",
                fontSize: {
                  sm: "clamp(0.85rem, 1.8vw, 0.95rem)",
                  md: "clamp(0.95rem, 1.8vw, 1.1rem)",
                },
                whiteSpace: "nowrap",
              }}
            >
              <PinkCloud>CLOUD</PinkCloud>TECH
            </Typography>
          </Link>
        </Box>

        {/* Search bar */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: { sm: "auto" },
          }}
        >
          <Search>
            <SearchIconWrapper>
              <SearchIcon sx={{ color: "white", fontSize: { sm: "clamp(1.1rem, 2.8vw, 1.2rem)" } }} />
            </SearchIconWrapper>
            <StyledInputBase
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search for products..."
              inputProps={{ "aria-label": "search" }}
            />
          </Search>
        </Box>

        {/* Action buttons */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "nowrap",
            gap: { sm: 1.2 },
          }}
        >
          <ActionButton component={Link} href="/contact-us">
            <PhoneIcon sx={{ color: "#DC1A8A", fontSize: { sm: "clamp(1.2rem, 2.8vw, 1.4rem)" } }} />
            <ActionText>Contact Us</ActionText>
          </ActionButton>

          <ActionButton component={Link} href="/repair">
            <ActionText>Repair</ActionText>
          </ActionButton>

          <ActionButton component={Link} href="/testimonials">
            <FeedbackIcon sx={{ color: "#DC1A8A", fontSize: { sm: "clamp(1.2rem, 2.8vw, 1.4rem)" } }} />
            <ActionText>Feedback</ActionText>
          </ActionButton>

          <ActionButton component={Link} href="/cart"> {/* New Cart Link */}
            <Badge
              badgeContent={cart.length} // Dynamic badge count
              color="error"
              sx={{ "& .MuiBadge-badge": { fontSize: "0.55rem", padding: "2px 4px" } }}
            >
              <ShoppingCartIcon sx={{ color: "#DC1A8A", fontSize: { sm: "clamp(1.2rem, 2.8vw, 1.4rem)" } }} />
            </Badge>
            <ActionText>Cart</ActionText>
          </ActionButton>

          <ActionButton color="inherit" sx={{ p: { sm: 0.6 } }}>
            <Badge
              badgeContent={0}
              color="error"
              sx={{ "& .MuiBadge-badge": { fontSize: "0.55rem", padding: "2px 4px" } }}
            >
              <PersonIcon sx={{ color: "#DC1A8A", fontSize: { sm: "clamp(1.2rem, 2.8vw, 1.4rem)" } }} />
            </Badge>
          </ActionButton>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default TopNavBar;
