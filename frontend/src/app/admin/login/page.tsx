"use client";
import { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import TopNavBar from "@/app/components/TopNavBar";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otpId, setOtpId] = useState(null); // ✅ STORES THE OTP ID
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Login Response:", data);

      // ✅ CHECK FOR otp_id, NOT otp_required
      if (data.otp_id) {
        setOtpId(data.otp_id);
        setOtpStep(true);
      } else {
        alert("Invalid credentials or no OTP sent");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Error logging in");
    }
  };

  const handleOtpVerify = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/verify-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp_id: otpId, code: otp }), // ✅ Correct payload
      });

      const data = await res.json();
      console.log("OTP Verify Response:", data);

      if (data.access) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        router.push("/admin-dashboard");
      } else {
        alert("Invalid OTP");
      }
    } catch (error) {
      console.error("OTP Error:", error);
      alert("Error verifying OTP");
    }
  };

  return (

    <Box

      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          width: 350,
          padding: 4,
          backgroundColor: "#FFFFFF",
          borderRadius: 2,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Typography
          variant="h4"
          textAlign="center"
          sx={{ color: "#333333", fontWeight: "bold", mb: 2 }}
        >
          Admin Login
        </Typography>

        {!otpStep ? (
          <>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  "& fieldset": { borderColor: "#E0E0E0" },
                  "&:hover fieldset": { borderColor: "#DC1A8A" },
                  "&.Mui-focused fieldset": { borderColor: "#DC1A8A" },
                },
              }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  "& fieldset": { borderColor: "#E0E0E0" },
                  "&:hover fieldset": { borderColor: "#DC1A8A" },
                  "&.Mui-focused fieldset": { borderColor: "#DC1A8A" },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleLogin}
              sx={{
                backgroundColor: "#DC1A8A",
                "&:hover": { backgroundColor: "#B00053" },
                borderRadius: 1,
                padding: "10px 20px",
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              Login
            </Button>
          </>
        ) : (
          <>
            <Typography
              textAlign="center"
              sx={{ color: "#666666", mb: 2, fontStyle: "italic" }}
            >
              Enter the OTP sent to your email
            </Typography>
            <TextField
              label="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  "& fieldset": { borderColor: "#E0E0E0" },
                  "&:hover fieldset": { borderColor: "#DC1A8A" },
                  "&.Mui-focused fieldset": { borderColor: "#DC1A8A" },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleOtpVerify}
              sx={{
                backgroundColor: "#DC1A8A",
                "&:hover": { backgroundColor: "#B00053" },
                borderRadius: 1,
                padding: "10px 20px",
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              Verify OTP
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}
