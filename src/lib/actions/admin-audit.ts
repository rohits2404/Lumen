"use server";

import {
    AUDIT_EXPORT_LIMIT,
    getAuditExport,
    parseAuditQuery,
    type AuditQuery,
} from "@/lib/admin/audit-log";
import { getSession } from "@/lib/auth";

function cell(value: string | null) {
    return `"${(value ?? "").replaceAll('"', '""')}"`;
}

export async function exportAuditLog(input: {
    tab?: string;
    q?: string;
}): Promise<
    | {
          ok: true;
          csv: string;
          filename: string;
          rows: number;
          truncated: boolean;
      }
    | { ok: false; message: string }
> {
    const session = await getSession();
    if (session?.user.role !== "admin") {
        return {
            ok: false,
            message: "You do not have access to the audit log.",
        };
    }

    const parsed: AuditQuery = parseAuditQuery(input);
    const entries = await getAuditExport(parsed);

    const header = [
        "Timestamp (UTC)",
        "Member",
        "Role",
        "Action",
        "Target",
        "Target type",
        "Category",
        "IP address",
    ];

    const csv = [
        header.map((label) => cell(label)).join(","),
        ...entries.map((entry) =>
            [
                cell(entry.createdAt.toISOString()),
                cell(entry.actorName),
                cell(entry.actorRole ?? "system"),
                cell(entry.action),
                cell(entry.targetLabel),
                cell(entry.targetType),
                cell(entry.category),
                cell(entry.ipAddress),
            ].join(","),
        ),
    ].join("\n");

    const scope = parsed.tab === "all" ? "all" : parsed.tab;
    const stamp = new Date().toISOString().slice(0, 10);

    return {
        ok: true,
        csv,
        filename: `lumen-audit-log-${scope}-${stamp}.csv`,
        rows: entries.length,
        truncated: entries.length === AUDIT_EXPORT_LIMIT,
    };
}
