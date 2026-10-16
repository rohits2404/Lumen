import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

const CheckoutLayout = async ({ children }: { children: React.ReactNode }) => {
    const session = await getSession();
    if (!session) redirect("/login");

    return <div className="min-h-svh bg-background">{children}</div>;
};

export default CheckoutLayout;
