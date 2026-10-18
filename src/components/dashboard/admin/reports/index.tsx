import { PayoutRunsCard } from "@/components/dashboard/admin/reports/payout-runs-card";
import { ReportsStatsRow } from "@/components/dashboard/admin/reports/reports-stats";
import { RevenueChartCard } from "@/components/dashboard/admin/reports/revenue-chart-card";
import {
    getPayoutRuns,
    getReportStats,
    getRevenueByMonth,
} from "@/lib/admin/reports";
import { adminReportsCopy } from "@/lib/config/admin-reports";

async function ReportsPage() {
    const [stats, revenue, runs] = await Promise.all([
        getReportStats(),
        getRevenueByMonth(),
        getPayoutRuns(),
    ]);

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <h1 className="text-[32px] leading-none font-bold">
                {adminReportsCopy.title}
            </h1>
            <p className="mt-2.5 text-[15px] text-muted-foreground">
                {adminReportsCopy.description}
            </p>

            <div className="mt-6 flex flex-col gap-4">
                <ReportsStatsRow stats={stats} />
                <RevenueChartCard series={revenue} />
                <PayoutRunsCard runs={runs} />
            </div>
        </main>
    );
}

export { ReportsPage };
