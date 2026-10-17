import type { CouponsPage as CouponsPageData } from "@/lib/instructor-coupons";
import { CouponsBoard } from "./coupons-board";
import { CouponsStats } from "./coupons-stats";

function Coupons({
    page,
    revenueShareBps,
}: {
    page: CouponsPageData;
    revenueShareBps: number;
}) {
    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <CouponsBoard page={page} revenueShareBps={revenueShareBps}>
                <CouponsStats stats={page.stats} />
            </CouponsBoard>
        </main>
    );
}

export { Coupons };
