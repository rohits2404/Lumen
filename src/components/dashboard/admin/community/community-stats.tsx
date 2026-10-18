import { CountCard } from "@/components/dashboard/count-card";
import { communityStatCards } from "@/lib/config/admin-community";
import type { CommunityStats as Stats } from "@/lib/admin/community";

const counts = new Intl.NumberFormat("en-US");

function CommunityStats({ stats }: { stats: Stats }) {
    return (
        <div className="grid gap-4.5 sm:grid-cols-2 xl:grid-cols-4">
            {communityStatCards.map(({ key, label, icon }) => (
                <CountCard
                    key={key}
                    icon={icon}
                    value={counts.format(stats[key])}
                    label={label}
                />
            ))}
        </div>
    );
}

export { CommunityStats };
