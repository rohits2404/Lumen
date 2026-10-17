import { InstructorOverview } from "@/components/dashboard/instructor/overview/instructor-overview";
import { Badge } from "@/components/ui/badge";
import { instructorOverviewCopy } from "@/lib/config/instructor-nav";
import { getInstructorOverview } from "@/lib/instructor-overview";
import { notFound } from "next/navigation";
import React from "react";

export default async function InstructorDashboardPage() {
    const data = await getInstructorOverview();
    if (!data) notFound();

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <div className="flex items-center gap-3">
                <h1 className="text-[32px] leading-none font-bold">
                    {instructorOverviewCopy.title}
                </h1>
                <Badge
                    variant="outline"
                    className="h-6.5 gap-2 border-border bg-transparent px-3 font-medium text-foreground"
                >
                    <span className="size-1.5 rounded-full bg-role-instructor" />
                    {instructorOverviewCopy.modeBadge}
                </Badge>
            </div>

            <div className="mt-6">
                <InstructorOverview data={data} />
            </div>
        </main>
    );
}
