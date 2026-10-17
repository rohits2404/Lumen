"use client";

import * as React from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/toast";
import {
    CategoryDialog,
    type CategoryDialogValues,
} from "@/components/dashboard/admin/categories/category-dialog";
import { CategoryRowActions } from "@/components/dashboard/admin/categories/category-row-actions";
import { DeleteCategoryDialog } from "@/components/dashboard/admin/categories/delete-category-dialog";
import {
    createCategory,
    deleteCategory,
    updateCategory,
    type CategoryInput,
} from "@/lib/actions/admin-categories";
import {
    adminCategoriesCopy,
    categoryAccent,
    categoryAccentClasses,
} from "@/lib/config/admin-categories";
import { FALLBACK_CATEGORY_ICON } from "@/lib/config/admin-overview";
import type { CategoryRow } from "@/lib/admin/categories";
import { cn } from "@/lib/utils";

function CategoriesList({ rows }: { rows: CategoryRow[] }) {
    const [saving, startSaving] = React.useTransition();
    const [editing, setEditing] = React.useState<
        { mode: "create" } | { mode: "edit"; row: CategoryRow } | null
    >(null);
    const [deleting, setDeleting] = React.useState<CategoryRow | null>(null);

    function save(input: CategoryInput) {
        const target = editing;
        if (!target) return;
        startSaving(async () => {
            const result =
                target.mode === "create"
                    ? await createCategory(input)
                    : await updateCategory(target.row.id, input);
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
            if (result.ok) setEditing(null);
        });
    }

    function confirmDelete() {
        const row = deleting;
        if (!row) return;
        startSaving(async () => {
            const result = await deleteCategory(row.id);
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
            setDeleting(null);
        });
    }

    const Icon = FALLBACK_CATEGORY_ICON;

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-[32px] leading-none font-bold">
                        {adminCategoriesCopy.title}
                    </h1>
                    <p className="mt-2.5 text-[15px] text-muted-foreground">
                        {adminCategoriesCopy.description}
                    </p>
                </div>

                <Button
                    onClick={() => setEditing({ mode: "create" })}
                    className="h-10 gap-2 px-4"
                >
                    <PlusIcon className="size-4" />
                    {adminCategoriesCopy.newLabel}
                </Button>
            </div>

            {rows.length === 0 ? (
                <Card className="mt-6 items-center gap-3 px-6 py-20 text-center ring-border">
                    <p className="text-base font-bold">
                        {adminCategoriesCopy.emptyTitle}
                    </p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        {adminCategoriesCopy.emptyDescription}
                    </p>
                </Card>
            ) : (
                <div
                    className={cn(
                        "mt-6 flex flex-col gap-3.5",
                        saving &&
                            "pointer-events-none opacity-60 transition-opacity",
                    )}
                >
                    {rows.map((row) => {
                        const accent =
                            categoryAccentClasses[
                                categoryAccent(row.accentColor)
                            ];

                        return (
                            <Card
                                key={row.id}
                                className="h-18 flex-row items-center gap-4 px-4.5 ring-border"
                            >
                                <div
                                    aria-hidden
                                    className={cn(
                                        "grid size-10 shrink-0 place-items-center rounded-lg",
                                        accent.tile,
                                    )}
                                >
                                    <Icon
                                        className={cn("size-4", accent.icon)}
                                    />
                                </div>

                                <h2 className="min-w-0 flex-1 truncate text-base font-bold">
                                    {row.name}
                                </h2>

                                <p className="hidden w-27.5 shrink-0 text-[15px] text-muted-foreground xl:block">
                                    {adminCategoriesCopy.courses(
                                        row.courseCount,
                                    )}
                                </p>
                                <p className="hidden w-32.5 shrink-0 text-[15px] text-muted-foreground xl:block">
                                    {adminCategoriesCopy.students(
                                        row.studentCount,
                                    )}
                                </p>

                                <Progress
                                    value={row.share}
                                    aria-label={`${row.name} share of enrolments`}
                                    className={cn(
                                        "w-47.5 shrink-0",
                                        "**:data-[slot=progress-track]:h-2 **:data-[slot=progress-track]:bg-track",
                                        accent.bar,
                                    )}
                                />
                                <span className="w-10.5 shrink-0 text-right text-[15px] font-semibold tabular-nums">
                                    {row.share}%
                                </span>

                                <CategoryRowActions
                                    name={row.name}
                                    courseCount={row.courseCount}
                                    childCount={row.childCount}
                                    pending={saving}
                                    onEdit={() =>
                                        setEditing({ mode: "edit", row })
                                    }
                                    onDelete={() => setDeleting(row)}
                                />
                            </Card>
                        );
                    })}
                </div>
            )}

            <CategoryDialog
                open={editing !== null}
                onOpenChange={(open) => {
                    if (!open) setEditing(null);
                }}
                mode={editing?.mode ?? "create"}
                targetId={editing?.mode === "edit" ? editing.row.id : undefined}
                values={
                    editing?.mode === "edit"
                        ? toDialogValues(editing.row)
                        : null
                }
                pending={saving}
                onSubmit={save}
            />

            <DeleteCategoryDialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleting(null);
                }}
                name={deleting?.name ?? ""}
                pending={saving}
                onConfirm={confirmDelete}
            />
        </>
    );
}

function toDialogValues(row: CategoryRow): CategoryDialogValues {
    return {
        name: row.name,
        description: row.description ?? "",
        accentColor: row.accentColor,
        showInNav: row.showInNav,
    };
}

export { CategoriesList };
