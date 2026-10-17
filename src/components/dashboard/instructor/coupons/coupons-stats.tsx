import {
    BanknoteIcon,
    PercentIcon,
    TicketPercentIcon,
    UsersIcon,
} from "lucide-react";

import { CountCard } from "@/components/dashboard/count-card";
import {
    formatCount,
    formatMoneyWhole,
} from "@/components/dashboard/instructor/coupons/coupons-format";
import { couponStats } from "@/lib/config/instructor-coupons";
import type { CouponsPage } from "@/lib/instructor-coupons";

function CouponsStats({ stats }: { stats: CouponsPage["stats"] }) {
    return (
        <>
            <CountCard
                icon={TicketPercentIcon}
                value={formatCount(stats.activeCount)}
                label={couponStats.active}
            />
            <CountCard
                icon={UsersIcon}
                value={formatCount(stats.redemptions)}
                label={couponStats.redemptions}
            />
            <CountCard
                icon={BanknoteIcon}
                value={formatMoneyWhole(stats.revenueCents)}
                label={couponStats.revenue}
            />
            <CountCard
                icon={PercentIcon}
                value={
                    stats.averageDiscount === null
                        ? "—"
                        : `${stats.averageDiscount}%`
                }
                label={couponStats.averageDiscount}
            />
        </>
    );
}

export { CouponsStats };
