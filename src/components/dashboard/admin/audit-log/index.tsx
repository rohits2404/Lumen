import { getAuditPage, type AuditQuery } from "@/lib/admin/audit-log";
import { AuditLogBrowser, AuditRow } from "./audit-log-browser";
import {
    adminAuditCopy,
    auditCategoryLabels,
    auditCategoryStyles,
    auditRoleBadge,
} from "@/lib/config/admin-audit";
import { formatAuditExact, formatAuditWhen } from "./audit-format";
import { AuditExportButton } from "./audit-export-button";

async function AuditLog({ query }: { query: AuditQuery }) {
    const page = await getAuditPage(query);

    const rows: AuditRow[] = page.entries.map((entry) => {
        const role = auditRoleBadge(entry.actorRole);
        return {
            id: entry.id,
            actorName: entry.actorName,
            actorImage: entry.actorImage,
            roleLabel: role.label,
            roleClass: role.className,
            action: entry.action,
            target: entry.targetLabel,
            targetType: entry.targetType,
            categoryLabel: auditCategoryLabels[entry.category],
            categoryClass: auditCategoryStyles[entry.category],
            when: formatAuditWhen(entry.createdAt, page.generatedAt.getTime()),
            exact: formatAuditExact(entry.createdAt),
            ip: entry.ipAddress,
            userAgent: entry.userAgent,
        };
    });

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-[32px] leading-none font-bold">
                        {adminAuditCopy.title}
                    </h1>
                    <p className="mt-2.5 text-[15px] text-muted-foreground">
                        {adminAuditCopy.description}
                    </p>
                </div>
                <AuditExportButton tab={query.tab} query={query.query} />
            </div>

            <AuditLogBrowser
                rows={rows}
                page={page}
                tab={query.tab}
                query={query.query}
            />
        </main>
    );
}

export { AuditLog };
