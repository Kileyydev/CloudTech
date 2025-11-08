"use client";
import React from 'react';
import TopNavBar from "@/app/components/TopNavBar";
import MainNavBar from "@/app/components/MainNavBar";
import HeroSection from "@/app/audio/components/HeroSection";
import StorageAccessoriesSection from './components/storageaccessories';
import Footer from "@/app/components/FooterSection";
import TickerBar from '../components/TickerBar';


export default function Home() {
  return (
    <div>
    
     
      <StorageAccessoriesSection />
    </div>
  );
}
