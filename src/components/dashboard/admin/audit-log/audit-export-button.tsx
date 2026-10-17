"use client";

import * as React from "react";
import { DownloadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { exportAuditLog } from "@/lib/actions/admin-audit";
import { adminAuditCopy } from "@/lib/config/admin-audit";
import type { AuditTab } from "@/lib/admin/audit-log";

function AuditExportButton({ tab, query }: { tab: AuditTab; query: string }) {
    const [pending, setPending] = React.useState(false);

    async function run() {
        setPending(true);
        try {
            const result = await exportAuditLog({ tab, q: query });

            if (!result.ok) {
                toast.add({ title: result.message, type: "error" });
                return;
            }

            const url = URL.createObjectURL(
                new Blob([result.csv], { type: "text/csv;charset=utf-8" }),
            );
            const link = document.createElement("a");
            link.href = url;
            link.download = result.filename;
            link.click();
            URL.revokeObjectURL(url);

            toast.add({
                title: result.truncated
                    ? `Exported the first ${result.rows.toLocaleString()} entries`
                    : `Exported ${result.rows.toLocaleString()} ${
                          result.rows === 1 ? "entry" : "entries"
                      }`,
                type: result.truncated ? "warning" : "success",
            });
        } catch {
            toast.add({
                title: "The Export Could Not Be Built.",
                type: "error",
            });
        } finally {
            setPending(false);
        }
    }

    return (
        <Button
            variant="outline"
            onClick={run}
            loading={pending}
            className="h-10 gap-2 bg-card px-4 shadow-sm"
        >
            <DownloadIcon className="size-4" />
            {adminAuditCopy.exportLabel}
        </Button>
    );
}

export { AuditExportButton };
