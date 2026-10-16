"use client";

import * as React from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
    SETTINGS_CONTROL,
    SETTINGS_DESCRIPTION,
    SETTINGS_LABEL,
    SETTINGS_SUBMIT,
} from "@/components/dashboard/settings/settings-controls";
import { updateProfile, type ProfileFieldErrors } from "@/lib/actions/profile";
import {
    MAX_BIO_LENGTH,
    MAX_EMAIL_LENGTH,
    MAX_NAME_LENGTH,
    MAX_PROFILE_URLS,
    USERNAME_CHANGE_DAYS,
    USERNAME_MAX_LENGTH,
} from "@/lib/config/settings";
import type { Profile } from "@/lib/profile";
import { cn } from "@/lib/utils";

function ProfileForm({ profile }: { profile: Profile }) {
    const [username, setUsername] = React.useState(profile.username);
    const [urls, setUrls] = React.useState<string[]>(
        profile.urls.length > 0 ? profile.urls : [""],
    );
    const [errors, setErrors] = React.useState<ProfileFieldErrors>({});
    const [pending, startTransition] = React.useTransition();

    const locked = profile.usernameLockedUntil;

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setErrors({});

        startTransition(async () => {
            const result = await updateProfile(formData);
            setErrors(result.errors ?? {});
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
        });
    }

    return (
        <form onSubmit={onSubmit}>
            <FieldGroup>
                <Field data-invalid={errors.name ? true : undefined}>
                    <FieldLabel htmlFor="name" className={SETTINGS_LABEL}>
                        Full Name
                    </FieldLabel>
                    <Input
                        id="name"
                        name="name"
                        defaultValue={profile.name}
                        maxLength={MAX_NAME_LENGTH}
                        autoComplete="name"
                        required
                        aria-invalid={errors.name ? true : undefined}
                        className={SETTINGS_CONTROL}
                    />
                    {errors.name ? (
                        <FieldError className={SETTINGS_DESCRIPTION}>
                            {errors.name}
                        </FieldError>
                    ) : (
                        <FieldDescription className={SETTINGS_DESCRIPTION}>
                            The Name Shown On Your Profile, In Discussions And
                            On Certificates.
                        </FieldDescription>
                    )}
                </Field>

                <Field data-invalid={errors.username ? true : undefined}>
                    <FieldLabel htmlFor="username" className={SETTINGS_LABEL}>
                        Username
                    </FieldLabel>
                    <Input
                        id="username"
                        name="username"
                        value={username}
                        onChange={(event) =>
                            setUsername(
                                event.target.value.trimStart().toLowerCase(),
                            )
                        }
                        maxLength={USERNAME_MAX_LENGTH}
                        autoComplete="username"
                        spellCheck={false}
                        aria-invalid={errors.username ? true : undefined}
                        className={SETTINGS_CONTROL}
                    />
                    {errors.username ? (
                        <FieldError className={SETTINGS_DESCRIPTION}>
                            {errors.username}
                        </FieldError>
                    ) : (
                        <FieldDescription className={SETTINGS_DESCRIPTION}>
                            This Is Your Public Display Name. It Can Be Your
                            Real Name Or A Pseudonym. You Can Only Change This
                            Once Every {USERNAME_CHANGE_DAYS} days.
                            {locked
                                ? ` Next Change Available ${locked.toLocaleDateString(
                                      "en-US",
                                      {
                                          month: "long",
                                          day: "numeric",
                                          year: "numeric",
                                      },
                                  )}.`
                                : ""}
                        </FieldDescription>
                    )}
                </Field>

                <Field data-invalid={errors.email ? true : undefined}>
                    <FieldLabel htmlFor="email" className={SETTINGS_LABEL}>
                        Email
                    </FieldLabel>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        inputMode="email"
                        defaultValue={profile.email}
                        maxLength={MAX_EMAIL_LENGTH}
                        autoComplete="email"
                        spellCheck={false}
                        required
                        aria-invalid={errors.email ? true : undefined}
                        aria-describedby="email-description"
                        className={SETTINGS_CONTROL}
                    />
                    {errors.email ? (
                        <FieldError className={SETTINGS_DESCRIPTION}>
                            {errors.email}
                        </FieldError>
                    ) : (
                        <FieldDescription
                            id="email-description"
                            className={SETTINGS_DESCRIPTION}
                        >
                            Used To Sign In. Changing It Sends A Confirmation
                            Link To Your Current Address — The New One Takes
                            Effect Once You Follow It.
                        </FieldDescription>
                    )}
                </Field>

                <Field data-invalid={errors.bio ? true : undefined}>
                    <FieldLabel htmlFor="bio" className={SETTINGS_LABEL}>
                        Bio
                    </FieldLabel>
                    <Textarea
                        id="bio"
                        name="bio"
                        defaultValue={profile.bio}
                        maxLength={MAX_BIO_LENGTH}
                        placeholder="Learning Design And Front-End Craft, One Lesson At A Time."
                        aria-invalid={errors.bio ? true : undefined}
                        className="min-h-19.5 bg-background px-3.5 py-2.5 text-[15px] md:text-[15px] dark:bg-background"
                    />
                    {errors.bio ? (
                        <FieldError className={SETTINGS_DESCRIPTION}>
                            {errors.bio}
                        </FieldError>
                    ) : (
                        <FieldDescription className={SETTINGS_DESCRIPTION}>
                            You Can @mention Other Learners And Instructors To
                            Link To Them.
                        </FieldDescription>
                    )}
                </Field>

                <Field className="gap-0">
                    <FieldLabel htmlFor="url-0" className={SETTINGS_LABEL}>
                        URLs
                    </FieldLabel>
                    <FieldDescription
                        className={cn("mt-0.5", SETTINGS_DESCRIPTION)}
                    >
                        Add Links To Your Website, Blog, Or Social Media
                        Profiles.
                    </FieldDescription>

                    <div className="mt-2.5 flex flex-col gap-2.5">
                        {urls.map((url, index) => (
                            <div key={index}>
                                <div className="relative">
                                    <Input
                                        id={`url-${index}`}
                                        name="url"
                                        type="text"
                                        inputMode="url"
                                        value={url}
                                        onChange={(event) =>
                                            setUrls((current) =>
                                                current.map(
                                                    (entry, position) =>
                                                        position === index
                                                            ? event.target.value
                                                            : entry,
                                                ),
                                            )
                                        }
                                        placeholder="https://example.com"
                                        spellCheck={false}
                                        aria-invalid={
                                            errors.urls?.[index]
                                                ? true
                                                : undefined
                                        }
                                        className={cn(
                                            SETTINGS_CONTROL,
                                            "pr-11",
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label={`Remove URL ${index + 1}`}
                                        onClick={() =>
                                            setUrls((current) => {
                                                const next = current.filter(
                                                    (_, position) =>
                                                        position !== index,
                                                );
                                                return next.length > 0
                                                    ? next
                                                    : [""];
                                            })
                                        }
                                        className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground"
                                    >
                                        <XIcon />
                                    </Button>
                                </div>
                                {errors.urls?.[index] ? (
                                    <FieldError
                                        className={cn(
                                            "mt-1.5",
                                            SETTINGS_DESCRIPTION,
                                        )}
                                    >
                                        {errors.urls[index]}
                                    </FieldError>
                                ) : null}
                            </div>
                        ))}
                    </div>

                    <div className="mt-3">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={urls.length >= MAX_PROFILE_URLS}
                            onClick={() =>
                                setUrls((current) => [...current, ""])
                            }
                            className="h-10 bg-card px-5"
                        >
                            Add URL
                        </Button>
                    </div>
                </Field>
            </FieldGroup>

            <Button type="submit" loading={pending} className={SETTINGS_SUBMIT}>
                {pending ? "Saving…" : "Update Profile"}
            </Button>
        </form>
    );
}

export { ProfileForm };
