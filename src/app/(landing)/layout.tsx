import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import React from "react";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    );
};

export default LandingLayout;
