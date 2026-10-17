"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    PAYOUT_LABEL_MAX_LENGTH,
    PAYOUT_LAST4_LENGTH,
    payoutCurrencies,
    payoutMethodDialogCopy,
    payoutMethodTypes,
    type PayoutMethodTypeValue,
} from "@/lib/config/instructor-payouts";
import type {
    PayoutMethodFieldErrors,
    PayoutMethodInput,
} from "@/lib/actions/instructor-payouts";
import { cn } from "@/lib/utils";

const BLANK = {
    type: "BANK_TRANSFER" as PayoutMethodTypeValue,
    label: "",
    last4: "",
    currency: "usd",
    primary: false,
};

export type PayoutMethodDialogValues = typeof BLANK;

const FIELD = cn(
    "h-11 bg-background px-3.5 text-[15px] md:text-[15px] dark:bg-background",
    "placeholder:text-muted-foreground",
);

const LABEL = "text-[15px] font-semibold";

const SWITCH = cn(
    "border-0 p-[3px] data-[size=default]:h-6.5 data-[size=default]:w-11.5",
    "data-unchecked:bg-track dark:data-unchecked:bg-track",
    "[&_[data-slot=switch-thumb]]:size-5",
    "[&_[data-slot=switch-thumb]]:data-checked:translate-x-full",
);

function PayoutMethodDialog({
    open,
    onOpenChange,
    mode,
    targetId,
    values,
    errors,
    pending,
    isOnlyMethod,
    onSubmit,
    onRemove,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "create" | "edit";
    targetId?: string;
    values: PayoutMethodDialogValues | null;
    errors: PayoutMethodFieldErrors;
    pending: boolean;
    isOnlyMethod: boolean;
    onSubmit: (input: PayoutMethodInput) => void;
    onRemove: () => void;
}) {
    const [type, setType] =
        React.useState<PayoutMethodTypeValue>("BANK_TRANSFER");
    const [label, setLabel] = React.useState("");
    const [last4, setLast4] = React.useState("");
    const [currency, setCurrency] = React.useState("usd");
    const [primary, setPrimary] = React.useState(false);

    const formKey = open
        ? mode === "edit"
            ? `edit:${targetId}`
            : "create"
        : null;
    const [seededKey, setSeededKey] = React.useState<string | null>(null);
    if (formKey !== seededKey) {
        setSeededKey(formKey);
        if (formKey) {
            const seed = values ?? BLANK;
            setType(seed.type);
            setLabel(seed.label);
            setLast4(seed.last4);
            setCurrency(seed.currency);
            setPrimary(seed.primary || isOnlyMethod);
        }
    }

    const copy = payoutMethodDialogCopy;
    const isBank = type === "BANK_TRANSFER";
    const canSubmit = label.trim().length > 0 && (!isBank || last4.length > 0);

    function submit(event: React.FormEvent) {
        event.preventDefault();
        if (!canSubmit || pending) return;
        onSubmit({ type, label: label.trim(), last4, currency, primary });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-119.5 gap-0 p-7.5 sm:max-w-119.5">
                <DialogHeader className="gap-2">
                    <DialogTitle className="text-xl font-bold">
                        {mode === "create" ? copy.createTitle : copy.editTitle}
                    </DialogTitle>
                    <DialogDescription className="text-[15px] leading-6">
                        {copy.description}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="mt-4 flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <p className={LABEL}>{copy.typeLabel}</p>
                        <div
                            role="radiogroup"
                            aria-label={copy.typeLabel}
                            className="grid grid-cols-2 gap-2.5"
                        >
                            {payoutMethodTypes.map((option) => {
                                const selected = option.value === type;
                                return (
                                    <label
                                        key={option.value}
                                        className={cn(
                                            "flex h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 text-[15px] font-medium transition-colors",
                                            "has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                                            selected
                                                ? "border-foreground bg-background"
                                                : "border-border hover:bg-hover",
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="payout-method-type"
                                            value={option.value}
                                            checked={selected}
                                            onChange={() =>
                                                setType(option.value)
                                            }
                                            className="sr-only"
                                        />
                                        <option.icon
                                            aria-hidden
                                            className="size-4.5 text-muted-foreground"
                                        />
                                        {option.label}
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="payout-label" className={LABEL}>
                            {isBank ? copy.bankNameLabel : copy.paypalLabel}
                        </label>
                        <Input
                            id="payout-label"
                            value={label}
                            onChange={(event) => setLabel(event.target.value)}
                            maxLength={PAYOUT_LABEL_MAX_LENGTH}
                            placeholder={
                                isBank
                                    ? copy.bankNamePlaceholder
                                    : copy.paypalPlaceholder
                            }
                            inputMode={isBank ? "text" : "email"}
                            autoComplete="off"
                            spellCheck={false}
                            aria-invalid={errors.label ? true : undefined}
                            className={FIELD}
                        />
                        {errors.label ? (
                            <p className="text-[13px] text-destructive">
                                {errors.label}
                            </p>
                        ) : null}
                    </div>

                    {isBank ? (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="payout-last4" className={LABEL}>
                                    {copy.last4Label}
                                </label>
                                <Input
                                    id="payout-last4"
                                    value={last4}
                                    onChange={(event) =>
                                        setLast4(
                                            event.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, PAYOUT_LAST4_LENGTH),
                                        )
                                    }
                                    inputMode="numeric"
                                    placeholder={copy.last4Placeholder}
                                    autoComplete="off"
                                    aria-invalid={
                                        errors.last4 ? true : undefined
                                    }
                                    className={FIELD}
                                />
                                {errors.last4 ? (
                                    <p className="text-[13px] text-destructive">
                                        {errors.last4}
                                    </p>
                                ) : null}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="payout-currency"
                                    className={LABEL}
                                >
                                    {copy.currencyLabel}
                                </label>
                                <Select
                                    value={currency}
                                    onValueChange={(value) =>
                                        setCurrency(value ?? "usd")
                                    }
                                >
                                    <SelectTrigger
                                        id="payout-currency"
                                        className={cn(
                                            FIELD,
                                            "w-full data-[size=default]:h-11",
                                            "[&>span]:text-[15px]",
                                        )}
                                    >
                                        <SelectValue>
                                            {(current: string) =>
                                                payoutCurrencies.find(
                                                    (option) =>
                                                        option.value ===
                                                        current,
                                                )?.label ?? current
                                            }
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {payoutCurrencies.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    ) : null}

                    <div className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3.5">
                        <div className="min-w-0">
                            <Label
                                htmlFor="payout-primary"
                                className={cn(
                                    "text-[15px] leading-5 font-semibold",
                                    isOnlyMethod
                                        ? "cursor-default"
                                        : "cursor-pointer",
                                )}
                            >
                                {copy.primaryTitle}
                            </Label>
                            <p className="text-[13px] leading-4.5 text-muted-foreground">
                                {isOnlyMethod
                                    ? copy.primaryOnlyDescription
                                    : copy.primaryDescription}
                            </p>
                        </div>
                        <Switch
                            id="payout-primary"
                            checked={primary || isOnlyMethod}
                            disabled={isOnlyMethod}
                            onCheckedChange={setPrimary}
                            className={SWITCH}
                        />
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                        <Button
                            type="submit"
                            loading={pending}
                            disabled={!canSubmit}
                            className="h-11 px-5"
                        >
                            {mode === "create"
                                ? copy.createSubmit
                                : copy.editSubmit}
                        </Button>
                        {mode === "edit" ? (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onRemove}
                                disabled={pending}
                                className="h-11 px-4 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                                {copy.remove}
                            </Button>
                        ) : null}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export { PayoutMethodDialog };
