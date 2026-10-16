"use client";

import * as React from "react";
import { ArrowUpDownIcon, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import {
    SETTINGS_CONTROL,
    SETTINGS_DESCRIPTION,
    SETTINGS_LABEL,
    SETTINGS_SUBMIT,
} from "@/components/dashboard/settings/settings-controls";
import { updateAccount, type AccountFieldErrors } from "@/lib/actions/account";
import type { Account } from "@/lib/account";
import { languages, type TimeZoneOption } from "@/lib/config/locale";
import { cn } from "@/lib/utils";

function parseDateInput(value: string | null) {
    if (!value) return undefined;
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return undefined;
    return new Date(year, month - 1, day);
}

function formatDateInput(date: Date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

const SELECT_TRIGGER = cn(
    SETTINGS_CONTROL,
    "w-full justify-between gap-2 py-0 pr-3.5 data-[size=default]:h-11.5",
    "[&>svg:last-child]:hidden",
);

function AccountForm({
    account,
    timeZones,
}: {
    account: Account;
    timeZones: TimeZoneOption[];
}) {
    const [dateOfBirth, setDateOfBirth] = React.useState<Date | undefined>(() =>
        parseDateInput(account.dateOfBirth),
    );
    const [datePickerOpen, setDatePickerOpen] = React.useState(false);
    const [errors, setErrors] = React.useState<AccountFieldErrors>({});
    const [pending, startTransition] = React.useTransition();

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setErrors({});

        startTransition(async () => {
            const result = await updateAccount(formData);
            setErrors(result.errors ?? {});
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
        });
    }

    return (
        <form onSubmit={onSubmit}>
            <input
                type="hidden"
                name="dateOfBirth"
                value={dateOfBirth ? formatDateInput(dateOfBirth) : ""}
            />

            <FieldGroup>
                <Field data-invalid={errors.dateOfBirth ? true : undefined}>
                    <FieldLabel
                        htmlFor="date-of-birth"
                        className={SETTINGS_LABEL}
                    >
                        Date of birth
                    </FieldLabel>
                    <Popover
                        open={datePickerOpen}
                        onOpenChange={setDatePickerOpen}
                    >
                        <PopoverTrigger
                            render={
                                <Button
                                    id="date-of-birth"
                                    type="button"
                                    variant="outline"
                                    aria-invalid={
                                        errors.dateOfBirth ? true : undefined
                                    }
                                    className={cn(
                                        SETTINGS_CONTROL,
                                        "w-full justify-between gap-2 pr-3.5 font-normal hover:bg-background aria-expanded:bg-background",
                                        !dateOfBirth && "text-muted-foreground",
                                    )}
                                />
                            }
                        >
                            {dateOfBirth
                                ? dateOfBirth.toLocaleDateString("en-US", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                  })
                                : "Pick a Date"}
                            <CalendarIcon className="text-muted-foreground" />
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={dateOfBirth}
                                onSelect={(date) => {
                                    setDateOfBirth(date);
                                    setDatePickerOpen(false);
                                }}
                                captionLayout="dropdown"
                                startMonth={new Date(1920, 0)}
                                endMonth={new Date()}
                                disabled={{ after: new Date() }}
                                defaultMonth={dateOfBirth ?? new Date(1995, 0)}
                                autoFocus
                            />
                        </PopoverContent>
                    </Popover>
                    {errors.dateOfBirth ? (
                        <FieldError className={SETTINGS_DESCRIPTION}>
                            {errors.dateOfBirth}
                        </FieldError>
                    ) : (
                        <FieldDescription className={SETTINGS_DESCRIPTION}>
                            Your Date Of Birth Is Used To Calculate Your Age.
                        </FieldDescription>
                    )}
                </Field>

                <Field data-invalid={errors.language ? true : undefined}>
                    <FieldLabel htmlFor="language" className={SETTINGS_LABEL}>
                        Language
                    </FieldLabel>
                    <Select
                        name="language"
                        defaultValue={account.language ?? undefined}
                    >
                        <SelectTrigger
                            id="language"
                            aria-invalid={errors.language ? true : undefined}
                            className={SELECT_TRIGGER}
                        >
                            <SelectValue placeholder="Select Language">
                                {(current: string) =>
                                    languages.find(
                                        (language) =>
                                            language.value === current,
                                    )?.label ?? "Select Language"
                                }
                            </SelectValue>
                            <ArrowUpDownIcon className="shrink-0 text-muted-foreground" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {languages.map((language) => (
                                    <SelectItem
                                        key={language.value}
                                        value={language.value}
                                    >
                                        {language.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {errors.language ? (
                        <FieldError className={SETTINGS_DESCRIPTION}>
                            {errors.language}
                        </FieldError>
                    ) : (
                        <FieldDescription className={SETTINGS_DESCRIPTION}>
                            This Is The Language That Will Be Used In The
                            Dashboard.
                        </FieldDescription>
                    )}
                </Field>

                <Field data-invalid={errors.timeZone ? true : undefined}>
                    <FieldLabel htmlFor="time-zone" className={SETTINGS_LABEL}>
                        Time Zone
                    </FieldLabel>
                    <Select
                        name="timeZone"
                        defaultValue={account.timeZone ?? undefined}
                    >
                        <SelectTrigger
                            id="time-zone"
                            aria-invalid={errors.timeZone ? true : undefined}
                            className={SELECT_TRIGGER}
                        >
                            <SelectValue placeholder="(GMT+00:00) London">
                                {(current: string) =>
                                    timeZones.find(
                                        (zone) => zone.value === current,
                                    )?.label ?? "(GMT+00:00) London"
                                }
                            </SelectValue>
                            <ArrowUpDownIcon className="shrink-0 text-muted-foreground" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {timeZones.map((zone) => (
                                    <SelectItem
                                        key={zone.value}
                                        value={zone.value}
                                    >
                                        {zone.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {errors.timeZone ? (
                        <FieldError className={SETTINGS_DESCRIPTION}>
                            {errors.timeZone}
                        </FieldError>
                    ) : (
                        <FieldDescription className={SETTINGS_DESCRIPTION}>
                            Used For Course Deadlines And Live Session Times.
                        </FieldDescription>
                    )}
                </Field>
            </FieldGroup>

            <Button type="submit" loading={pending} className={SETTINGS_SUBMIT}>
                {pending ? "Saving…" : "Update Account"}
            </Button>
        </form>
    );
}

export { AccountForm };
