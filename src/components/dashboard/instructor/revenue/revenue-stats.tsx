import { StatCard } from "@/components/dashboard/stat-card";
import { formatDelta } from "@/components/dashboard/stat-format";
import {
    revenueFootnotes,
    revenueStatCards,
} from "@/lib/config/instructor-revenue";
import type { RevenueStats as Stats } from "@/lib/instructor-revenue";

function RevenueStats({ stats }: { stats: Stats }) {
    const values: Record<
        (typeof revenueStatCards)[number]["key"],
        { value: number | null; footnote: string }
    > = {
        lifetime: {
            value: stats.lifetimeCents,
            footnote: revenueFootnotes.lifetime(stats.since),
        },
        thisMonth: {
            value: stats.thisMonthCents,
            footnote: revenueFootnotes.thisMonth(formatDelta(stats.monthDelta)),
        },
        pending: {
            value: stats.pendingCents,
            footnote: revenueFootnotes.pending(stats.clearsInDays),
        },
        perSale: {
            value: stats.perSaleCents,
            footnote: revenueFootnotes.perSale,
        },
    };

    return (
        <div className="mt-5 grid gap-4.5 sm:grid-cols-2 xl:grid-cols-4">
            {revenueStatCards.map((card) => (
                <StatCard
                    key={card.key}
                    label={card.label}
                    icon={card.icon}
                    value={values[card.key].value}
                    delta={null}
                    format="money"
                    footnote={values[card.key].footnote}
                />
            ))}
        </div>
    );
}

export { RevenueStats };
