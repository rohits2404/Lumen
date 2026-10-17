"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { adminAuditCopy, auditTabs } from "@/lib/config/admin-audit";
import type { AuditPage, AuditTab } from "@/lib/admin/audit-log";

const SEARCH_DEBOUNCE_MS = 300;

function AuditLogFilters({
    tab,
    query,
    counts,
    pending,
    onPendingChange,
}: {
    tab: AuditTab;
    query: string;
    counts: AuditPage["counts"];
    pending: boolean;
    onPendingChange: (pending: boolean) => void;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = React.useTransition();

    const [value, setValue] = React.useState(query);
    const [lastQuery, setLastQuery] = React.useState(query);
    if (query !== lastQuery) {
        setLastQuery(query);
        setValue(query);
    }

    React.useEffect(
        () => onPendingChange(isPending),
        [isPending, onPendingChange],
    );

    const push = React.useCallback(
        (changes: Record<string, string | null>) => {
            const params = new URLSearchParams(searchParams);
            for (const [key, next] of Object.entries(changes)) {
                if (next === null || next === "") params.delete(key);
                else params.set(key, next);
            }
            params.delete("page");

            const search = params.toString();
            startTransition(() => {
                router.replace(search ? `${pathname}?${search}` : pathname, {
                    scroll: false,
                });
            });
        },
        [pathname, router, searchParams],
    );

    React.useEffect(() => {
        if (value === query) return;
        const timer = setTimeout(
            () => push({ q: value || null }),
            SEARCH_DEBOUNCE_MS,
        );
        return () => clearTimeout(timer);
    }, [value, query, push]);

    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <ToggleGroup
                value={[tab]}
                onValueChange={(next: string[]) => {
                    const chosen = next[0];
                    if (!chosen || chosen === tab) return;
                    push({ tab: chosen === "all" ? null : chosen });
                }}
                aria-label="Filter audit entries by category"
                className="gap-0 rounded-lg bg-track p-1"
            >
                {auditTabs.map((entry) => (
                    <ToggleGroupItem
                        key={entry.value}
                        value={entry.value}
                        size="lg"
                        className="gap-2 rounded-md px-4 text-muted-foreground aria-pressed:bg-primary aria-pressed:font-semibold aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary"
                    >
                        {entry.label}
                        <span className="text-subtle-foreground tabular-nums group-aria-pressed/toggle:text-primary-foreground/70">
                            {counts[entry.value]}
                        </span>
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>

            <div className="relative">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle-foreground" />
                <Input
                    type="search"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder={adminAuditCopy.searchPlaceholder}
                    aria-label={adminAuditCopy.searchPlaceholder}
                    className="h-10 w-70 rounded-lg bg-card pr-10 pl-10 text-sm sm:w-[320px]"
                />
                <div className="absolute top-1/2 right-2.5 -translate-y-1/2">
                    {pending || isPending ? (
                        <Spinner className="size-4 text-subtle-foreground" />
                    ) : value ? (
                        <button
                            type="button"
                            onClick={() => {
                                setValue("");
                                push({ q: null });
                            }}
                            aria-label="Clear search"
                            className="grid size-5 cursor-pointer place-items-center rounded-full text-subtle-foreground transition-colors hover:bg-hover hover:text-foreground"
                        >
                            <XIcon className="size-3.5" />
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export { AuditLogFilters };
