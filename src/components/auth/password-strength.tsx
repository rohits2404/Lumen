"use client";

import { cn } from "@/lib/utils";

const MIN_PASSWORD_LENGTH = 8;

function scorePassword(value: string) {
    if (!value) return 0;
    let score = 0;
    if (value.length >= MIN_PASSWORD_LENGTH) score += 1;
    if (value.length >= 12) score += 1;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
    if (/\d/.test(value) && /[^\w\s]/.test(value)) score += 1;
    return Math.min(score, 4);
}

const strengthLabels = ["Too short", "Weak", "Fair", "Good", "Strong"];
const strengthTones = [
    "bg-destructive",
    "bg-destructive",
    "bg-warning",
    "bg-star",
    "bg-success",
];

function PasswordStrength({ value }: { value: string }) {
    const score = scorePassword(value);

    if (!value) return null;

    return (
        <div className="mt-2 flex items-center gap-3">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-track">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-200",
                        strengthTones[score],
                    )}
                    style={{ width: `${Math.max(score, 1) * 25}%` }}
                />
            </div>
            <span className="w-17.5 shrink-0 text-right text-[13px] text-muted-foreground">
                {strengthLabels[score]}
            </span>
        </div>
    );
}

export { PasswordStrength, MIN_PASSWORD_LENGTH, scorePassword };
