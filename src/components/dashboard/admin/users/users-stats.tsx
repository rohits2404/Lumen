import { CountCard } from "@/components/dashboard/count-card";
import { userStatCards } from "@/lib/config/admin-users";
import type { UserStats } from "@/lib/admin/users";

const counts = new Intl.NumberFormat("en-US");

function UsersStats({ stats }: { stats: UserStats }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {userStatCards.map(({ key, label, icon }) => (
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

export { UsersStats };
