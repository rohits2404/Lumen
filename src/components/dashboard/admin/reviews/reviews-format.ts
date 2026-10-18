import { format, formatDistanceStrict } from "date-fns";

export function formatReportedAt(date: Date, now: Date) {
    return formatDistanceStrict(date, now, { addSuffix: true });
}

export function formatReportedExact(date: Date) {
    return format(date, "d MMM yyyy 'at' HH:mm");
}
