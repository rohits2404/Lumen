"use client";

import {
    BillingPeriod,
    BUSINESS_PLAN_ID,
    businessCta,
    BusinessOffer,
    plans,
} from "@/lib/config/pricing";
import { cn } from "@/lib/utils";
import { useState, useTransition } from "react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { CheckIcon } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { startBusinessCheckout } from "@/lib/actions/subscriptions";
import { toast } from "../ui/toast";

const periods: { value: BillingPeriod; label: string }[] = [
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
];

function PricingSection({
    className,
    offer,
}: {
    className?: string;
    offer?: BusinessOffer;
}) {
    const [period, setPeriod] = useState<BillingPeriod>("monthly");
    const [pending, startTransition] = useTransition();

    function upgrade() {
        startTransition(async () => {
            const result = await startBusinessCheckout(period);
            if (!result.ok) {
                toast.add({ title: result.message, type: "error" });
                return;
            }
            window.location.href = result.url;
        });
    }

    return (
        <section className={cn("w-full", className)}>
            <div className="mx-auto w-full max-w-300 px-6 py-12 md:py-20">
                <h2 className="text-center text-4xl leading-[1.1] lg:text-[44px]">
                    Pay Per Course, Or Unlock Everything.
                </h2>
                <p className="mx-auto mt-3 max-w-140 text-center text-lg leading-normal tracking-[-0.01em] text-muted-foreground">
                    Teaching On Lumen Is Always Free — You Only Share Revenue
                    When You Earn.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                    <ToggleGroup
                        spacing={0}
                        value={[period]}
                        onValueChange={(value: string[]) => {
                            if (value[0]) setPeriod(value[0] as BillingPeriod);
                        }}
                        aria-label="Billing period"
                        className="h-11.75 rounded-full bg-track p-1.5"
                    >
                        {periods.map((option) => (
                            <ToggleGroupItem
                                key={option.value}
                                value={option.value}
                                className="h-8.75 w-23.5 cursor-pointer rounded-full! text-muted-foreground hover:bg-transparent hover:text-foreground aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-sm"
                            >
                                {option.label}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                    <Badge className="h-6.75 bg-success/15 px-3 text-[13px] font-semibold text-success">
                        Save 14% Yearly
                    </Badge>
                </div>

                <div className="mt-10 grid items-start gap-5.25 sm:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan) => {
                        const isBusiness = plan.id === BUSINESS_PLAN_ID;
                        const price =
                            isBusiness && offer
                                ? offer.price[period]
                                : plan.price[period];
                        const suffix =
                            isBusiness && offer
                                ? offer.suffix[period]
                                : plan.suffix[period];
                        const state = isBusiness && offer ? offer.state : null;
                        const cta = state ? businessCta[state] : null;

                        return (
                            <Card
                                key={plan.id}
                                className={cn(
                                    "relative gap-0 p-7.5 ring-border",
                                    plan.featured &&
                                        "overflow-visible border-2 border-accent-1 shadow-[0_24px_70px_-28px_var(--accent-1)] ring-0",
                                )}
                            >
                                {plan.featured ? (
                                    <Badge className="bg-logo absolute -top-3 left-3 h-6 px-3 text-[11px] font-bold tracking-[0.08em] text-white uppercase">
                                        Most Popular
                                    </Badge>
                                ) : null}

                                <h3 className="text-[17px]">{plan.name}</h3>
                                <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
                                    <span className="text-[38px] leading-none font-extrabold tracking-[-0.03em]">
                                        {price}
                                    </span>
                                    <span className="text-[15px] text-muted-foreground">
                                        {suffix}
                                    </span>
                                </p>
                                <p className="mt-3.5 text-[15px] leading-[1.55] text-muted-foreground">
                                    {plan.description}
                                </p>

                                <ul className="mt-6 flex flex-col gap-2.75">
                                    {plan.features.map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex items-start gap-3"
                                        >
                                            <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" />
                                            <span className="text-[15px]">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {state === "available" ? (
                                    <Button
                                        type="button"
                                        onClick={upgrade}
                                        loading={pending}
                                        className="mt-5.5 h-11.25 w-full font-semibold"
                                    >
                                        {cta?.label}
                                    </Button>
                                ) : state === "subscribed" ? (
                                    <Button
                                        nativeButton={false}
                                        variant="outline"
                                        className="mt-5.5 h-11.25 w-full bg-card font-semibold"
                                        render={
                                            <Link href="/dashboard/settings/billing" />
                                        }
                                    >
                                        {cta?.label}
                                    </Button>
                                ) : state === "unconfigured" ? (
                                    <Button
                                        type="button"
                                        disabled
                                        title={cta?.hint}
                                        className="mt-5.5 h-11.25 w-full font-semibold"
                                    >
                                        {cta?.label}
                                    </Button>
                                ) : (
                                    <Button
                                        variant={
                                            plan.featured
                                                ? "default"
                                                : "outline"
                                        }
                                        nativeButton={false}
                                        className={cn(
                                            "mt-5.5 h-11.25 w-full font-semibold",
                                            !plan.featured && "bg-card",
                                        )}
                                        render={<Link href={plan.cta.href} />}
                                    >
                                        {cta?.label ?? plan.cta.label}
                                    </Button>
                                )}
                                {cta?.hint && state === "subscribed" ? (
                                    <p className="mt-2.5 text-center text-[13px] text-muted-foreground">
                                        {cta.hint}
                                    </p>
                                ) : null}
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export { PricingSection };
