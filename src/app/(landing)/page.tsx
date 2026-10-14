import { CatalogSection } from "@/components/landing/catalog-section";
import { CtaSection } from "@/components/landing/cta-section";
import { HeroSection } from "@/components/landing/hero-section";
import { PlatformSection } from "@/components/landing/platform-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { QuestionsSection } from "@/components/landing/questions-section";
import { StatsSection } from "@/components/landing/stats-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import React from "react";

const Home = () => {
    return (
        <main>
            <HeroSection />
            <StatsSection />
            <PlatformSection />
            <CatalogSection />
            <TestimonialsSection />
            <PricingSection />
            <QuestionsSection />
            <CtaSection />
        </main>
    );
};

export default Home;
