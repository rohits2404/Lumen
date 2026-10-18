"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { FlameIcon, PlusIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import {
    PromotionDialog,
    type PromotionDialogValues,
} from "@/components/dashboard/admin/promotions/promotion-dialog";
import {
    createPromotion,
    endPromotion,
    setInstructorPromotionOptIn,
    updatePromotion,
    type PromotionInput,
} from "@/lib/actions/admin-promotions";
import {
    adminPromotionsCopy,
    participationPill,
    PARTICIPATION_PAGE_SIZE,
    promotionStatePill,
} from "@/lib/config/admin-promotions";
import type {
    ParticipationRow,
    PromotionCategory,
} from "@/lib/admin/promotions";
import { cn } from "@/lib/utils";

export type ParticipationCardRow = ParticipationRow & { initials: string };

export type PromotionCardRow = {
    id: string;
    name: string;
    live: boolean;
    meta: string;
    redemptions: string;
    revenue: string;
    coursesIncluded: string;
    coursesOptedOut: string;
    form: PromotionDialogValues;
};

function PromotionsBoard({
    active,
    participation,
    categories,
    page,
    pageCount,
    total,
    children,
}: {
    active: PromotionCardRow[];
    participation: ParticipationCardRow[];
    categories: PromotionCategory[];
    page: number;
    pageCount: number;
    total: number;
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [, startSaving] = React.useTransition();

    const [busy, setBusy] = React.useState<
        | { kind: "submit" }
        | { kind: "end"; id: string }
        | { kind: "toggle"; id: string }
        | null
    >(null);

    const [dialog, setDialog] = React.useState<{
        mode: "create" | "edit";
        promotion: PromotionCardRow | null;
    } | null>(null);

    const [rows, applyToggle] = React.useOptimistic(
        participation,
        (current, update: { instructorId: string; participating: boolean }) =>
            current.map((row) =>
                row.instructorId === update.instructorId
                    ? { ...row, participating: update.participating }
                    : row,
            ),
    );

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

    function run(
        what: NonNullable<typeof busy>,
        action: () => Promise<{ ok: boolean; message: string }>,
        onDone?: () => void,
    ) {
        setBusy(what);
        startSaving(async () => {
            const result = await action();
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
            setBusy(null);
            if (result.ok) onDone?.();
        });
    }

    function submitPromotion(input: PromotionInput) {
        const target = dialog;
        if (!target) return;
        run(
            { kind: "submit" },
            () =>
                target.mode === "edit" && target.promotion
                    ? updatePromotion(target.promotion.id, input)
                    : createPromotion(input),
            () => setDialog(null),
        );
    }

    function toggleParticipation(
        row: ParticipationCardRow,
        participating: boolean,
    ) {
        setBusy({ kind: "toggle", id: row.instructorId });
        startSaving(async () => {
            applyToggle({ instructorId: row.instructorId, participating });
            const result = await setInstructorPromotionOptIn(
                row.instructorId,
                participating,
            );
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
            setBusy(null);
        });
    }

    const from = (page - 1) * PARTICIPATION_PAGE_SIZE + 1;

    return (
        <>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-[32px] leading-none font-bold">
                        {adminPromotionsCopy.title}
                    </h1>
                    <p className="mt-2.5 text-[15px] text-muted-foreground">
                        {adminPromotionsCopy.description}
                    </p>
                </div>
                <Button
                    onClick={() =>
                        setDialog({ mode: "create", promotion: null })
                    }
                    className="h-10 gap-2 px-4"
                >
                    <PlusIcon className="size-4" />
                    {adminPromotionsCopy.newPromotion}
                </Button>
            </div>

            {active.length === 0 ? (
                <Card className="mt-5 items-center gap-3 px-6 py-16 text-center ring-border">
                    <p className="text-base font-bold">
                        {adminPromotionsCopy.activeEmptyTitle}
                    </p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        {adminPromotionsCopy.activeEmptyDescription}
                    </p>
                </Card>
            ) : (
                <div className="mt-5 flex flex-col gap-4">
                    {active.map((promotion) => {
                        const pill = promotionStatePill(promotion.live);
                        return (
                            <Card
                                key={promotion.id}
                                className="ring-2 ring-success [--card-spacing:0px]"
                            >
                                <div className="bg-success/5 px-6.5 py-6">
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                                        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-success">
                                            <FlameIcon
                                                aria-hidden
                                                className="size-5 text-white"
                                                strokeWidth={2}
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h2 className="truncate text-xl leading-6 font-bold">
                                                    {promotion.name}
                                                </h2>
                                                <span
                                                    className={cn(
                                                        "inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-[0.06em] uppercase",
                                                        pill.className,
                                                    )}
                                                >
                                                    {pill.label}
                                                </span>
                                            </div>
                                            <p className="truncate text-[15px] leading-5 text-muted-foreground">
                                                {promotion.meta}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setDialog({
                                                        mode: "edit",
                                                        promotion,
                                                    })
                                                }
                                                className="h-9 bg-card px-4 shadow-sm"
                                            >
                                                {adminPromotionsCopy.edit}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                loading={
                                                    busy?.kind === "end" &&
                                                    busy.id === promotion.id
                                                }
                                                onClick={() =>
                                                    run(
                                                        {
                                                            kind: "end",
                                                            id: promotion.id,
                                                        },
                                                        () =>
                                                            endPromotion(
                                                                promotion.id,
                                                            ),
                                                    )
                                                }
                                                className="h-9 bg-card px-4 text-destructive shadow-sm hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                {promotion.live
                                                    ? adminPromotionsCopy.endSale
                                                    : adminPromotionsCopy.cancelSale}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="mt-5.5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                        {(
                                            [
                                                [
                                                    promotion.redemptions,
                                                    adminPromotionsCopy
                                                        .heroStats.redemptions,
                                                ],
                                                [
                                                    promotion.revenue,
                                                    adminPromotionsCopy
                                                        .heroStats.revenue,
                                                ],
                                                [
                                                    promotion.coursesIncluded,
                                                    adminPromotionsCopy
                                                        .heroStats.included,
                                                ],
                                                [
                                                    promotion.coursesOptedOut,
                                                    adminPromotionsCopy
                                                        .heroStats.optedOut,
                                                ],
                                            ] as const
                                        ).map(([value, label]) => (
                                            <Card
                                                key={label}
                                                className="p-4.5 py-3.5 ring-border"
                                            >
                                                <div>
                                                    <p className="text-[21px] leading-6 font-extrabold tracking-[-0.02em] tabular-nums">
                                                        {value}
                                                    </p>
                                                    <p className="text-[15px] leading-4 text-muted-foreground">
                                                        {label}
                                                    </p>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            <h2 className="mt-7 text-xl font-bold">
                {adminPromotionsCopy.participationHeading}
            </h2>
            <p className="mt-0.5 text-[15px] text-muted-foreground">
                {adminPromotionsCopy.participationLead}
            </p>

            {rows.length === 0 ? (
                <Card className="mt-4 items-center gap-3 px-6 py-16 text-center ring-border">
                    <p className="text-base font-bold">
                        {adminPromotionsCopy.participationEmptyTitle}
                    </p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        {adminPromotionsCopy.participationEmptyDescription}
                    </p>
                </Card>
            ) : (
                <div className="mt-4 flex flex-col gap-3.5">
                    {rows.map((row) => {
                        const pill = participationPill(row.participating);
                        const switchId = `participation-${row.instructorId}`;
                        return (
                            <Card
                                key={row.instructorId}
                                className="ring-border [--card-spacing:0px]"
                            >
                                <div className="flex min-h-17.5 flex-wrap items-center gap-x-4 gap-y-3 px-4.5 py-3">
                                    <Avatar className="size-9.5 shrink-0">
                                        <AvatarImage
                                            src={row.imageUrl ?? undefined}
                                            alt=""
                                            referrerPolicy="no-referrer"
                                        />
                                        <AvatarFallback className="bg-hover text-xs font-semibold text-foreground">
                                            {row.initials}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[17px] leading-5 font-bold">
                                            {row.name}
                                        </p>
                                        <p className="truncate text-[15px] leading-5 text-muted-foreground tabular-nums">
                                            {adminPromotionsCopy.courses(
                                                row.courseCount,
                                            )}{" "}
                                            ·{" "}
                                            {adminPromotionsCopy.students(
                                                row.studentsCount,
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-4">
                                        <label
                                            htmlFor={switchId}
                                            className={cn(
                                                "inline-flex cursor-pointer rounded-full px-2.5 py-0.5 text-[13px] font-medium",
                                                pill.className,
                                            )}
                                        >
                                            {pill.label}
                                        </label>
                                        <Switch
                                            id={switchId}
                                            checked={row.participating}
                                            disabled={
                                                busy?.kind === "toggle" &&
                                                busy.id === row.instructorId
                                            }
                                            onCheckedChange={(next) =>
                                                toggleParticipation(row, next)
                                            }
                                            aria-label={adminPromotionsCopy.participationToggleLabel(
                                                row.name,
                                            )}
                                            className={cn(
                                                "border-0 p-0.75 data-[size=default]:h-6.5 data-[size=default]:w-11.5",
                                                "data-unchecked:bg-track dark:data-unchecked:bg-track",
                                                "**:data-[slot=switch-thumb]:size-5",
                                                "**:data-[slot=switch-thumb]:data-checked:translate-x-full",
                                            )}
                                        />
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {pageCount > 1 ? (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-[13px] text-muted-foreground">
                        {adminPromotionsCopy.showing(
                            from,
                            from + rows.length - 1,
                            total,
                        )}
                    </p>
                    <Pagination className="mx-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href={hrefFor(page - 1)}
                                    className={cn(
                                        "bg-card",
                                        page <= 1 &&
                                            "pointer-events-none opacity-50",
                                    )}
                                />
                            </PaginationItem>
                            {Array.from(
                                { length: pageCount },
                                (_, index) => index + 1,
                            ).map((entry) => (
                                <PaginationItem key={entry}>
                                    <PaginationLink
                                        href={hrefFor(entry)}
                                        isActive={entry === page}
                                        className={cn(
                                            entry === page
                                                ? "border-transparent! bg-primary! text-primary-foreground! hover:bg-primary/80! hover:text-white!"
                                                : "bg-card",
                                        )}
                                    >
                                        {entry}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    href={hrefFor(page + 1)}
                                    className={cn(
                                        "bg-card",
                                        page >= pageCount &&
                                            "pointer-events-none opacity-50",
                                    )}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            ) : null}

            {children}

            <PromotionDialog
                open={dialog !== null}
                onOpenChange={(next) => {
                    if (!next) setDialog(null);
                }}
                mode={dialog?.mode ?? "create"}
                targetId={dialog?.promotion?.id}
                values={dialog?.promotion?.form ?? null}
                categories={categories}
                pending={busy?.kind === "submit"}
                onSubmit={submitPromotion}
            />
        </>
    );
}

export { PromotionsBoard };
