import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { LogoMark } from "@/components/shared/logo";
import {
    categoryIcons as databaseCategoryIcons,
    FALLBACK_CATEGORY_ICON,
} from "@/lib/config/admin-overview";
import { siteConfig } from "@/lib/config/site";
import type { CartSummary } from "@/lib/cart";
import { cn } from "@/lib/utils";

function CheckoutSummary({ summary }: { summary: CartSummary }) {
    const rows = [
        { label: "Subtotal", value: summary.subtotal },
        { label: "Tax", value: 0 },
    ];

    return (
        <div className="flex h-full flex-col bg-background px-9.25 pt-9.5 pb-10">
            <Link
                href="/dashboard/cart"
                className="inline-flex items-center gap-2.5 self-start text-sm leading-5 font-bold transition-opacity hover:opacity-70"
            >
                <ArrowLeftIcon className="size-4.5" strokeWidth={2.25} />
                Back To Cart
            </Link>

            <div className="mt-6 flex items-center gap-3">
                <LogoMark tone="solid" className="size-6.5 rounded-[7px]" />
                <span className="text-[15px] font-bold">
                    {siteConfig.legalName}
                </span>
            </div>

            <p className="mt-5 text-[15px] leading-5.5 text-muted-foreground">
                Pay {siteConfig.legalName}
            </p>
            <p className="mt-1 text-[46px] leading-none font-extrabold tracking-[-0.02em]">
                ${summary.total.toFixed(2)}
            </p>

            <ul className="mt-7.5 flex flex-col gap-4">
                {summary.lines.map((line) => (
                    <li key={line.id} className="flex items-center gap-11.25">
                        <div className="relative shrink-0">
                            <div
                                className={cn(
                                    "grid size-11 place-items-center rounded-[6px] bg-linear-to-br",
                                    line.course.art,
                                )}
                            >
                                {(() => {
                                    const Icon =
                                        databaseCategoryIcons[
                                            line.course.categorySlug
                                        ] ?? FALLBACK_CATEGORY_ICON;
                                    return (
                                        <Icon className="size-5 text-white/30" />
                                    );
                                })()}
                            </div>
                            <span className="absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full bg-muted-foreground/80 text-[10px] leading-none font-semibold text-background">
                                1
                            </span>
                        </div>
                        <span className="min-w-0 flex-1 text-[15px] leading-5.5">
                            {line.course.title}
                        </span>
                        <span className="text-[15px] leading-5.5 tabular-nums">
                            ${line.course.price.toFixed(2)}
                        </span>
                    </li>
                ))}
            </ul>

            <div className="mt-5 border-t" />

            <dl className="mt-3.5 flex flex-col">
                {rows.map((row) => (
                    <div
                        key={row.label}
                        className="flex justify-between leading-6.5"
                    >
                        <dt className="text-[15px] text-muted-foreground">
                            {row.label}
                        </dt>
                        <dd className="text-[15px] text-muted-foreground tabular-nums">
                            ${row.value.toFixed(2)}
                        </dd>
                    </div>
                ))}
            </dl>

            <div className="mt-2.5 border-t" />

            <div className="mt-2 flex justify-between leading-6.5">
                <span className="text-[15px] font-bold">Total Due</span>
                <span className="text-[15px] font-bold tabular-nums">
                    ${summary.total.toFixed(2)}
                </span>
            </div>
        </div>
    );
}

export { CheckoutSummary };
