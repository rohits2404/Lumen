import { format, formatDistanceToNowStrict } from "date-fns";

const DAY = 24 * 60 * 60 * 1000;

export function formatSubmittedAt(date: Date | null, now: Date): string | null {
    if (!date) return null;
    const elapsed = now.getTime() - date.getTime();
    if (elapsed >= DAY && elapsed < 2 * DAY) return "Submitted Yesterday";
    return `Submitted ${formatDistanceToNowStrict(date, { addSuffix: true })}`;
}

export function formatSubmittedExact(date: Date) {
    return format(date, "d MMM yyyy 'at' HH:mm");
}
