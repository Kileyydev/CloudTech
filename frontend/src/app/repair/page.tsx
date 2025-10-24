"use client";

import {
  Box,
  Typography,
  CardMedia,
  List,
  ListItem,
  ListItemText,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UploadIcon from "@mui/icons-material/Upload";
import TopNavBar from "../components/TopNavBar";
import MainNavBar from "../components/MainNavBar";
import Footer from "../components/FooterSection";
import { useState } from "react";

const API_BASE = "http://localhost:8000/api/repairs/";

export default function SmartphoneRepairPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("full_name", formData.full_name);
      data.append("phone_number", formData.phone_number);
      data.append("description", formData.description);
      if (file) data.append("media", file);

      const res = await fetch(API_BASE, {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Failed to submit request");

      setSnackbar({ open: true, message: "Repair request submitted successfully!", severity: "success" });
      setFormData({ full_name: "", phone_number: "", description: "" });
      setFile(null);
      setFileName("");
    } catch (err) {
      setSnackbar({ open: true, message: "Error submitting repair request", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    { question: "Can I buy spare parts here?", answer: "Yes, we sell genuine spare parts and accessories." },
    { question: "How long does a laptop battery replacement take?", answer: "Usually 1–2 hours depending on model." },
    { question: "How many branches does Trefik have?", answer: "We have several centers across major towns." },
    { question: "What payment methods are available?", answer: "We accept M-Pesa, cards, and cash payments." },
  ];

  const repairCategories = [
    {
      title: "Personal Computer Repair",
      image: "/images/repair.jpg",
      services: [
        { name: "Screen Replacement", price: "Ksh 8,000" },
        { name: "Charging Port Repair", price: "Ksh 3,500" },
        { name: "Battery Replacement", price: "Ksh 5,000" },
        { name: "Software Reset", price: "Ksh 2,000" },
      ],
    },
    {
      title: "Mobile Phone Repair",
      image: "/images/repair.jpg",
      services: [
        { name: "Screen Replacement", price: "Ksh 4,000" },
        { name: "Charging Port Repair", price: "Ksh 2,000" },
        { name: "Battery Replacement", price: "Ksh 3,000" },
        { name: "Software Reset", price: "Ksh 1,500" },
      ],
    },
  ];

  return (
    <>
      <TopNavBar />
      <MainNavBar />
      <Box sx={{ backgroundColor: "#fff", color: "#000", py: 6, px: { xs: 2, md: 6 } }}>
        {/* REPAIR CATEGORIES */}
        {repairCategories.map((category, index) => (
          <Grid
            key={index}
            container
            spacing={4}
            alignItems="center"
            sx={{
              mb: 8,
              flexDirection: {
                xs: "column",
                md: index % 2 === 1 ? "row-reverse" : "row",
              },
            }}
          >
            <Grid item xs={12} md={6}>
              <CardMedia
                component="img"
                height="400"
                image={category.image}
                alt={category.title}
                sx={{
                  width: "100%",
                  objectFit: "cover",
                  borderRadius: 0,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ px: { xs: 1, md: 4 } }}>
                <Typography variant="h5" sx={{ color: "#db1b88", fontWeight: 700, mb: 2 }}>
                  {category.title}
                </Typography>
                <List>
                  {category.services.map((service, idx) => (
                    <ListItem key={idx} sx={{ px: 0, borderBottom: "1px solid #eee" }}>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 500 }}>{service.name}</Typography>}
                        secondary={<Typography color="text.secondary">{service.price}</Typography>}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Grid>
          </Grid>
        ))}

        {/* FAQ */}
        <Grid container spacing={6} alignItems="center" sx={{ borderTop: "1px solid #eee", pt: 6 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ position: "relative", width: "100%", height: 400 }}>
              <video width="100%" height="100%" controls style={{ objectFit: "cover" }}>
                <source src="/videos/repair-demo.mp4" type="video/mp4" />
              </video>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h5" color="#db1b88" sx={{ fontWeight: 700, mb: 1 }}>
              THE FAQs
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
              Frequently Asked Questions
            </Typography>
            {faqs.map((faq, i) => (
              <Accordion key={i} sx={{ mb: 2, border: "1px solid #eee" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#db1b88" }} />}>
                  {faq.question}
                </AccordionSummary>
                <AccordionDetails>{faq.answer}</AccordionDetails>
              </Accordion>
            ))}
          </Grid>
        </Grid>

        {/* FORM */}
        <Box sx={{ mt: 10, py: 6, borderTop: "1px solid #eee", textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#db1b88", mb: 3 }}>
            Schedule a Repair or Consultation
          </Typography>
          <Typography variant="body1" sx={{ mb: 5, color: "#444" }}>
            Upload a short video or image showing your device issue and we’ll contact you via WhatsApp.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, width: { xs: "100%", md: "60%" }, mx: "auto" }}>
            <TextField label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} fullWidth />
            <TextField label="Phone Number (WhatsApp)" name="phone_number" value={formData.phone_number} onChange={handleChange} fullWidth />
            <TextField label="Device & Issue Description" name="description" value={formData.description} onChange={handleChange} multiline rows={4} fullWidth />

            <Button variant="outlined" component="label" startIcon={<UploadIcon />} sx={{ color: "#db1b88", borderColor: "#db1b88" }}>
              Upload Image/Video
              <input type="file" hidden accept="image/*,video/*" onChange={handleFileUpload} />
            </Button>
            {fileName && <Typography variant="body2">Uploaded: {fileName}</Typography>}

            <Button type="submit" variant="contained" disabled={loading} sx={{ backgroundColor: "#db1b88", "&:hover": { backgroundColor: "#b2186b" }, px: 5 }}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </Box>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>

      <Footer />
    </>
  );
}
