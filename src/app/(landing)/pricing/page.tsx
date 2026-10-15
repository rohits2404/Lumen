import { PricingSection } from "@/components/landing/pricing-section";
import { getBusinessOffer } from "@/lib/subscription";
import React from "react";

const PricingPage = async () => {
    const offer = await getBusinessOffer();

    return <PricingSection offer={offer} />;
};

export default PricingPage;
