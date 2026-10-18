"use client";

import * as React from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
    submitInstructorApplication,
    type InstructorApplicationFormErrors,
} from "@/lib/actions/instructor-application";

function InstructorApplicationForm() {
    const [errors, setErrors] = React.useState<InstructorApplicationFormErrors>(
        {},
    );
    const [success, setSuccess] = React.useState<string | null>(null);
    const [pending, startTransition] = React.useTransition();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setErrors({});
        setSuccess(null);

        startTransition(async () => {
            const result = await submitInstructorApplication(form);
            setErrors(result.errors ?? {});
            setSuccess(result.ok ? result.message : null);

            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
        });
    }

    return (
        <form onSubmit={onSubmit} className="mt-8 space-y-6" noValidate>
            {success ? (
                <Alert className="border-emerald-500/30 bg-emerald-500/5 text-emerald-950 dark:text-emerald-100">
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            ) : null}

            {Object.keys(errors).length > 0 ? (
                <Alert variant="destructive">
                    <AlertDescription>
                        Check The Highlighted Fields And Try Again.
                    </AlertDescription>
                </Alert>
            ) : null}

            <div className="space-y-2">
                <Label htmlFor="pitch">Teaching Pitch</Label>
                <Textarea
                    id="pitch"
                    name="pitch"
                    placeholder="I Teach Product Design Fundamentals Through Bite-Sized Projects And Live Critique Sessions."
                    className="min-h-36 bg-background text-[15px] md:text-[15px] dark:bg-background"
                    aria-invalid={errors.pitch ? true : undefined}
                    required
                />
                {errors.pitch ? (
                    <p className="text-sm text-destructive">{errors.pitch}</p>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Share The Kind Of Students You Want To Help, The Topics
                        You Teach, And Why Your Experience Makes You A Strong
                        Instructor.
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="portfolioUrls">
                    Portfolio Or Relevant Links
                </Label>
                <Textarea
                    id="portfolioUrls"
                    name="portfolioUrls"
                    placeholder="https://yourwebsite.com&#10;https://github.com/yourprofile&#10;https://linkedin.com/in/yourname"
                    className="min-h-28 bg-background text-[15px] md:text-[15px] dark:bg-background"
                    aria-invalid={errors.portfolioUrls ? true : undefined}
                />
                {errors.portfolioUrls ? (
                    <p className="text-sm text-destructive">
                        {errors.portfolioUrls}
                    </p>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Add Up To Five Links To Your Portfolio, Articles, Social
                        Profiles, Or Prior Teaching Work. Add One URL Per Line.
                    </p>
                )}
            </div>

            <Button
                type="submit"
                loading={pending}
                className="h-12 gap-2 px-6 text-[15px] font-semibold"
            >
                Submit Application
            </Button>
        </form>
    );
}

export { InstructorApplicationForm };
