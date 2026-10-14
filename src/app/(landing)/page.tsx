import { CatalogSection } from "@/components/landing/catalog-section";
import { CtaSection } from "@/components/landing/cta-section";
import { HeroSection } from "@/components/landing/hero-section";
import { PlatformSection } from "@/components/landing/platform-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { QuestionsSection } from "@/components/landing/questions-section";
import { StatsSection } from "@/components/landing/stats-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { getBusinessOffer } from "@/lib/subscription";
import React from "react";

const Home = async () => {
    const offer = await getBusinessOffer();

    return (
        <main>
            <HeroSection />
            <StatsSection />
            <PlatformSection />
            <CatalogSection />
            <TestimonialsSection />
            <PricingSection offer={offer} />
            <QuestionsSection />
            <CtaSection />
        </main>
    );
};

export default Home;
