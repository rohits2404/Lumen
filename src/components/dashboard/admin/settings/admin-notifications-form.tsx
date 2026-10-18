"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { SETTINGS_SUBMIT } from "@/components/dashboard/settings/settings-controls";
import { updateAdminNotifications } from "@/lib/actions/admin-notifications";
import {
    adminEmailNotifications,
    adminNotificationsCopy,
    adminNotificationsHeadings,
    adminNotifyAboutOptions,
    type AdminNotifyAboutValue,
} from "@/lib/config/admin-notifications";
import type { AdminNotificationSettings } from "@/lib/admin/notifications";
import { cn } from "@/lib/utils";

const TOGGLE_ROW =
    "flex items-center justify-between gap-4 rounded-xl border px-5 py-4";

const RADIO_ITEM = cn(
    "size-5 border-[1.5px] data-checked:border-primary",
    "data-checked:bg-transparent dark:data-checked:bg-transparent",
    "[&_[data-slot=radio-group-indicator]>span]:size-[9px]",
    "[&_[data-slot=radio-group-indicator]>span]:bg-primary",
);

const SWITCH = cn(
    "border-0 p-[3px] data-[size=default]:h-6.5 data-[size=default]:w-11.5",
    "data-unchecked:bg-track dark:data-unchecked:bg-track",
    "[&_[data-slot=switch-thumb]]:size-5",
    "[&_[data-slot=switch-thumb]]:data-checked:translate-x-full",
);

const HEADING = "text-lg font-bold";

function AdminNotificationsForm({
    settings,
}: {
    settings: AdminNotificationSettings;
}) {
    const [values, setValues] =
        React.useState<AdminNotificationSettings>(settings);
    const [pending, startTransition] = React.useTransition();

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startTransition(async () => {
            const result = await updateAdminNotifications(values);
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
        });
    }

    return (
        <form onSubmit={onSubmit}>
            <h2 id="admin-notify-about-heading" className={HEADING}>
                {adminNotificationsHeadings.notifyAbout}
            </h2>
            <RadioGroup
                name="adminNotifyAbout"
                value={values.adminNotifyAbout}
                onValueChange={(value: AdminNotifyAboutValue) =>
                    setValues((current) => ({
                        ...current,
                        adminNotifyAbout: value,
                    }))
                }
                aria-labelledby="admin-notify-about-heading"
                className="mt-1.75 gap-3.25"
            >
                {adminNotifyAboutOptions.map((option) => (
                    <div key={option.value} className="flex items-center gap-3">
                        <RadioGroupItem
                            id={`admin-notify-${option.value}`}
                            value={option.value}
                            className={RADIO_ITEM}
                        />
                        <Label
                            htmlFor={`admin-notify-${option.value}`}
                            className="cursor-pointer text-[15px] font-normal"
                        >
                            {option.label}
                        </Label>
                    </div>
                ))}
            </RadioGroup>

            <h2 className={cn(HEADING, "mt-8")}>
                {adminNotificationsHeadings.emails}
            </h2>
            <div className="mt-1.75 flex flex-col gap-3">
                {adminEmailNotifications.map((item) => (
                    <div key={item.name} className={TOGGLE_ROW}>
                        <div>
                            <Label
                                htmlFor={`admin-email-${item.name}`}
                                className="cursor-pointer text-base leading-6 font-semibold"
                            >
                                {item.title}
                            </Label>
                            <p className="mt-0.5 text-[13px] leading-4.5 text-muted-foreground">
                                {item.description}
                            </p>
                        </div>
                        <Switch
                            id={`admin-email-${item.name}`}
                            checked={values[item.name]}
                            onCheckedChange={(checked) =>
                                setValues((current) => ({
                                    ...current,
                                    [item.name]: checked,
                                }))
                            }
                            className={SWITCH}
                        />
                    </div>
                ))}
            </div>

            <Button type="submit" loading={pending} className={SETTINGS_SUBMIT}>
                {pending ? "Saving…" : adminNotificationsCopy.submit}
            </Button>
        </form>
    );
}

export { AdminNotificationsForm };
