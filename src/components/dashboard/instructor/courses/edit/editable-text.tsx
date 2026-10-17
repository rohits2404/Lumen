"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

function EditableText({
    value,
    onCommit,
    placeholder,
    ariaLabel,
    className,
    inputMode,
    disabled,
}: {
    value: string;
    onCommit: (next: string) => Promise<boolean> | boolean;
    placeholder?: string;
    ariaLabel: string;
    className?: string;
    inputMode?: "text" | "numeric";
    disabled?: boolean;
}) {
    const [draft, setDraft] = React.useState(value);
    const [committed, setCommitted] = React.useState(value);
    if (value !== committed) {
        setCommitted(value);
        setDraft(value);
    }

    async function commit() {
        const next = draft.trim();
        if (next === committed) {
            setDraft(committed);
            return;
        }
        const ok = await onCommit(next);
        if (ok) setCommitted(next);
        else setDraft(committed);
    }

    return (
        <input
            value={draft}
            disabled={disabled}
            aria-label={ariaLabel}
            placeholder={placeholder}
            inputMode={inputMode}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => void commit()}
            onKeyDown={(event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    event.currentTarget.blur();
                }
                if (event.key === "Escape") {
                    setDraft(committed);
                    event.currentTarget.blur();
                }
            }}
            className={cn(
                "w-full min-w-0 truncate rounded-md bg-transparent px-1.5 py-1 outline-none",
                "ring-1 ring-transparent transition-[background-color,box-shadow]",
                "hover:ring-border focus:bg-card focus:ring-ring/50",
                "disabled:cursor-not-allowed disabled:opacity-60",
                "placeholder:text-subtle-foreground",
                className,
            )}
        />
    );
}

export { EditableText };
