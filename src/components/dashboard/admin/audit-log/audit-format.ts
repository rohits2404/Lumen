import { format, formatDistanceToNowStrict } from "date-fns";

const DAY = 24 * 60 * 60 * 1000;

export function formatAuditWhen(date: Date, now = Date.now()) {
    const elapsed = now - date.getTime();
    if (elapsed >= DAY && elapsed < 2 * DAY) return "Yesterday";
    return formatDistanceToNowStrict(date, { addSuffix: true });
}

export function formatAuditExact(date: Date) {
    return format(date, "d MMM yyyy 'at' HH:mm:ss");
}
