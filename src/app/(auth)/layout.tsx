import { AuthShowcase } from "@/components/auth/auth-showcase";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/lib/config/site";
import Link from "next/link";
import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="grid min-h-dvh lg:grid-cols-2">
            <div className="flex flex-col px-6 pt-6 pb-6 sm:px-10">
                <div className="flex items-center justify-between">
                    <Link href="/" aria-label={`${siteConfig.name} home`}>
                        <Logo markClassName="size-8" />
                    </Link>
                    <ThemeToggle />
                </div>
                <div className="flex flex-1 items-center justify-center py-4">
                    <div className="w-full max-w-102.5">{children}</div>
                </div>
            </div>

            <AuthShowcase />
        </div>
    );
};

export default AuthLayout;
