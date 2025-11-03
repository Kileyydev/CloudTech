"use client";
import React from 'react';
import TopNavBar from "@/app/components/TopNavBar";
import MainNavBar from "@/app/components/MainNavBar";
import HeroSection from "@/app/audio/components/HeroSection";
import GamingAccessoriesSection from './components/gaming';
import TickerBar from '../components/TickerBar';


export default function Home() {
  return (
    <div>
      <TickerBar/>
      <TopNavBar />
      <MainNavBar />
      <GamingAccessoriesSection />
    </div>
  );
}
