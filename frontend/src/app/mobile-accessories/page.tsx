"use client";
import React from 'react';
import TopNavBar from "@/app/components/TopNavBar";
import MainNavBar from "@/app/components/MainNavBar";
import HeroSection from "@/app/audio/components/HeroSection";
import MobileAccessoriesSection from './components/mobileacessories';
import Footer from "@/app/components/FooterSection";


export default function Home() {
  return (
    <div>
      <TopNavBar />
      <MainNavBar />
      <HeroSection />
      <MobileAccessoriesSection />
      <Footer />
    </div>
  );
}
