"use client";

import * as React from "react";
import { CalendarClockIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { PayoutMethodDialog } from "@/components/dashboard/instructor/settings/payout-method-dialog";
import { PayoutMethodRow } from "@/components/dashboard/instructor/settings/payout-method-row";
import {
    formatMoney,
    ordinal,
} from "@/components/dashboard/instructor/settings/payouts-format";
import {
    removePayoutMethod,
    savePayoutMethod,
    updatePayoutPreferences,
    type PayoutMethodFieldErrors,
    type PayoutMethodInput,
} from "@/lib/actions/instructor-payouts";
import {
    MAX_PAYOUT_METHODS,
    payoutSettingsCopy,
} from "@/lib/config/instructor-payouts";
import type { PayoutSettings } from "@/lib/instructor-payouts";
import { cn } from "@/lib/utils";

const HEADING = "text-[15px] font-bold";

const SWITCH = cn(
    "border-0 p-[3px] data-[size=default]:h-6.5 data-[size=default]:w-11.5",
    "data-unchecked:bg-track dark:data-unchecked:bg-track",
    "[&_[data-slot=switch-thumb]]:size-5",
    "[&_[data-slot=switch-thumb]]:data-checked:translate-x-full",
);

type Busy = { kind: "method" | "remove" | "preferences" } | null;

function PayoutSettingsForm({ settings }: { settings: PayoutSettings }) {
    const [receipt, setReceipt] = React.useState(settings.emailPayoutReceipt);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [errors, setErrors] = React.useState<PayoutMethodFieldErrors>({});
    const [busy, setBusy] = React.useState<Busy>(null);
    const [, startTransition] = React.useTransition();

    const copy = payoutSettingsCopy;
    const { methods } = settings;
    const editing = methods.find((method) => method.id === editingId) ?? null;
    const atLimit = methods.length >= MAX_PAYOUT_METHODS;

    function openCreate() {
        setEditingId(null);
        setErrors({});
        setDialogOpen(true);
    }

    function openEdit(id: string) {
        setEditingId(id);
        setErrors({});
        setDialogOpen(true);
    }

    function submitMethod(input: PayoutMethodInput) {
        setBusy({ kind: "method" });
        startTransition(async () => {
            const result = await savePayoutMethod(
                input,
                editingId ?? undefined,
            );
            setBusy(null);
            setErrors(result.errors ?? {});
            if (result.ok || !result.errors) setDialogOpen(false);
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
        });
    }

    function removeMethod() {
        if (!editingId) return;
        setBusy({ kind: "remove" });
        startTransition(async () => {
            const result = await removePayoutMethod(editingId);
            setBusy(null);
            setDialogOpen(false);
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
        });
    }

    function savePreferences(event: React.FormEvent) {
        event.preventDefault();
        setBusy({ kind: "preferences" });
        startTransition(async () => {
            const result = await updatePayoutPreferences(receipt);
            setBusy(null);
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
        });
    }

    return (
        <div>
            <h2 className="text-xl font-bold">{copy.title}</h2>
            <p className="mt-2 max-w-145 text-[15px] leading-6 text-muted-foreground">
                {copy.description}
            </p>

            <h3 className={cn("mt-8", HEADING)}>{copy.methodsHeading}</h3>

            {methods.length > 0 ? (
                <div className="mt-3.5 flex flex-col gap-3.5">
                    {methods.map((method) => (
                        <PayoutMethodRow
                            key={method.id}
                            method={method}
                            onEdit={() => openEdit(method.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="mt-3.5 rounded-xl bg-background px-5 py-6">
                    <p className="text-[15px] leading-5 font-semibold">
                        {copy.emptyTitle}
                    </p>
                    <p className="mt-1 text-[13px] leading-4.5 text-muted-foreground">
                        {copy.emptyDescription}
                    </p>
                </div>
            )}

            <Button
                type="button"
                variant="outline"
                onClick={openCreate}
                disabled={atLimit}
                title={
                    atLimit
                        ? `You can keep up to ${MAX_PAYOUT_METHODS} payout methods.`
                        : undefined
                }
                className="mt-4 h-10 border-dashed bg-card px-4 text-sm"
            >
                <PlusIcon className="size-4" />
                {copy.addMethod}
            </Button>

            <h3 className={cn("mt-8", HEADING)}>{copy.scheduleHeading}</h3>

            <div className="mt-4 flex h-18 items-center gap-4 rounded-xl bg-background px-5">
                <span
                    aria-hidden
                    className="grid size-9.5 shrink-0 place-items-center rounded-xl bg-hover"
                >
                    <CalendarClockIcon className="size-4.5 text-foreground/80" />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] leading-5 font-semibold">
                        {`Monthly on the ${ordinal(settings.payoutDayOfMonth)} · minimum ${formatMoney(settings.minimumPayoutCents)}`}
                    </p>
                    <p className="truncate text-[13px] leading-4.5 text-muted-foreground">
                        {`Balances under ${formatMoney(settings.minimumPayoutCents)} roll over to the next payout.`}
                    </p>
                </div>
                <span className="hidden h-5.5 shrink-0 items-center rounded-full bg-hover px-3 text-[13px] font-medium text-muted-foreground sm:inline-flex">
                    {copy.scheduleFixed}
                </span>
            </div>

            <form onSubmit={savePreferences}>
                <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border px-5 py-4">
                    <div className="min-w-0">
                        <Label
                            htmlFor="payout-receipt"
                            className="cursor-pointer text-base leading-5 font-semibold"
                        >
                            {copy.receiptTitle}
                        </Label>
                        <p className="mt-1 text-[13px] leading-4.5 text-muted-foreground">
                            {copy.receiptDescription}
                        </p>
                    </div>
                    <Switch
                        id="payout-receipt"
                        checked={receipt}
                        onCheckedChange={setReceipt}
                        className={SWITCH}
                    />
                </div>

                <Button
                    type="submit"
                    loading={busy?.kind === "preferences"}
                    className="mt-6.5 h-10 px-5"
                >
                    {copy.submit}
                </Button>
            </form>

            <PayoutMethodDialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) setErrors({});
                }}
                mode={editing ? "edit" : "create"}
                targetId={editing?.id}
                values={
                    editing
                        ? {
                              type: editing.type,
                              label: editing.label,
                              last4: editing.last4 ?? "",
                              currency: editing.currency,
                              primary: editing.role === "PRIMARY",
                          }
                        : null
                }
                errors={errors}
                pending={busy?.kind === "method" || busy?.kind === "remove"}
                isOnlyMethod={
                    editing ? methods.length === 1 : methods.length === 0
                }
                onSubmit={submitMethod}
                onRemove={removeMethod}
            />
        </div>
    );
}

export { PayoutSettingsForm };
