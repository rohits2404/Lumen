"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, CheckIcon, MailIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import {
    MIN_PASSWORD_LENGTH,
    PasswordStrength,
} from "@/components/auth/password-strength";
import { authClient } from "@/lib/auth-client";

function BackToSignIn() {
    return (
        <p className="mt-5 text-center">
            <Link
                href="/login"
                className="text-[15px] font-bold text-foreground transition-opacity hover:opacity-80"
            >
                Back To Sign In
            </Link>
        </p>
    );
}

function ResetPasswordForm({
    token,
    linkError,
}: {
    token?: string;
    linkError?: string;
}) {
    const router = useRouter();
    const [stage, setStage] = React.useState<
        "request" | "sent" | "reset" | "done" | "invalid"
    >(linkError ? "invalid" : token ? "reset" : "request");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);
    const [pending, setPending] = React.useState(false);

    async function sendLink(address: string) {
        setError(null);
        setPending(true);
        const { error: requestError } = await authClient.requestPasswordReset({
            email: address,
            redirectTo: `${window.location.origin}/reset-password`,
        });
        setPending(false);
        if (requestError) {
            setError(requestError.message ?? "We Couldn't Send That Link.");
            return;
        }
        setStage("sent");
    }

    async function onRequest(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const address = String(new FormData(event.currentTarget).get("email"));
        setEmail(address);
        await sendLink(address);
    }

    async function onReset(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setPending(true);
        const { error: resetError } = await authClient.resetPassword({
            newPassword: password,
            token,
        });
        setPending(false);
        if (resetError) {
            setError(resetError.message ?? "That Link Is No Longer Valid.");
            return;
        }
        setStage("done");
    }

    if (stage === "sent") {
        return (
            <div className="flex flex-col">
                <span className="grid size-11 place-items-center rounded-xl bg-hover text-foreground">
                    <MailIcon className="size-5" />
                </span>
                <h1 className="mt-5 text-[32px] leading-tight">
                    Check your email
                </h1>
                <p className="mt-2 text-[15px] text-muted-foreground">
                    If An Account Uses{" "}
                    <span className="text-foreground">{email}</span>, A Reset
                    Link Is On Its Way. It Expires In An Hour.
                </p>
                <Button
                    variant="outline"
                    loading={pending}
                    onClick={() => sendLink(email)}
                    className="mt-6 h-12 gap-2 bg-card text-[15px] font-semibold"
                >
                    Send It Again
                </Button>
                <BackToSignIn />
            </div>
        );
    }

    if (stage === "done") {
        return (
            <div className="flex flex-col">
                <span className="grid size-11 place-items-center rounded-xl bg-success/15 text-success">
                    <CheckIcon className="size-5" strokeWidth={3} />
                </span>
                <h1 className="mt-5 text-[32px] leading-tight">
                    Password updated
                </h1>
                <p className="mt-2 text-[15px] text-muted-foreground">
                    Every Other Session Has Been Signed Out. Use The New
                    Password From Here On.
                </p>
                <Button
                    nativeButton={false}
                    className="mt-6 h-12 gap-2 text-[15px] font-semibold"
                    render={<Link href="/login" />}
                >
                    Sign In
                    <ArrowRightIcon data-icon="inline-end" />
                </Button>
            </div>
        );
    }

    if (stage === "invalid") {
        return (
            <div className="flex flex-col">
                <h1 className="text-[32px] leading-tight">
                    That link has expired
                </h1>
                <p className="mt-2 text-[15px] text-muted-foreground">
                    Reset Links Last An Hour And Work Once. Ask For A Fresh One
                    And It Will Be In Your Inbox In A Moment.
                </p>
                <Button
                    onClick={() => {
                        setStage("request");
                        setError(null);
                        router.replace("/reset-password");
                    }}
                    className="mt-6 h-12 gap-2 text-[15px] font-semibold"
                >
                    Send a new link
                    <ArrowRightIcon data-icon="inline-end" />
                </Button>
                <BackToSignIn />
            </div>
        );
    }

    if (stage === "reset") {
        return (
            <div className="flex flex-col">
                <h1 className="text-[32px] leading-tight">
                    Choose a new password
                </h1>
                <p className="mt-2 text-[15px] text-muted-foreground">
                    Pick Something You Haven’t Used On Lumen Before.
                </p>

                <form onSubmit={onReset} className="mt-6 flex flex-col">
                    {error ? (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : null}

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="new-password">New password</Label>
                        <PasswordInput
                            id="new-password"
                            name="password"
                            autoComplete="new-password"
                            required
                            minLength={MIN_PASSWORD_LENGTH}
                            placeholder={`At Least ${MIN_PASSWORD_LENGTH} Characters`}
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                        />
                        <PasswordStrength value={password} />
                    </div>

                    <Button
                        type="submit"
                        loading={pending}
                        className="mt-5 h-12 gap-2 text-[15px] font-semibold"
                    >
                        Reset Password
                        <ArrowRightIcon data-icon="inline-end" />
                    </Button>
                </form>
                <BackToSignIn />
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <h1 className="text-[32px] leading-tight">Reset your password</h1>
            <p className="mt-2 text-[15px] text-wrap text-muted-foreground">
                Enter The Email On Your Account And We’ll Send A Link To Reset
                Your Password.
            </p>

            <form onSubmit={onRequest} className="mt-6 flex flex-col">
                {error ? (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : null}

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="you@example.com"
                        className="h-11.5 bg-card text-[15px] md:text-[15px] dark:bg-card"
                    />
                </div>

                <Button
                    type="submit"
                    loading={pending}
                    className="mt-5 h-12 gap-2 text-[15px] font-semibold"
                >
                    Send Reset Link
                    <ArrowRightIcon data-icon="inline-end" />
                </Button>
            </form>

            <BackToSignIn />
        </div>
    );
}

export { ResetPasswordForm };
