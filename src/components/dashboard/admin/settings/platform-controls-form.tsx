"use client";

import * as React from "react";
import { CheckCheckIcon, CheckIcon, LoaderCircleIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    NativeSelect,
    NativeSelectOption,
} from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { MaintenanceDialog } from "@/components/dashboard/admin/settings/maintenance-dialog";
import { BrandingUpload } from "@/components/dashboard/admin/settings/branding-upload";
import {
    updatePlatformSettings,
    type PlatformSettingsPatch,
} from "@/lib/actions/admin-settings";
import {
    categoryAccentClasses,
    categoryAccentLabels,
} from "@/lib/config/admin-categories";
import {
    maintenanceToggle,
    META_DESCRIPTION_MAX,
    platformControlsCopy,
    platformCurrencies,
    platformToggles,
    PLATFORM_ACCENTS,
    revenueShareOptions,
    SUPPORT_EMAIL_MAX,
    WEBSITE_TITLE_MAX,
} from "@/lib/config/admin-settings";
import type { PlatformSetting } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

const HEADING = "text-lg font-bold";

const FIELD = cn(
    "h-11 rounded-lg border-border bg-background px-3.5 text-[15px] md:text-[15px]",
    "dark:bg-background",
);

const TOGGLE_ROW =
    "flex min-h-[70px] items-center justify-between gap-4 rounded-xl border px-5 py-3.5";

const SWITCH = cn(
    "border-0 p-[3px] data-[size=default]:h-6.5 data-[size=default]:w-11.5",
    "data-unchecked:bg-track dark:data-unchecked:bg-track",
    "[&_[data-slot=switch-thumb]]:size-5",
    "[&_[data-slot=switch-thumb]]:data-checked:translate-x-full",
);

const FIELD_LABEL = "text-[13px] font-semibold";

type SaveState = "idle" | "saving" | "saved" | "error";

type FormValues = {
    accentColor: string;
    websiteTitle: string;
    metaDescription: string;
    supportEmail: string;
    currency: string;
    defaultRevenueShareBps: number;
    instructorApplicationsOpen: boolean;
    newStudentSignupsOpen: boolean;
    requireManualCourseReview: boolean;
    autoEnrollNewCoursesInPromotions: boolean;
    maintenanceMode: boolean;
};

function PlatformControlsForm({ settings }: { settings: PlatformSetting }) {
    const copy = platformControlsCopy;

    const [values, setValues] = React.useState<FormValues>({
        accentColor: settings.accentColor,
        websiteTitle: settings.websiteTitle,
        metaDescription: settings.metaDescription,
        supportEmail: settings.supportEmail,
        currency: settings.currency,
        defaultRevenueShareBps: settings.defaultRevenueShareBps,
        instructorApplicationsOpen: settings.instructorApplicationsOpen,
        newStudentSignupsOpen: settings.newStudentSignupsOpen,
        requireManualCourseReview: settings.requireManualCourseReview,
        autoEnrollNewCoursesInPromotions:
            settings.autoEnrollNewCoursesInPromotions,
        maintenanceMode: settings.maintenanceMode,
    });

    const [status, setStatus] = React.useState<SaveState>("idle");
    const [confirmMaintenance, setConfirmMaintenance] = React.useState(false);
    const [, startSaving] = React.useTransition();

    const saved = React.useRef({
        websiteTitle: settings.websiteTitle,
        metaDescription: settings.metaDescription,
        supportEmail: settings.supportEmail,
    });

    function save(patch: PlatformSettingsPatch, onFail?: () => void) {
        setStatus("saving");
        startSaving(async () => {
            const result = await updatePlatformSettings(patch);
            setStatus(result.ok ? "saved" : "error");
            if (!result.ok) {
                toast.add({ title: result.message, type: "error" });
                onFail?.();
            }
        });
    }

    function saveText(
        key: "websiteTitle" | "metaDescription" | "supportEmail",
    ) {
        const previous = saved.current[key];
        const next = values[key].trim();
        if (next === previous) return;

        if (next.length === 0) {
            setValues((current) => ({ ...current, [key]: previous }));
            return;
        }

        saved.current[key] = next;
        setValues((current) => ({ ...current, [key]: next }));
        save({ [key]: next } as PlatformSettingsPatch, () => {
            saved.current[key] = previous;
            setValues((current) => ({ ...current, [key]: previous }));
        });
    }

    function saveToggle(name: string, value: boolean) {
        setValues((current) => ({ ...current, [name]: value }));
        save({ toggle: { name, value } }, () =>
            setValues((current) => ({ ...current, [name]: !value })),
        );
    }

    return (
        <div>
            <div>
                <h2 className={HEADING}>{copy.title}</h2>
                <p className="mt-1 text-[15px] text-muted-foreground">
                    {copy.description}
                </p>
            </div>

            <section className="mt-7">
                <h3 className="text-[15px] font-bold">
                    {copy.brandingHeading}
                </h3>
                <p className="mt-1 text-[13px] text-muted-foreground">
                    {copy.brandingDescription}
                </p>

                <div className="mt-4">
                    <BrandingUpload logoUrl={settings.logoUrl} />
                </div>

                <p className="mt-5 mb-2.5 text-[13px] font-semibold">
                    {copy.accentLabel}
                </p>
                <div
                    role="radiogroup"
                    aria-label={copy.accentLabel}
                    className="flex flex-wrap gap-2.25"
                >
                    {PLATFORM_ACCENTS.map((accent) => {
                        const selected = values.accentColor === accent;
                        return (
                            <label
                                key={accent}
                                className={cn(
                                    "grid size-8.5 cursor-pointer place-items-center rounded-lg border-[3px] transition-colors",
                                    "has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                                    categoryAccentClasses[accent].swatch,
                                    selected
                                        ? "border-foreground"
                                        : "border-transparent",
                                )}
                                title={categoryAccentLabels[accent]}
                            >
                                <input
                                    type="radio"
                                    name="platform-accent"
                                    value={accent}
                                    checked={selected}
                                    onChange={() => {
                                        const previous = values.accentColor;
                                        setValues((current) => ({
                                            ...current,
                                            accentColor: accent,
                                        }));
                                        save({ accentColor: accent }, () =>
                                            setValues((current) => ({
                                                ...current,
                                                accentColor: previous,
                                            })),
                                        );
                                    }}
                                    className="sr-only"
                                />
                                <span className="sr-only">
                                    {categoryAccentLabels[accent]}
                                </span>
                                {selected ? (
                                    <CheckIcon
                                        aria-hidden
                                        className="size-4 text-white"
                                        strokeWidth={3}
                                    />
                                ) : null}
                            </label>
                        );
                    })}
                </div>
            </section>

            <section className="mt-7">
                <h3 className="text-[15px] font-bold">{copy.searchHeading}</h3>
                <p className="mt-1 text-[13px] text-muted-foreground">
                    {copy.searchDescription}
                </p>

                <div className="mt-4 flex flex-col gap-4">
                    <div>
                        <div className="mb-2 flex items-baseline justify-between gap-3">
                            <Label
                                htmlFor="website-title"
                                className={FIELD_LABEL}
                            >
                                {copy.websiteTitleLabel}
                            </Label>
                            <span
                                className={cn(
                                    "text-[13px] tabular-nums",
                                    values.websiteTitle.length >
                                        WEBSITE_TITLE_MAX - 5
                                        ? "text-destructive"
                                        : "text-muted-foreground",
                                )}
                            >
                                {values.websiteTitle.length} /{" "}
                                {WEBSITE_TITLE_MAX}
                            </span>
                        </div>
                        <Input
                            id="website-title"
                            value={values.websiteTitle}
                            maxLength={WEBSITE_TITLE_MAX}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    websiteTitle: event.target.value,
                                }))
                            }
                            onBlur={() => saveText("websiteTitle")}
                            className={FIELD}
                        />
                    </div>

                    <div>
                        <div className="mb-2 flex items-baseline justify-between gap-3">
                            <Label
                                htmlFor="meta-description"
                                className={FIELD_LABEL}
                            >
                                {copy.metaDescriptionLabel}
                            </Label>
                            <span
                                className={cn(
                                    "text-[13px] tabular-nums",
                                    values.metaDescription.length >
                                        META_DESCRIPTION_MAX - 10
                                        ? "text-destructive"
                                        : "text-muted-foreground",
                                )}
                            >
                                {values.metaDescription.length} /{" "}
                                {META_DESCRIPTION_MAX}
                            </span>
                        </div>
                        <Textarea
                            id="meta-description"
                            value={values.metaDescription}
                            maxLength={META_DESCRIPTION_MAX}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    metaDescription: event.target.value,
                                }))
                            }
                            onBlur={() => saveText("metaDescription")}
                            className={cn(
                                "min-h-29.5 rounded-lg border-border bg-background px-3.5 py-3 text-[15px] md:text-[15px]",
                                "dark:bg-background",
                            )}
                        />
                    </div>

                    <div className="rounded-xl bg-background p-4">
                        <p className="text-[11px] font-bold tracking-[0.08em] text-muted-foreground uppercase">
                            {copy.searchPreviewLabel}
                        </p>
                        <p className="mt-2.5 text-[13px] text-[#3c8f4e] dark:text-[#6cc47f]">
                            {copy.searchPreviewHost}
                        </p>
                        <p className="mt-1 text-[18px] leading-6 text-[#1a0dab] dark:text-[#8ab4f8]">
                            {values.websiteTitle}
                        </p>
                        <p className="mt-1 text-[13px] leading-4.75 text-muted-foreground">
                            {values.metaDescription}
                        </p>
                    </div>

                    <AutosaveStatus status={status} />
                </div>
            </section>

            <section className="mt-7">
                <h3 className={HEADING}>{copy.accessHeading}</h3>
                <div className="mt-4 flex flex-col gap-3.5">
                    {platformToggles.map((toggle) => (
                        <div key={toggle.name} className={TOGGLE_ROW}>
                            <div className="min-w-0">
                                <Label
                                    htmlFor={toggle.name}
                                    className="cursor-pointer text-[15px] leading-5 font-semibold"
                                >
                                    {toggle.title}
                                </Label>
                                <p className="text-[13px] leading-4.5 text-muted-foreground">
                                    {toggle.description}
                                </p>
                            </div>
                            <Switch
                                id={toggle.name}
                                checked={values[toggle.name]}
                                onCheckedChange={(next) =>
                                    saveToggle(toggle.name, next)
                                }
                                className={SWITCH}
                            />
                        </div>
                    ))}
                </div>
            </section>

            <section className="mt-7">
                <h3 className={HEADING}>{copy.defaultsHeading}</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <Label
                            htmlFor="platform-currency"
                            className={FIELD_LABEL}
                        >
                            {copy.currencyLabel}
                        </Label>
                        <NativeSelect
                            id="platform-currency"
                            value={values.currency}
                            onChange={(event) => {
                                const previous = values.currency;
                                const next = event.target.value;
                                setValues((current) => ({
                                    ...current,
                                    currency: next,
                                }));
                                save({ currency: next }, () =>
                                    setValues((current) => ({
                                        ...current,
                                        currency: previous,
                                    })),
                                );
                            }}
                            className={cn(
                                "mt-2 w-full",
                                "[&_select]:h-11 [&_select]:rounded-lg [&_select]:border-border [&_select]:bg-background! [&_select]:pl-3.5 [&_select]:text-[15px]",
                                "**:data-[slot=native-select-icon]:right-3.5",
                            )}
                        >
                            {platformCurrencies.map((currency) => (
                                <NativeSelectOption
                                    key={currency.value}
                                    value={currency.value}
                                >
                                    {currency.label}
                                </NativeSelectOption>
                            ))}
                        </NativeSelect>
                    </div>

                    <div>
                        <Label htmlFor="revenue-share" className={FIELD_LABEL}>
                            {copy.revenueShareLabel}
                        </Label>
                        <NativeSelect
                            id="revenue-share"
                            value={String(values.defaultRevenueShareBps)}
                            onChange={(event) => {
                                const previous = values.defaultRevenueShareBps;
                                const next = Number(event.target.value);
                                setValues((current) => ({
                                    ...current,
                                    defaultRevenueShareBps: next,
                                }));
                                save({ defaultRevenueShareBps: next }, () =>
                                    setValues((current) => ({
                                        ...current,
                                        defaultRevenueShareBps: previous,
                                    })),
                                );
                            }}
                            className={cn(
                                "mt-2 w-full",
                                "[&_select]:h-11 [&_select]:rounded-lg [&_select]:border-border [&_select]:bg-background! [&_select]:pl-3.5 [&_select]:text-[15px]",
                                "**:data-[slot=native-select-icon]:right-3.5",
                            )}
                        >
                            {revenueShareOptions.map((option) => (
                                <NativeSelectOption
                                    key={option.value}
                                    value={String(option.value)}
                                >
                                    {option.label}
                                </NativeSelectOption>
                            ))}
                        </NativeSelect>
                    </div>

                    <div>
                        <Label htmlFor="support-email" className={FIELD_LABEL}>
                            {copy.supportEmailLabel}
                        </Label>
                        <Input
                            id="support-email"
                            type="email"
                            inputMode="email"
                            autoComplete="off"
                            spellCheck={false}
                            value={values.supportEmail}
                            maxLength={SUPPORT_EMAIL_MAX}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    supportEmail: event.target.value,
                                }))
                            }
                            onBlur={() => saveText("supportEmail")}
                            className={cn(FIELD, "mt-2")}
                        />
                    </div>
                </div>
            </section>

            <section className="mt-7">
                <h3 className={cn(HEADING, "text-destructive")}>
                    {copy.dangerHeading}
                </h3>
                <div
                    className={cn(
                        TOGGLE_ROW,
                        "mt-4 border-destructive/40 bg-destructive/5",
                    )}
                >
                    <div className="min-w-0">
                        <Label
                            htmlFor={maintenanceToggle.name}
                            className="cursor-pointer text-[15px] leading-5 font-semibold"
                        >
                            {maintenanceToggle.title}
                        </Label>
                        <p className="text-[13px] leading-4.5 text-muted-foreground">
                            {maintenanceToggle.description}
                        </p>
                    </div>
                    <Switch
                        id={maintenanceToggle.name}
                        checked={values.maintenanceMode}
                        onCheckedChange={(next) => {
                            if (next) setConfirmMaintenance(true);
                            else saveToggle(maintenanceToggle.name, false);
                        }}
                        className={SWITCH}
                    />
                </div>
            </section>

            <MaintenanceDialog
                open={confirmMaintenance}
                onOpenChange={setConfirmMaintenance}
                pending={status === "saving"}
                onConfirm={() => {
                    setConfirmMaintenance(false);
                    saveToggle(maintenanceToggle.name, true);
                }}
            />
        </div>
    );
}

function AutosaveStatus({ status }: { status: SaveState }) {
    const copy = platformControlsCopy;

    if (status === "saving") {
        return (
            <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <LoaderCircleIcon aria-hidden className="size-4 animate-spin" />
                {copy.autosaveSaving}
            </p>
        );
    }

    if (status === "error") {
        return (
            <p
                role="status"
                className="flex items-center gap-2 text-[13px] text-destructive"
            >
                <CheckCheckIcon aria-hidden className="size-4" />
                {copy.autosaveError}
            </p>
        );
    }

    return (
        <p
            role="status"
            className={cn(
                "flex items-center gap-2 text-[13px]",
                status === "saved" ? "text-success" : "text-muted-foreground",
            )}
        >
            <CheckCheckIcon
                aria-hidden
                className={cn(
                    "size-4",
                    status === "saved" ? "" : "text-success",
                )}
            />
            {status === "saved" ? copy.autosaveSaved : copy.autosaveIdle}
        </p>
    );
}

export { PlatformControlsForm };
