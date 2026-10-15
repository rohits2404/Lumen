import { DashboardOverview } from "@/components/dashboard/overview/dashboard-overview";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth";
import { getDashboardOverview } from "@/lib/dashboard-overview";
import React from "react";

const DashboardPage = async () => {
    const session = await getSession();
    const user = session!.user;
    const firstName = user.name.split(" ")[0] || user.name;
    const overview = await getDashboardOverview();

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <div className="flex items-center gap-3">
                <h1 className="text-[32px] leading-none">Overview</h1>
                <Badge
                    variant="outline"
                    className="h-6 gap-1.5 border-border bg-card px-2.5 font-medium text-foreground"
                >
                    <span className="size-1.5 rounded-full bg-accent-2" />
                    Student Mode
                </Badge>
            </div>

            <div className="mt-6">
                <DashboardOverview firstName={firstName} data={overview} />
            </div>
        </main>
    );
};

export default DashboardPage;
