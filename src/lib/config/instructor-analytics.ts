import type { LucideIcon } from "lucide-react";
import {
    CircleCheckIcon,
    MessageCircleQuestionMarkIcon,
    UsersRoundIcon,
    Volume2Icon,
} from "lucide-react";

import type { EnrollmentSource } from "@/generated/prisma/client";

export type AnalyticsRange = "7d" | "30d" | "90d" | "12m";

export const analyticsRanges: {
    value: AnalyticsRange;
    label: string;
    days: number;
}[] = [
    { value: "7d", label: "Last 7 Days", days: 7 },
    { value: "30d", label: "Last 30 Days", days: 30 },
    { value: "90d", label: "Last 90 Days", days: 90 },
    { value: "12m", label: "Last 12 Months", days: 365 },
];

export const ANALYTICS_DEFAULT_RANGE: AnalyticsRange = "30d";

export const analyticsRangeValues = new Set<string>(
    analyticsRanges.map((range) => range.value),
);

export function rangeDays(range: AnalyticsRange): number {
    return (
        analyticsRanges.find((entry) => entry.value === range)?.days ??
        analyticsRanges[1]!.days
    );
}

export function rangeLabel(range: AnalyticsRange): string {
    return (
        analyticsRanges.find((entry) => entry.value === range)?.label ??
        analyticsRanges[1]!.label
    );
}

export const analyticsCopy = {
    title: "Analytics",
    description:
        "How Your Courses Are Performing — Enrolment, Completion, Watch Time, And Where Learners Find You.",
    rangeLabel: "Date Range",
    enrolmentsHeading: "New Enrolments By Month",
    enrolmentsLead: (total: number, best: string | null) =>
        best === null
            ? `${total.toLocaleString("en-US")} ${total === 1 ? "Learner" : "Learners"} Joined`
            : `${total.toLocaleString("en-US")} ${
                  total === 1 ? "Learner" : "Learners"
              } Joined · Best Month ${best}`,
    enrolmentsEmpty: "No Enrolments In The Last Six Months.",
    sourcesHeading: "Where Enrolments Come From",
    sourcesEmpty: "No Enrolments In This Period.",
    performanceHeading: "Course Performance",
    performanceLead: "Ranked By New Enrolments In This Period",
    performanceEmpty: "No Course Has Been Enrolled In During This Period.",
    columns: {
        course: "Course",
        enrolments: "Enrolments",
        completion: "Completion",
        watchTime: "Watch Time",
    },
    empty: {
        title: "Nothing To Measure Yet",
        description:
            "Publish A Course And This Page Fills In — Enrolment, Completion, Watch Time, And Where Your Learners Come From.",
    },
} as const;

export const analyticsStatCards: {
    key: "enrolments" | "openQuestions" | "completion" | "watchTime";
    label: string;
    icon: LucideIcon;
    format: "count" | "percent1";
    deltaFormat: "percent" | "count";
}[] = [
    {
        key: "enrolments",
        label: "New Enrolments",
        icon: UsersRoundIcon,
        format: "count",
        deltaFormat: "percent",
    },
    {
        key: "openQuestions",
        label: "Open Questions",
        icon: MessageCircleQuestionMarkIcon,
        format: "count",
        deltaFormat: "count",
    },
    {
        key: "completion",
        label: "Completion Rate",
        icon: CircleCheckIcon,
        format: "percent1",
        deltaFormat: "percent",
    },
    {
        key: "watchTime",
        label: "Avg. Watch Time",
        icon: Volume2Icon,
        format: "percent1",
        deltaFormat: "percent",
    },
];

const rateDigits = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export const analyticsFootnotes = {
    enrolments: (perDay: number) => {
        if (perDay >= 1) {
            return `${Math.floor(perDay).toLocaleString("en-US")} Per Day Average`;
        }
        const perWeek = perDay * 7;
        if (perWeek >= 1)
            return `${rateDigits.format(perWeek)} Per Week Average`;
        return `${rateDigits.format(perDay * 30)} Per Month Average`;
    },
    openQuestions: "Awaiting Your Reply",
    completion: "Across Active Cohorts",
    watchTime: "Of Each Lesson",
} as const;

export const enrolmentSources: {
    value: EnrollmentSource;
    label: string;
    dot: string;
    bar: string;
}[] = [
    {
        value: "PURCHASE",
        label: "Direct Purchase",
        dot: "bg-accent-2",
        bar: "bg-accent-2",
    },
    {
        value: "BUSINESS_PLAN",
        label: "Lumen Business",
        dot: "bg-success",
        bar: "bg-success",
    },
    {
        value: "COUPON",
        label: "Coupon Redemption",
        dot: "bg-accent-1",
        bar: "bg-accent-1",
    },
    {
        value: "ADMIN_GRANT",
        label: "Granted By An Admin",
        dot: "bg-star",
        bar: "bg-star",
    },
    {
        value: "FREE",
        label: "Free Enrolment",
        dot: "bg-warning",
        bar: "bg-warning",
    },
];

export const ANALYTICS_COURSE_LIMIT = 20;

export const ENROLMENT_MONTHS = 6;
