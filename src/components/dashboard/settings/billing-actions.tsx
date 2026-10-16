"use client";

import * as React from "react";
import { CreditCardIcon, StarIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import {
    createBillingPortalSession,
    removePaymentMethod,
    setDefaultPaymentMethod,
} from "@/lib/actions/billing";

function ChangePlanButton({ disabled }: { disabled?: boolean }) {
    const [pending, startTransition] = React.useTransition();

    return (
        <Button
            type="button"
            loading={pending}
            disabled={disabled}
            onClick={() =>
                startTransition(async () => {
                    const result = await createBillingPortalSession();
                    if (!result.ok) {
                        toast.add({ title: result.message, type: "error" });
                        return;
                    }
                    window.location.href = result.url;
                })
            }
            className="h-10 shrink-0 px-4.5"
        >
            {pending ? "Opening…" : "Change Plan"}
        </Button>
    );
}

function CardRowMenu({
    paymentMethodId,
    label,
    isDefault,
}: {
    paymentMethodId: string;
    label: string;
    isDefault: boolean;
}) {
    const [pending, startTransition] = React.useTransition();

    function run(action: () => Promise<{ ok: boolean; message: string }>) {
        startTransition(async () => {
            const result = await action();
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
        });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={pending}
                        aria-label={`Manage ${label}`}
                        className="size-10 shrink-0 bg-card"
                    />
                }
            >
                {pending ? (
                    <Spinner className="size-4.5" />
                ) : (
                    <CreditCardIcon className="size-4.5" />
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        disabled={isDefault}
                        onClick={() =>
                            run(() => setDefaultPaymentMethod(paymentMethodId))
                        }
                    >
                        <StarIcon />
                        {isDefault ? "Primary Card" : "Set As Primary"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() =>
                            run(() => removePaymentMethod(paymentMethodId))
                        }
                    >
                        <Trash2Icon />
                        Remove Card
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export { ChangePlanButton, CardRowMenu };
