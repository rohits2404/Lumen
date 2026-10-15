"use client";

import Link from "next/link";

import { RowTooltip } from "@/components/dashboard/sidebar-nav";
import { workspaceModes, type WorkspaceMode } from "@/lib/config/dashboard";
import { cn } from "@/lib/utils";

const LOCKED_REASON =
    "Instructor Mode Unlocks Once You Have a Teaching Profile";

function WorkspaceSwitch({
    mode,
    canTeach = false,
}: {
    mode: WorkspaceMode;
    canTeach?: boolean;
}) {
    const other =
        workspaceModes.find((option) => option.value !== mode) ??
        workspaceModes[1];
    const locked = (value: WorkspaceMode) =>
        value === "instructor" && !canTeach;

    return (
        <>
            <nav
                aria-label="Workspace"
                className="mt-3.5 flex h-10 items-center rounded-full bg-track p-1 group-data-[collapsible=icon]:hidden"
            >
                {workspaceModes.map((option) => {
                    const selected = mode === option.value;
                    const className = cn(
                        "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold transition-colors",
                        selected
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                    );

                    if (locked(option.value)) {
                        return (
                            <span
                                key={option.value}
                                aria-disabled="true"
                                title={LOCKED_REASON}
                                className={cn(
                                    className,
                                    "cursor-default opacity-60",
                                )}
                            >
                                <option.icon className="size-4" />
                                {option.label}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={option.value}
                            href={option.href}
                            aria-current={selected ? "page" : undefined}
                            className={cn(className, "cursor-pointer")}
                        >
                            <option.icon className="size-4" />
                            {option.label}
                        </Link>
                    );
                })}
            </nav>

            {locked(other.value) ? (
                <RowTooltip label={LOCKED_REASON}>
                    <span
                        aria-disabled="true"
                        title={LOCKED_REASON}
                        className="mx-auto mt-3.5 hidden size-9 cursor-default items-center justify-center rounded-lg bg-card text-muted-foreground opacity-60 shadow-sm group-data-[collapsible=icon]:flex"
                    >
                        <other.icon className="size-4" />
                    </span>
                </RowTooltip>
            ) : (
                <RowTooltip label={`Switch to ${other.label}`}>
                    <Link
                        href={other.href}
                        aria-label={`Switch to ${other.label}`}
                        className="mx-auto mt-3.5 hidden size-9 cursor-pointer items-center justify-center rounded-lg bg-card text-foreground shadow-sm transition-colors group-data-[collapsible=icon]:flex hover:bg-hover"
                    >
                        <other.icon className="size-4" />
                    </Link>
                </RowTooltip>
            )}
        </>
    );
}

export { WorkspaceSwitch };
