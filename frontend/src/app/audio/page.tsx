"use client";
import React from 'react';
import TopNavBar from "@/app/components/TopNavBar";
import MainNavBar from "@/app/components/MainNavBar";
import AudioAccessoriesSection from './components/audio';
import TickerBar from '../components/TickerBar';

export default function Home() {
  return (
    <div>
      <TickerBar/>
      <TopNavBar />
      <MainNavBar />
      <AudioAccessoriesSection />
    </div>
  );
}
