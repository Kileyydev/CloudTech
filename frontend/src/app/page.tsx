import React from 'react';
import TopNavBar from './components/TopNavBar';
import MainNavBar from './components/MainNavBar';
import HeroSection from './components/HeroSection';
import PromoSection from './components/ProductSection';
import TopCategoriesSection from './components/TopCategoriesSection';
import FeaturedProductsSection from './components/FeatureSection';
import DealsSection from './components/DealsSection';
import TestimonialsSection from './components/TestimonialsSection';
import Footer from './components/FooterSection';
import RepairSection from './components/RepairSection';
import FloatingActionBar from './components/FloatingActionBar';
import TickerBar from './components/TickerBar';

export default function Home() {
  return (
    <div>
      <TickerBar />
      <TopNavBar />
      <MainNavBar />
      <HeroSection /> 
      <FeaturedProductsSection />
      <TopCategoriesSection />
      <PromoSection />
      <DealsSection /> 
      <RepairSection />
      <TestimonialsSection />
    </div>
  );
}
