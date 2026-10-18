"use client";

import * as React from "react";
import { BadgeCheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import {
    SETTINGS_CONTROL,
    SETTINGS_DESCRIPTION,
    SETTINGS_LABEL,
    SETTINGS_SUBMIT,
} from "@/components/dashboard/settings/settings-controls";
import { updateAdminProfile } from "@/lib/actions/admin-settings";
import { adminProfileCopy } from "@/lib/config/admin-settings";
import { MAX_EMAIL_LENGTH, MAX_NAME_LENGTH } from "@/lib/config/settings";
import type { AdminProfile } from "@/lib/admin/settings";

function AdminProfileForm({ profile }: { profile: AdminProfile }) {
    const [pending, startTransition] = React.useTransition();
    const [error, setError] = React.useState<string | null>(null);

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setError(null);

        startTransition(async () => {
            const result = await updateAdminProfile(formData);
            setError(result.emailError ?? null);
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
        });
    }

    return (
        <form onSubmit={onSubmit}>
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="admin-name" className={SETTINGS_LABEL}>
                        {adminProfileCopy.nameLabel}
                    </FieldLabel>
                    <Input
                        id="admin-name"
                        name="name"
                        defaultValue={profile.name}
                        maxLength={MAX_NAME_LENGTH}
                        autoComplete="name"
                        required
                        className={SETTINGS_CONTROL}
                    />
                    <FieldDescription className={SETTINGS_DESCRIPTION}>
                        {adminProfileCopy.nameDescription}
                    </FieldDescription>
                </Field>

                <Field data-invalid={error ? true : undefined}>
                    <FieldLabel
                        htmlFor="admin-email"
                        className={SETTINGS_LABEL}
                    >
                        {adminProfileCopy.emailLabel}
                    </FieldLabel>
                    <Input
                        id="admin-email"
                        name="email"
                        type="email"
                        inputMode="email"
                        defaultValue={profile.email}
                        maxLength={MAX_EMAIL_LENGTH}
                        autoComplete="email"
                        spellCheck={false}
                        required
                        aria-invalid={error ? true : undefined}
                        aria-describedby="admin-email-description"
                        className={SETTINGS_CONTROL}
                    />
                    {error ? (
                        <FieldError className={SETTINGS_DESCRIPTION}>
                            {error}
                        </FieldError>
                    ) : (
                        <FieldDescription
                            id="admin-email-description"
                            className={SETTINGS_DESCRIPTION}
                        >
                            {adminProfileCopy.emailDescription}
                        </FieldDescription>
                    )}
                </Field>
            </FieldGroup>

            <div className="mt-5 flex items-center gap-3.5 rounded-xl bg-background px-4 py-3">
                <span
                    aria-hidden
                    className="grid size-9 shrink-0 place-items-center rounded-lg bg-role-admin/10"
                >
                    <BadgeCheckIcon className="size-4.5 text-role-admin" />
                </span>
                <div className="min-w-0">
                    <p className="text-[15px] leading-5 font-semibold">
                        {adminProfileCopy.roleTitle}
                    </p>
                    <p className="text-[13px] leading-4.5 text-muted-foreground">
                        {adminProfileCopy.roleDescription}
                    </p>
                </div>
            </div>

            <Button type="submit" loading={pending} className={SETTINGS_SUBMIT}>
                {adminProfileCopy.submit}
            </Button>
        </form>
    );
}

export { AdminProfileForm };
