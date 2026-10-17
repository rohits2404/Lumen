"use client";

import { cn } from "@/lib/utils";

function RowButton({
    label,
    onClick,
    disabled,
    destructive,
    children,
}: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    destructive?: boolean;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            className={cn(
                "grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg bg-card text-muted-foreground ring-1 ring-border transition-colors outline-none",
                "hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
                "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-card disabled:hover:text-muted-foreground",
                destructive && "hover:text-destructive",
            )}
        >
            {children}
        </button>
    );
}

export { RowButton };
