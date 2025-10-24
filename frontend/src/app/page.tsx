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
import ShopSection from './components/mostwanted';

export default function Home() {
  return (
    <div>
      <TopNavBar />
      <MainNavBar />
      <HeroSection /> 
      <FeaturedProductsSection />
      <TopCategoriesSection />
      <PromoSection />
      <DealsSection /> 
      <ShopSection />
      <RepairSection />
      <TestimonialsSection />
    </div>
  );
}
