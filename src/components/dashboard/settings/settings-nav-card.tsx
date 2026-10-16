"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type SettingsNavCardItem = {
    title: string;
    href: string;
    icon: LucideIcon;
    built: boolean;
};

function SettingsNavCard({ items }: { items: readonly SettingsNavCardItem[] }) {
    const pathname = usePathname();

    return (
        <Card className="[--card-spacing:--spacing(2.5)]">
            <CardContent className="flex flex-col gap-y-1">
                {items.map((item) => {
                    const active = pathname === item.href;
                    const className = cn(
                        "flex h-10 items-center gap-3.5 rounded-lg px-3.5 text-sm font-medium transition-colors",
                        active ? "bg-hover" : "hover:bg-hover",
                        item.built
                            ? ""
                            : "cursor-default text-foreground/90 hover:bg-transparent",
                    );

                    if (!item.built) {
                        return (
                            <span
                                key={item.href}
                                aria-disabled="true"
                                title="Coming soon"
                                className={className}
                            >
                                <item.icon className="size-4 text-muted-foreground" />
                                {item.title}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            className={className}
                        >
                            <item.icon className="size-4 text-muted-foreground" />
                            {item.title}
                        </Link>
                    );
                })}
            </CardContent>
        </Card>
    );
}

export { SettingsNavCard };
