import { Coupons } from "@/components/dashboard/instructor/coupons";
import { getPlatformSettings } from "@/lib/admin/settings";
import { getCouponsPage, parseCouponsQuery } from "@/lib/instructor-coupons";
import { notFound } from "next/navigation";
import React from "react";

const InstructorCouponsPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const params = await searchParams;
    const [page, settings] = await Promise.all([
        getCouponsPage(parseCouponsQuery(params)),
        getPlatformSettings(),
    ]);
    if (!page) notFound();

    return (
        <Coupons
            page={page}
            revenueShareBps={settings.defaultRevenueShareBps}
        />
    );
};

export default InstructorCouponsPage;
