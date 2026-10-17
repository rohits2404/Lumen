import { StatCard } from "@/components/dashboard/stat-card";
import { platformStatCards } from "@/lib/config/admin-overview";
import type { PlatformStats } from "@/lib/admin/overview";

function PlatformStatsRow({ stats }: { stats: PlatformStats }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {platformStatCards.map((card) => (
                <StatCard
                    key={card.key}
                    label={card.label}
                    icon={card.icon}
                    value={stats[card.key].value}
                    delta={stats[card.key].delta}
                    format={card.format}
                />
            ))}
        </div>
    );
}

export { PlatformStatsRow };
