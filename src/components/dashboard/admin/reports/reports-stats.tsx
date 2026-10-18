import { StatCard } from "@/components/dashboard/stat-card";
import { reportStatCards } from "@/lib/config/admin-reports";
import type { ReportStats } from "@/lib/admin/reports";

function ReportsStatsRow({ stats }: { stats: ReportStats }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {reportStatCards.map((card) => (
                <StatCard
                    key={card.key}
                    label={card.label}
                    icon={card.icon}
                    value={stats[card.key].value}
                    delta={stats[card.key].delta}
                    format={card.format}
                    arrow
                />
            ))}
        </div>
    );
}

export { ReportsStatsRow };
