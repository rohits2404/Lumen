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
    categoryAccent,
    categoryAccentClasses,
    categoryAccentLabels,
    type CategoryAccent,
} from "@/lib/config/admin-categories";
import {
    TOPIC_DESCRIPTION_MAX_LENGTH,
    TOPIC_NAME_MAX_LENGTH,
    topicDialogCopy,
    topicVisibilityOptions,
} from "@/lib/config/admin-community";
import type { TopicInput } from "@/lib/actions/admin-community";
import type { TopicVisibility } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

export type TopicDialogValues = {
    name: string;
    description: string;
    accentColor: string;
    visibility: TopicVisibility;
    learnersCanStartThreads: boolean;
    requiresModeratorApproval: boolean;
};

const BLANK: TopicDialogValues = {
    name: "",
    description: "",
    accentColor: "blue",
    visibility: "EVERYONE",
    learnersCanStartThreads: true,
    requiresModeratorApproval: false,
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

function TopicDialog({
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
    values: TopicDialogValues | null;
    pending: boolean;
    onSubmit: (input: TopicInput) => void;
}) {
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [accent, setAccent] = React.useState<CategoryAccent>("blue");
    const [visibility, setVisibility] =
        React.useState<TopicVisibility>("EVERYONE");
    const [canStart, setCanStart] = React.useState(true);
    const [needsApproval, setNeedsApproval] = React.useState(false);

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
            setVisibility(seed.visibility);
            setCanStart(seed.learnersCanStartThreads);
            setNeedsApproval(seed.requiresModeratorApproval);
        }
    }

    const copy = topicDialogCopy;
    const trimmed = name.trim();

    function submit(event: React.FormEvent) {
        event.preventDefault();
        if (trimmed.length === 0 || pending) return;
        onSubmit({
            name: trimmed,
            description,
            accentColor: accent,
            visibility,
            learnersCanStartThreads: canStart,
            requiresModeratorApproval: needsApproval,
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[88vh] w-130 flex-col gap-0 p-0 sm:max-w-130">
                <DialogHeader className="gap-2 px-7.5 pt-7.5">
                    <DialogTitle className="text-xl font-bold">
                        {mode === "create" ? copy.createTitle : copy.editTitle}
                    </DialogTitle>
                    <DialogDescription className="text-[15px] leading-6">
                        {copy.description}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={submit}
                    className="flex min-h-0 flex-1 flex-col overflow-y-auto px-7.5 pt-4 pb-7.5"
                >
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="topic-name" className={LABEL}>
                                {copy.nameLabel}
                            </label>
                            <Input
                                id="topic-name"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                maxLength={TOPIC_NAME_MAX_LENGTH}
                                placeholder={copy.namePlaceholder}
                                autoComplete="off"
                                className={cn(FIELD, "h-11 px-3.5")}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="topic-description"
                                className={LABEL}
                            >
                                {copy.descriptionLabel}
                            </label>
                            <Textarea
                                id="topic-description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                                maxLength={TOPIC_DESCRIPTION_MAX_LENGTH}
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
                                                "grid size-8.5 cursor-pointer place-items-center rounded-lg border-[3px] transition-colors",
                                                "has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                                                categoryAccentClasses[value]
                                                    .swatch,
                                                selected
                                                    ? "border-foreground"
                                                    : "border-transparent",
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                name="topic-accent"
                                                value={value}
                                                checked={selected}
                                                onChange={() =>
                                                    setAccent(value)
                                                }
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

                        <div className="flex flex-col gap-2">
                            <p className={LABEL}>{copy.visibilityLabel}</p>
                            <div
                                role="radiogroup"
                                aria-label={copy.visibilityLabel}
                                className="flex flex-col gap-2.5"
                            >
                                {topicVisibilityOptions.map((option) => {
                                    const selected =
                                        option.value === visibility;
                                    return (
                                        <label
                                            key={option.value}
                                            className={cn(
                                                "flex cursor-pointer items-center gap-3.5 rounded-xl border-2 bg-background px-4 py-3.5 transition-colors",
                                                "has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                                                selected
                                                    ? "border-foreground"
                                                    : "border-transparent",
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                name="topic-visibility"
                                                value={option.value}
                                                checked={selected}
                                                onChange={() =>
                                                    setVisibility(option.value)
                                                }
                                                className="sr-only"
                                            />
                                            <span
                                                aria-hidden
                                                className={cn(
                                                    "grid size-4.5 shrink-0 place-items-center rounded-full border-2",
                                                    selected
                                                        ? "border-foreground"
                                                        : "border-border",
                                                )}
                                            >
                                                {selected ? (
                                                    <span className="size-2 rounded-full bg-foreground" />
                                                ) : null}
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block text-[15px] leading-5 font-semibold">
                                                    {option.label}
                                                </span>
                                                <span className="block text-[13px] leading-4.5 text-muted-foreground">
                                                    {option.description}
                                                </span>
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {[
                            {
                                id: "topic-learners-can-start",
                                title: copy.threadsTitle,
                                description: copy.threadsDescription,
                                checked: canStart,
                                onChange: setCanStart,
                            },
                            {
                                id: "topic-requires-approval",
                                title: copy.approvalTitle,
                                description: copy.approvalDescription,
                                checked: needsApproval,
                                onChange: setNeedsApproval,
                            },
                        ].map((row) => (
                            <div
                                key={row.id}
                                className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3.5"
                            >
                                <div>
                                    <Label
                                        htmlFor={row.id}
                                        className="cursor-pointer text-[15px] leading-5 font-semibold"
                                    >
                                        {row.title}
                                    </Label>
                                    <p className="text-[13px] leading-4.5 text-muted-foreground">
                                        {row.description}
                                    </p>
                                </div>
                                <Switch
                                    id={row.id}
                                    checked={row.checked}
                                    onCheckedChange={row.onChange}
                                    className={SWITCH}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mt-6">
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

export { TopicDialog };
