import { CommunityPage } from "@/components/dashboard/admin/community";
import { parseCommunityQuery } from "@/lib/admin/community";
import React from "react";

const AdminCommunityPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const params = await searchParams;
    return <CommunityPage query={parseCommunityQuery(params)} />;
};

export default AdminCommunityPage;
