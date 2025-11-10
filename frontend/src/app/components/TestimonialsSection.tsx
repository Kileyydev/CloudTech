"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Rating,
  IconButton,
  CircularProgress,
  Alert,
  Fab,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";

// 🌸 Styled Components
const SectionBox = styled(Box)(({ theme }) => ({
  position: "relative",
  minHeight: "400px",
  backgroundColor: "#FFFFFF",
  padding: theme.spacing(6, 4),
  color: "#000000",
  overflow: "hidden",
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      'url(https://cdn.wccftech.com/wp-content/uploads/2017/12/MacBook-Touch--1920x1080.jpg) center/cover no-repeat',
    filter: "blur(1px)",
    opacity: 0.9,
    zIndex: 0,
  },
}));

const ContentContainer = styled(Box)({ position: "relative", zIndex: 1 });

const TestimonialCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  height: 300,
  minWidth: 260,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  transition: "transform 0.25s ease, box-shadow 0.25s ease",
  backgroundColor: "#FFFFFF",
}));



const SliderContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  overflowX: "hidden",
  scrollBehavior: "smooth",
  position: "relative",
  padding: theme.spacing(2),
  gap: theme.spacing(2),
}));

const NavButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  color: "#FFFFFF",
  zIndex: 2,
}));

// 💬 Type
type TestimonialT = {
  id: number;
  name: string;
  product: string;
  experience: string;
  rating: number;
  image?: string;
  is_approved: boolean;
  created_at: string;
};

// ✅ Env variables for API & media
const API_BASE = process.env.NEXT_PUBLIC_API_BASE + "/testimonials/";
const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE || "http://localhost:8000/media/";

// Helper to handle local & full URLs
const getImageUrl = (img?: string) => {
  if (!img) return "/images/fallback.jpg";
  return img.startsWith("http") ? img : `${MEDIA_BASE}${img}`;
};

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<TestimonialT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const sliderRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch approved testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error("Failed to fetch testimonials");
        const data = await res.json();

        const list = Array.isArray(data)
          ? data
          : data.results && Array.isArray(data.results)
          ? data.results
          : [];

        const approved = list.filter((item: TestimonialT) => item.is_approved === true);
        console.log("Approved testimonials fetched:", approved);
        setTestimonials(approved);
      } catch (err: any) {
        console.error("Error fetching testimonials:", err);
        setError(err.message || "Failed to load testimonials");
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const scrollLeft = () => sliderRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 300, behavior: "smooth" });

  // Mouse wheel scroll
  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        slider.scrollLeft += e.deltaY;
      };
      slider.addEventListener("wheel", handleWheel);
      return () => slider.removeEventListener("wheel", handleWheel);
    }
  }, []);

  return (
    <SectionBox>
      <ContentContainer>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            mb: 4,
            color: "#FFFFFF",
            textAlign: "center",
            textDecoration: "underline",
            textUnderlineOffset: "6px",
          }}
        >
          What Our Customers Say 💬
        </Typography>

        <Fab
          color="secondary"
          size="small"
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            backgroundColor: "#e91e63",
            color: "#fff",
            zIndex: 3,
          }}
          onClick={() => router.push("/testimonials")}
        >
          <AddIcon />
        </Fab>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : testimonials.length === 0 ? (
          <Typography sx={{ color: "#fff", textAlign: "center" }}>
            No testimonials yet. Be the first to review!
          </Typography>
        ) : (
          <>
            <SliderContainer ref={sliderRef}>
              {testimonials.map((t) => (
                <TestimonialCard key={t.id}>
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      p: 2,
                    }}
                  >

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#444",
                        mb: 1,
                        fontSize: 14,
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.5,
                      }}
                    >
                      {t.experience}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{ color: "#000", fontWeight: 600, mb: 1 }}
                    >
                      — {t.name}
                    </Typography>

                    <Rating name="read-only" value={t.rating} readOnly />

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#000000",
                        mt: 1,
                        fontWeight: "bold",
                        fontSize: 14,
                      }}
                    >
                      {t.product}
                    </Typography>
                  </CardContent>
                </TestimonialCard>
              ))}
            </SliderContainer>

            <NavButton sx={{ left: 16 }} onClick={scrollLeft}>
              <ArrowBackIcon />
            </NavButton>
            <NavButton sx={{ right: 16 }} onClick={scrollRight}>
              <ArrowForwardIcon />
            </NavButton>
          </>
        )}
      </ContentContainer>
    </SectionBox>
  );
}
