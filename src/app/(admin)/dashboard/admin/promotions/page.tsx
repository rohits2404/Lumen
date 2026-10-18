import { PromotionsPage } from "@/components/dashboard/admin/promotions";
import { parsePromotionsQuery } from "@/lib/admin/promotions";
import React from "react";

const AdminPromotionsPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const params = await searchParams;
    return <PromotionsPage query={parsePromotionsQuery(params)} />;
};

export default AdminPromotionsPage;
