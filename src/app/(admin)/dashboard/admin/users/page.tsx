import { UsersPage } from "@/components/dashboard/admin/users/users-page";
import { parseUsersQuery } from "@/lib/admin/users";
import React from "react";

const AdminUsersPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const params = await searchParams;
    return <UsersPage query={parseUsersQuery(params)} />;
};

export default AdminUsersPage;
