"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ThemeToggle({
    className,
    variant = "outline",
}: {
    className?: string;
    variant?: React.ComponentProps<typeof Button>["variant"];
}) {
    const { resolvedTheme, setTheme } = useTheme();

    return (
        <Button
            variant={variant}
            size="icon"
            aria-label="Toggle theme"
            onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className={cn(
                "size-9.5 cursor-pointer",
                variant === "outline" && "bg-card shadow-sm dark:bg-card",
                className,
            )}
        >
            <MoonIcon className="dark:hidden" />
            <SunIcon className="hidden dark:block" />
        </Button>
    );
}

export { ThemeToggle };
