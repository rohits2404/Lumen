"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    CATEGORY_ACCENTS,
    CATEGORY_DESCRIPTION_MAX_LENGTH,
    CATEGORY_NAME_MAX_LENGTH,
    categoryAccent,
    categoryAccentClasses,
    categoryAccentLabels,
    categoryDialogCopy,
    type CategoryAccent,
} from "@/lib/config/admin-categories";
import type { CategoryInput } from "@/lib/actions/admin-categories";
import { cn } from "@/lib/utils";

export type CategoryDialogValues = {
    name: string;
    description: string;
    accentColor: string;
    showInNav: boolean;
};

const BLANK: CategoryDialogValues = {
    name: "",
    description: "",
    accentColor: "blue",
    showInNav: true,
};

const FIELD = cn(
    "bg-background text-[15px] md:text-[15px] dark:bg-background",
    "placeholder:text-muted-foreground",
);

const LABEL = "text-[15px] font-semibold";

const SWITCH = cn(
    "border-0 p-[3px] data-[size=default]:h-6.5 data-[size=default]:w-11.5",
    "data-unchecked:bg-track dark:data-unchecked:bg-track",
    "[&_[data-slot=switch-thumb]]:size-5",
    "[&_[data-slot=switch-thumb]]:data-checked:translate-x-full",
);

function CategoryDialog({
    open,
    onOpenChange,
    mode,
    targetId,
    values,
    pending,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "create" | "edit";
    targetId?: string;
    values: CategoryDialogValues | null;
    pending: boolean;
    onSubmit: (input: CategoryInput) => void;
}) {
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [accent, setAccent] = React.useState<CategoryAccent>("blue");
    const [showInNav, setShowInNav] = React.useState(true);

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
            setName(seed.name);
            setDescription(seed.description);
            setAccent(categoryAccent(seed.accentColor));
            setShowInNav(seed.showInNav);
        }
    }

    const copy = categoryDialogCopy;
    const trimmed = name.trim();

    function submit(event: React.FormEvent) {
        event.preventDefault();
        if (trimmed.length === 0 || pending) return;
        onSubmit({
            name: trimmed,
            description,
            accentColor: accent,
            showInNav,
        });
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
                        <label htmlFor="category-name" className={LABEL}>
                            {copy.nameLabel}
                        </label>
                        <Input
                            id="category-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            maxLength={CATEGORY_NAME_MAX_LENGTH}
                            placeholder={copy.namePlaceholder}
                            autoComplete="off"
                            className={cn(FIELD, "h-11 px-3.5")}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="category-description" className={LABEL}>
                            {copy.descriptionLabel}
                        </label>
                        <Textarea
                            id="category-description"
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            maxLength={CATEGORY_DESCRIPTION_MAX_LENGTH}
                            placeholder={copy.descriptionPlaceholder}
                            className={cn(
                                FIELD,
                                "field-sizing-fixed h-25 min-h-25 px-3.5 py-2.5",
                            )}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className={LABEL}>{copy.accentLabel}</p>
                        <div
                            role="radiogroup"
                            aria-label={copy.accentLabel}
                            className="flex flex-wrap gap-2.25"
                        >
                            {CATEGORY_ACCENTS.map((value) => {
                                const selected = value === accent;
                                return (
                                    <label
                                        key={value}
                                        className={cn(
                                            "size-8.5 cursor-pointer rounded-lg border-[3px] transition-colors",
                                            "grid place-items-center",
                                            "has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                                            categoryAccentClasses[value].swatch,
                                            selected
                                                ? "border-foreground"
                                                : "border-transparent",
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="category-accent"
                                            value={value}
                                            checked={selected}
                                            onChange={() => setAccent(value)}
                                            className="sr-only"
                                        />
                                        <span className="sr-only">
                                            {categoryAccentLabels[value]}
                                        </span>
                                        {selected ? (
                                            <CheckIcon
                                                aria-hidden
                                                className="size-4 text-white"
                                                strokeWidth={2.75}
                                            />
                                        ) : null}
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3.5">
                        <div>
                            <Label
                                htmlFor="category-show-in-nav"
                                className="cursor-pointer text-[15px] leading-5 font-semibold"
                            >
                                {copy.navTitle}
                            </Label>
                            <p className="text-[13px] leading-4.5 text-muted-foreground">
                                {copy.navDescription}
                            </p>
                        </div>
                        <Switch
                            id="category-show-in-nav"
                            checked={showInNav}
                            onCheckedChange={setShowInNav}
                            className={SWITCH}
                        />
                    </div>

                    <div className="mt-1">
                        <Button
                            type="submit"
                            loading={pending}
                            disabled={trimmed.length === 0}
                            className="h-11 px-5"
                        >
                            {mode === "create"
                                ? copy.createSubmit
                                : copy.editSubmit}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export { CategoryDialog };
