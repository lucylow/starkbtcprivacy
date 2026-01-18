import React from 'react';
import Navigation from '@/components/Navigation';
import StatsTicker from '@/components/StatsTicker';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorks from '@/components/HowItWorks';
import SecuritySection from '@/components/SecuritySection';
import IntegrationSection from '@/components/IntegrationSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navigation />
      <StatsTicker />
      <main className="pt-10">
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <SecuritySection />
        <IntegrationSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
