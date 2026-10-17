import { WalletIcon } from "lucide-react";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { BalanceCard } from "@/components/dashboard/instructor/revenue/balance-card";
import { EarningsByCourseCard } from "@/components/dashboard/instructor/revenue/earnings-by-course-card";
import { EarningsChartCard } from "@/components/dashboard/instructor/revenue/earnings-chart-card";
import { PayoutHistoryCard } from "@/components/dashboard/instructor/revenue/payout-history-card";
import { RevenueStats } from "@/components/dashboard/instructor/revenue/revenue-stats";
import { revenueCopy } from "@/lib/config/instructor-revenue";
import type { RevenuePage as RevenuePageData } from "@/lib/instructor-revenue";

function RevenuePage({ page }: { page: RevenuePageData }) {
    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <div className="min-w-0">
                <h1 className="text-[32px] leading-none font-bold">
                    {revenueCopy.title}
                </h1>
                <p className="mt-2.5 text-[15px] text-muted-foreground">
                    {revenueCopy.description}
                </p>
            </div>

            {page.hasCourses ? (
                <>
                    <div className="mt-6 grid items-start gap-5 lg:grid-cols-[0.9fr_1fr]">
                        <BalanceCard
                            availableCents={page.availableCents}
                            nextPayoutOn={page.nextPayoutOn}
                            method={page.primaryMethod}
                            payoutDayOfMonth={page.payoutDayOfMonth}
                        />
                        <EarningsChartCard series={page.series} />
                    </div>

                    <RevenueStats stats={page.stats} />

                    <div className="mt-5">
                        <EarningsByCourseCard
                            rows={page.byCourse}
                            totalCents={page.stats.thisMonthCents}
                        />
                    </div>

                    <div className="mt-5">
                        <PayoutHistoryCard rows={page.payouts} />
                    </div>
                </>
            ) : (
                <Empty className="mt-6 rounded-xl bg-card py-16 ring-1 ring-border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <WalletIcon />
                        </EmptyMedia>
                        <EmptyTitle>{revenueCopy.empty.title}</EmptyTitle>
                        <EmptyDescription>
                            {revenueCopy.empty.description}
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}
        </main>
    );
}

export { RevenuePage };
