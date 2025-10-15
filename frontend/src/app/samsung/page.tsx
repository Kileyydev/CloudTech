"use client";
import React from 'react';
import TopNavBar from "@/app/components/TopNavBar";
import MainNavBar from "@/app/components/MainNavBar";
import HeroSection from "@/app/samsung/components/HeroSection";
import FilterSection from "@/app/samsung/components/ProductCategorySection";
import Footer from "@/app/components/FooterSection";


export default function Home() {
  return (
    <div>
      <TopNavBar />
      <MainNavBar />
      <HeroSection />
      <FilterSection />
      <Footer />
    </div>
  );
}
