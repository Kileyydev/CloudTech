"use client";
import React from 'react';
import TopNavBar from "@/app/components/TopNavBar";
import MainNavBar from "@/app/components/MainNavBar";
import HeroSection from "@/app/audio/components/HeroSection";
import ContentAccessoriesSection from './components/contentaccessories';
import TickerBar from '../components/TickerBar';


export default function Home() {
  return (
    <div>
      <TickerBar/>
      <TopNavBar />
      <MainNavBar />
      <ContentAccessoriesSection />
    </div>
  );
}
