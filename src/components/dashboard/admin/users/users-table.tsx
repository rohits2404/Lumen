"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { UserRowActions } from "@/components/dashboard/admin/users/user-row-actions";
import { UsersToolbar } from "@/components/dashboard/admin/users/users-toolbar";
import {
    adminUsersCopy,
    isUsersFiltered,
    showingLine,
    toggleableColumns,
    USERS_PAGE_SIZE,
    userPlanLabels,
    userRoleBadge,
    userStatusBadge,
    type ToggleableColumn,
} from "@/lib/config/admin-users";
import { setUserStatus } from "@/lib/actions/admin-users";
import type { UsersPage, UsersQuery, UserRow } from "@/lib/admin/users";
import { initialsOf } from "@/lib/user";
import { cn } from "@/lib/utils";

export type UsersTableRow = UserRow & { countryLabel: string | null };

const headClass = "h-10.5 px-5 text-[13px] font-normal text-muted-foreground";
const cellClass = "h-[61px] px-5";
const pillClass =
    "inline-flex rounded-full px-2.5 py-0.5 text-[13px] font-medium";

const INDETERMINATE = cn(
    "data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground",
    "[&_[data-slot=checkbox-indicator][data-indeterminate]]:hidden",
    "data-indeterminate:before:absolute data-indeterminate:before:h-[1.5px] data-indeterminate:before:w-2",
    "data-indeterminate:before:rounded-full data-indeterminate:before:bg-current data-indeterminate:before:content-['']",
);

const ALL_COLUMNS = Object.fromEntries(
    toggleableColumns.map((column) => [column.key, true]),
) as Record<ToggleableColumn, boolean>;

function UsersTable({
    rows,
    page,
    query,
}: {
    rows: UsersTableRow[];
    page: UsersPage;
    query: UsersQuery;
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [navigating, setNavigating] = React.useState(false);
    const [columns, setColumns] =
        React.useState<Record<ToggleableColumn, boolean>>(ALL_COLUMNS);
    const [selected, setSelected] = React.useState<string[]>([]);
    const [saving, startSaving] = React.useTransition();
    const [bulk, setBulk] = React.useState<"ACTIVE" | "SUSPENDED" | null>(null);

    const ids = React.useMemo(() => rows.map((row) => row.id), [rows]);
    const visible = selected.filter((id) => ids.includes(id));
    if (visible.length !== selected.length) setSelected(visible);

    const hrefFor = React.useCallback(
        (next: number) => {
            const params = new URLSearchParams(searchParams);
            if (next <= 1) params.delete("page");
            else params.set("page", String(next));
            const search = params.toString();
            return search ? `${pathname}?${search}` : pathname;
        },
        [pathname, searchParams],
    );

    function run(userIds: string[], status: "ACTIVE" | "SUSPENDED") {
        startSaving(async () => {
            const result = await setUserStatus(userIds, status);
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
            if (result.ok) setSelected([]);
            setBulk(null);
        });
    }

    function runBulk(userIds: string[], status: "ACTIVE" | "SUSPENDED") {
        setBulk(status);
        run(userIds, status);
    }

    const allChecked = rows.length > 0 && visible.length === rows.length;
    const pending = navigating || saving;
    const filtered = isUsersFiltered(query);

    return (
        <>
            <Card className="mt-6 gap-0 overflow-hidden ring-border [--card-spacing:0px]">
                <UsersToolbar
                    query={query}
                    counts={page.counts}
                    columns={columns}
                    onColumnsChange={setColumns}
                    pending={pending}
                    onPendingChange={setNavigating}
                />

                {visible.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-3 border-t border-border bg-soft px-5 py-3">
                        <p className="text-[13px] font-medium">
                            {visible.length} selected
                        </p>
                        <div className="ml-auto flex items-center gap-2">
                            <Button
                                variant="outline"
                                loading={bulk === "ACTIVE"}
                                disabled={saving}
                                onClick={() => runBulk(visible, "ACTIVE")}
                                className="h-9 bg-card shadow-sm"
                            >
                                {adminUsersCopy.bulkReactivate}
                            </Button>
                            <Button
                                variant="destructive"
                                loading={bulk === "SUSPENDED"}
                                disabled={saving}
                                onClick={() => runBulk(visible, "SUSPENDED")}
                                className="h-9"
                            >
                                {adminUsersCopy.bulkSuspend}
                            </Button>
                            <Button
                                variant="ghost"
                                disabled={saving}
                                onClick={() => setSelected([])}
                                className="h-9"
                            >
                                {adminUsersCopy.bulkClear}
                            </Button>
                        </div>
                    </div>
                ) : null}

                {rows.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 border-t border-border px-6 py-20 text-center">
                        <p className="text-base font-bold">
                            {adminUsersCopy.emptyTitle}
                        </p>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            {adminUsersCopy.emptyDescription}
                        </p>
                        {filtered ? (
                            <Button
                                variant="outline"
                                nativeButton={false}
                                className="mt-1 h-9 bg-card shadow-sm"
                                render={<Link href={pathname} />}
                            >
                                {adminUsersCopy.clearFilters}
                            </Button>
                        ) : null}
                    </div>
                ) : (
                    <div
                        className={cn(
                            "overflow-x-auto border-t border-border",
                            pending &&
                                "pointer-events-none opacity-60 transition-opacity",
                        )}
                    >
                        <Table className="min-w-245">
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead
                                        className={cn(headClass, "w-[3%]")}
                                    >
                                        <Checkbox
                                            checked={allChecked}
                                            indeterminate={
                                                visible.length > 0 &&
                                                !allChecked
                                            }
                                            onCheckedChange={(checked) =>
                                                setSelected(
                                                    checked === true ? ids : [],
                                                )
                                            }
                                            aria-label={
                                                adminUsersCopy.selectAllLabel
                                            }
                                            className={INDETERMINATE}
                                        />
                                    </TableHead>
                                    <TableHead
                                        className={cn(headClass, "w-[20%]")}
                                    >
                                        Name
                                    </TableHead>
                                    {columns.role ? (
                                        <TableHead
                                            className={cn(headClass, "w-[13%]")}
                                        >
                                            Role
                                        </TableHead>
                                    ) : null}
                                    {columns.plan ? (
                                        <TableHead
                                            className={cn(headClass, "w-[11%]")}
                                        >
                                            Plan
                                        </TableHead>
                                    ) : null}
                                    {columns.email ? (
                                        <TableHead
                                            className={cn(headClass, "w-[20%]")}
                                        >
                                            Email
                                        </TableHead>
                                    ) : null}
                                    {columns.country ? (
                                        <TableHead
                                            className={cn(headClass, "w-[13%]")}
                                        >
                                            Country
                                        </TableHead>
                                    ) : null}
                                    <TableHead
                                        className={cn(headClass, "w-[14%]")}
                                    >
                                        Status
                                    </TableHead>
                                    <TableHead
                                        className={cn(headClass, "w-[4%]")}
                                    >
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {rows.map((row) => {
                                    const role = userRoleBadge(row.role);
                                    const status = userStatusBadge(row.status);
                                    const checked = visible.includes(row.id);

                                    return (
                                        <TableRow
                                            key={row.id}
                                            data-state={
                                                checked ? "selected" : undefined
                                            }
                                            className="border-border-subtle data-[state=selected]:bg-soft"
                                        >
                                            <TableCell className={cellClass}>
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={(next) =>
                                                        setSelected(
                                                            (current) =>
                                                                next === true
                                                                    ? [
                                                                          ...current,
                                                                          row.id,
                                                                      ]
                                                                    : current.filter(
                                                                          (
                                                                              id,
                                                                          ) =>
                                                                              id !==
                                                                              row.id,
                                                                      ),
                                                        )
                                                    }
                                                    aria-label={adminUsersCopy.selectRowLabel(
                                                        row.name,
                                                    )}
                                                />
                                            </TableCell>

                                            <TableCell className={cellClass}>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="size-9">
                                                        <AvatarImage
                                                            src={
                                                                row.image ??
                                                                undefined
                                                            }
                                                            alt=""
                                                            referrerPolicy="no-referrer"
                                                        />
                                                        <AvatarFallback className="bg-hover text-[11px] font-semibold text-foreground">
                                                            {initialsOf(
                                                                row.name,
                                                                row.email,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="truncate text-[15px] font-semibold">
                                                        {row.name}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {columns.role ? (
                                                <TableCell
                                                    className={cellClass}
                                                >
                                                    <span
                                                        className={cn(
                                                            pillClass,
                                                            role.className,
                                                        )}
                                                    >
                                                        {role.label}
                                                    </span>
                                                </TableCell>
                                            ) : null}

                                            {columns.plan ? (
                                                <TableCell
                                                    className={cn(
                                                        cellClass,
                                                        "text-[15px]",
                                                    )}
                                                >
                                                    {userPlanLabels[row.plan]}
                                                </TableCell>
                                            ) : null}

                                            {columns.email ? (
                                                <TableCell
                                                    className={cn(
                                                        cellClass,
                                                        "text-[15px] text-muted-foreground",
                                                    )}
                                                >
                                                    {row.email}
                                                </TableCell>
                                            ) : null}

                                            {columns.country ? (
                                                <TableCell
                                                    className={cn(
                                                        cellClass,
                                                        "text-[15px] text-muted-foreground",
                                                    )}
                                                >
                                                    {row.countryLabel ?? "—"}
                                                </TableCell>
                                            ) : null}

                                            <TableCell className={cellClass}>
                                                <span
                                                    className={cn(
                                                        pillClass,
                                                        status.className,
                                                    )}
                                                >
                                                    {status.label}
                                                </span>
                                            </TableCell>

                                            <TableCell
                                                className={cn(
                                                    cellClass,
                                                    "text-right",
                                                )}
                                            >
                                                <UserRowActions
                                                    user={row}
                                                    pending={saving}
                                                    onSetStatus={(next) =>
                                                        run([row.id], next)
                                                    }
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </Card>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <p className="text-[13px] text-muted-foreground">
                    {showingLine({
                        page: page.page,
                        total: page.total,
                        rows: rows.length,
                        pageSize: USERS_PAGE_SIZE,
                    })}
                </p>

                {page.pageCount > 1 ? (
                    <Pagination className="mx-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href={hrefFor(page.page - 1)}
                                    className={cn(
                                        "bg-card",
                                        page.page <= 1 &&
                                            "pointer-events-none opacity-50",
                                    )}
                                />
                            </PaginationItem>
                            {pageWindow(page.page, page.pageCount).map(
                                (entry, index) =>
                                    entry === null ? (
                                        <PaginationItem key={`gap-${index}`}>
                                            <span className="px-2 text-sm text-muted-foreground">
                                                …
                                            </span>
                                        </PaginationItem>
                                    ) : (
                                        <PaginationItem key={entry}>
                                            <PaginationLink
                                                href={hrefFor(entry)}
                                                isActive={entry === page.page}
                                                className={cn(
                                                    entry === page.page
                                                        ? "border-transparent! bg-primary! text-primary-foreground! hover:bg-primary/80! hover:text-white!"
                                                        : "bg-card",
                                                )}
                                            >
                                                {entry}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ),
                            )}
                            <PaginationItem>
                                <PaginationNext
                                    href={hrefFor(page.page + 1)}
                                    className={cn(
                                        "bg-card",
                                        page.page >= page.pageCount &&
                                            "pointer-events-none opacity-50",
                                    )}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                ) : null}
            </div>
        </>
    );
}

function pageWindow(current: number, total: number): (number | null)[] {
    if (total <= 7) {
        return Array.from({ length: total }, (_, index) => index + 1);
    }

    const pages = new Set([1, total, current, current - 1, current + 1]);
    const sorted = [...pages]
        .filter((entry) => entry >= 1 && entry <= total)
        .sort((a, b) => a - b);

    const out: (number | null)[] = [];
    let previous = 0;
    for (const entry of sorted) {
        if (previous && entry - previous > 1) out.push(null);
        out.push(entry);
        previous = entry;
    }
    return out;
}

export { UsersTable };
