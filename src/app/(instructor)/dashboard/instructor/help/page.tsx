import { InstructorHelp } from "@/components/dashboard/instructor/help/instructor-help-page";
import { getPlatformSettings } from "@/lib/admin/settings";
import { getSession } from "@/lib/auth";
import { HelpFacts } from "@/lib/config/instructor-help";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";

function formatMoney(cents: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
    }).format(cents / 100);
}

const InstructorHelpPage = async () => {
    const session = await getSession();
    if (!session) redirect("/login");

    const [settings, instructor] = await Promise.all([
        getPlatformSettings(),
        db.instructor.findUnique({
            where: { userId: session.user.id },
            select: { payoutDayOfMonth: true, minimumPayoutCents: true },
        }),
    ]);

    const facts: HelpFacts = {
        revenueSharePercent: Math.round(settings.defaultRevenueShareBps / 100),
        payoutDayOfMonth: instructor?.payoutDayOfMonth ?? 1,
        minimumPayout: formatMoney(instructor?.minimumPayoutCents ?? 10000),
        supportEmail: settings.supportEmail,
    };

    return <InstructorHelp facts={facts} />;
};

export default InstructorHelpPage;
