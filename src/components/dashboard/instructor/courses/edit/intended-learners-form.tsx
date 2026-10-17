"use client";

import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    EDITOR_CARD,
    EDITOR_FIELD as FIELD,
    EDITOR_HEADING,
} from "@/components/dashboard/instructor/courses/edit/editor-controls";
import { intendedLearnersCopy } from "@/lib/config/course-editor";
import { cn } from "@/lib/utils";

function IntendedLearnersForm({
    values,
    onChange,
    onSubmit,
    pending,
}: {
    values: {
        learningOutcomes: string[];
        requirements: string[];
        intendedAudience: string;
    };
    onChange: (next: Partial<typeof values>) => void;
    onSubmit: () => void;
    pending: boolean;
}) {
    return (
        <Card className={EDITOR_CARD}>
            <h2 className={EDITOR_HEADING}>{intendedLearnersCopy.heading}</h2>
            <p className="mt-3 max-w-140 text-[15px] leading-6 text-muted-foreground">
                {intendedLearnersCopy.lead}
            </p>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    onSubmit();
                }}
            >
                <GrowList
                    label={intendedLearnersCopy.outcomes.label}
                    help={intendedLearnersCopy.outcomes.help}
                    placeholder={intendedLearnersCopy.outcomes.placeholder}
                    rows={values.learningOutcomes}
                    disabled={pending}
                    onChange={(learningOutcomes) =>
                        onChange({ learningOutcomes })
                    }
                />

                <GrowList
                    label={intendedLearnersCopy.requirements.label}
                    placeholder={intendedLearnersCopy.requirements.placeholder}
                    rows={values.requirements}
                    disabled={pending}
                    onChange={(requirements) => onChange({ requirements })}
                />

                <div className="mt-7">
                    <label
                        htmlFor="intended-audience"
                        className="block text-[16px] font-bold"
                    >
                        {intendedLearnersCopy.audience.label}
                    </label>
                    <textarea
                        id="intended-audience"
                        value={values.intendedAudience}
                        disabled={pending}
                        rows={3}
                        placeholder={intendedLearnersCopy.audience.placeholder}
                        onChange={(event) =>
                            onChange({ intendedAudience: event.target.value })
                        }
                        className={cn(FIELD, "mt-2.5 h-19.25 resize-y py-2.5")}
                    />
                </div>

                <Button
                    type="submit"
                    loading={pending}
                    className="mt-7 h-10 px-5"
                >
                    {intendedLearnersCopy.save}
                </Button>
            </form>
        </Card>
    );
}

function GrowList({
    label,
    help,
    placeholder,
    rows,
    disabled,
    onChange,
}: {
    label: string;
    help?: string;
    placeholder: string;
    rows: string[];
    disabled: boolean;
    onChange: (rows: string[]) => void;
}) {
    const shown =
        rows.length === 0 || rows[rows.length - 1] !== ""
            ? [...rows, ""]
            : rows;

    return (
        <div className="mt-7">
            <p className="text-[16px] font-bold">{label}</p>
            {help ? (
                <p className="mt-1 text-[13px] text-muted-foreground">{help}</p>
            ) : null}

            <div className="mt-2.5 flex flex-col gap-2.5">
                {shown.map((row, index) => (
                    <div key={index} className="relative">
                        <input
                            value={row}
                            disabled={disabled}
                            placeholder={
                                index === shown.length - 1
                                    ? placeholder
                                    : undefined
                            }
                            aria-label={`${label} ${index + 1}`}
                            onChange={(event) => {
                                const next = shown.slice();
                                next[index] = event.target.value;
                                onChange(
                                    next.filter(
                                        (value, i) =>
                                            value !== "" || i < next.length - 1,
                                    ),
                                );
                            }}
                            className={cn(FIELD, "h-11 pr-11")}
                        />
                        {row !== "" ? (
                            <button
                                type="button"
                                disabled={disabled}
                                aria-label={`${intendedLearnersCopy.remove} — ${row}`}
                                title={intendedLearnersCopy.remove}
                                onClick={() =>
                                    onChange(
                                        shown
                                            .filter((_, i) => i !== index)
                                            .filter(
                                                (value, i, all) =>
                                                    value !== "" ||
                                                    i < all.length - 1,
                                            ),
                                    )
                                }
                                className="absolute top-1/2 right-3 grid size-6 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-subtle-foreground transition-colors outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed"
                            >
                                <XIcon className="size-4" />
                            </button>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
}

export { IntendedLearnersForm };
