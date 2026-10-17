import { AuditLog } from "@/components/dashboard/admin/audit-log";
import { parseAuditQuery } from "@/lib/admin/audit-log";
import React from "react";

const AdminAuditLog = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const params = await searchParams;
    return <AuditLog query={parseAuditQuery(params)} />;
};

export default AdminAuditLog;
