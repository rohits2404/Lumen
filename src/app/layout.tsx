import type { Metadata } from "next";
import { Figtree, Geist_Mono, Lora } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { NavigationProgress } from "@/components/shared/navigation-progress";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toast";

const figtree = Figtree({
    subsets: ["latin"],
    style: ["normal", "italic"],
    variable: "--font-figtree",
    display: "swap",
});

const fontSerif = Lora({
    subsets: ["latin"],
    style: ["normal", "italic"],
    variable: "--font-lora",
    display: "swap",
});

const fontMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Lumen",
    description:
        "A Modern Learning Management Platform To Create Courses, Manage Learning, and Empower Learners To Grow.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={cn(
                figtree.variable,
                fontSerif.variable,
                fontMono.variable,
                "font-sans",
            )}
        >
            <body>
                <Suspense fallback={null}>
                    <NavigationProgress />
                </Suspense>
                <ThemeProvider>{children}</ThemeProvider>
                <Toaster />
            </body>
        </html>
    );
}
