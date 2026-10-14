import { cn } from "@/lib/utils";
import {
    ArrowRightIcon,
    ArrowUpDownIcon,
    AwardIcon,
    CheckIcon,
    ClockIcon,
    FileQuestionMarkIcon,
    MessageCircleQuestionMarkIcon,
} from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Link from "next/link";

const features = [
    {
        icon: FileQuestionMarkIcon,
        title: "Quizzes That Teach",
        body: "Every Question Explains Itself After You Answer. Retake As Often As You Like — Your Best Score Sticks.",
    },
    {
        icon: MessageCircleQuestionMarkIcon,
        title: "Ask Inside The Lesson",
        body: "Q&A Lives On The Course Page, Scoped To Enrolled Learners. Your Instructor Answers Where You Got Stuck.",
    },
    {
        icon: AwardIcon,
        title: "Verifiable Certificates",
        body: "Issued Automatically, With A Credential ID Anyone Can Check. Add It Straight To Your Profile.",
    },
    {
        icon: ArrowUpDownIcon,
        title: "One Account, Both Roles",
        body: "Learn On Monday, Teach On Tuesday. Switch Modes And The Whole Workspace Follows.",
    },
];

const audiences = [
    {
        eyebrow: "For Learners",
        tint: "bg-accent-2/10 text-accent-2",
        check: "bg-success",
        title: "Finish What You Start.",
        body: "Most Courses Get Abandoned Around Lesson Four. Lumen Is Designed To Get You Past It.",
        points: [
            "Pick Up Exactly Where You Left Off, On Any Device",
            "Timestamped Notes So Revision Takes Minutes, Not Hours",
            "Ask Questions Inside The Lesson And Get Real Answers",
            "Lifetime Access To Every Course You Buy Outright",
        ],
        cta: {
            label: "Browse Courses",
            href: "/courses",
            variant: "default" as const,
        },
    },
    {
        eyebrow: "For Instructors",
        tint: "bg-accent-1/10 text-accent-1",
        check: "bg-accent-1",
        title: "Teach Without The Admin.",
        body: "Build A Course In An Afternoon, And Let The Platform Handle Payments, Hosting, And Support.",
        points: [
            "Drag-And-Drop Builder For Video, Articles, And Quizzes",
            "Keep Up To 70% Of Revenue, Paid On The 1st Monthly",
            "Analytics That Show Which Lesson Loses People",
            "Coupons, Reviews, And Student Messaging Built In",
        ],
        cta: {
            label: "Start Teaching",
            href: "/teach",
            variant: "accent" as const,
        },
    },
];

const timelineMarkers = [17.9, 44, 71];

function FeatureIcon({
    icon: Icon,
    brand,
}: {
    icon: typeof ClockIcon;
    brand?: boolean;
}) {
    return (
        <span
            className={cn(
                "grid place-items-center rounded-xl",
                brand
                    ? "bg-logo size-11 text-white"
                    : "size-10.5 bg-hover text-foreground",
            )}
        >
            <Icon className={brand ? "size-5" : "size-4.5"} />
        </span>
    );
}

function NoteTimeline() {
    return (
        <div className="mt-6 rounded-xl border bg-soft p-4 lg:mt-auto">
            <div className="relative h-1.5 rounded-full bg-track">
                <div className="h-full w-[44.5%] rounded-full bg-bar-fill" />
                {timelineMarkers.map((left) => (
                    <span
                        key={left}
                        style={{ left: `${left}%` }}
                        className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-star ring-2 ring-soft"
                    />
                ))}
            </div>
            <div className="mt-3.5 flex items-center gap-3">
                <span className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground tabular-nums">
                    10:40
                </span>
                <span className="text-sm text-muted-foreground">
                    Shortcut For The Shape Builder — Revisit This.
                </span>
            </div>
        </div>
    );
}

function PlatformSection({ className }: { className?: string }) {
    return (
        <section className={cn("w-full", className)}>
            <div className="mx-auto w-full max-w-300 px-6 py-12 md:py-20">
                <p className="text-xs font-semibold tracking-[0.14em] text-subtle-foreground uppercase">
                    The Platform
                </p>
                <h2 className="mt-2.5 max-w-160 text-4xl leading-[1.1] lg:text-[44px]">
                    Built For How People Actually Learn.
                </h2>
                <p className="mt-3 max-w-175 text-lg leading-normal tracking-[-0.01em] text-muted-foreground">
                    Not A Video Dump With A Progress Bar. Every Feature Exists
                    Because It Moves Someone From Watching To Understanding.
                </p>

                <div className="mt-8.5 grid gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
                    <Card className="gap-0 p-6.5 sm:col-span-2 lg:min-h-79.25">
                        <FeatureIcon icon={ClockIcon} brand />
                        <h3 className="mt-5.5 text-base">
                            Notes Pinned To The Exact Second
                        </h3>
                        <p className="mt-3.5 max-w-131.25 text-sm leading-[1.64] text-muted-foreground">
                            Scrub To Any Moment, Write A Note, And It Drops A
                            Marker On The Timeline. Click It Later To Jump
                            Straight Back — No More Scrubbing To Find That One
                            Explanation.
                        </p>
                        <NoteTimeline />
                    </Card>

                    {features.map((feature, index) => (
                        <Card
                            key={feature.title}
                            className={cn(
                                "gap-0 p-6.5",
                                index === 0 && "lg:min-h-79.25",
                            )}
                        >
                            <FeatureIcon icon={feature.icon} />
                            <h3 className="mt-3.5 text-base">
                                {feature.title}
                            </h3>
                            <p className="mt-1.5 text-sm leading-[1.64] text-muted-foreground">
                                {feature.body}
                            </p>
                        </Card>
                    ))}
                </div>

                {/* 2 x 564px cards on a 22px gutter */}
                <div className="mt-16.5 grid gap-5.5 md:grid-cols-2">
                    {audiences.map((audience) => (
                        <Card
                            key={audience.eyebrow}
                            className="gap-0 p-6.5 sm:p-8.5"
                        >
                            <Badge
                                className={cn(
                                    "h-6.5 px-3.5 text-[11px] font-bold tracking-widest uppercase",
                                    audience.tint,
                                )}
                            >
                                {audience.eyebrow}
                            </Badge>
                            <h3 className="mt-4.5 text-[27px] font-extrabold tracking-[-0.02em]">
                                {audience.title}
                            </h3>
                            <p className="mt-2.5 text-[15px] leading-[1.7] text-muted-foreground">
                                {audience.body}
                            </p>
                            <ul className="mt-6 flex flex-col gap-3.75">
                                {audience.points.map((point) => (
                                    <li
                                        key={point}
                                        className="flex items-start gap-3"
                                    >
                                        <span
                                            className={cn(
                                                "mt-px grid size-5 shrink-0 place-items-center rounded-full text-white",
                                                audience.check,
                                            )}
                                        >
                                            <CheckIcon
                                                className="size-3"
                                                strokeWidth={3}
                                            />
                                        </span>
                                        <span className="text-[15px] leading-snug">
                                            {point}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <Button
                                nativeButton={false}
                                className={cn(
                                    "mt-6 h-11 w-fit gap-2 px-5! font-semibold",
                                    audience.cta.variant === "accent" &&
                                        "bg-accent-1 text-white hover:bg-accent-1/85",
                                )}
                                render={<Link href={audience.cta.href} />}
                            >
                                {audience.cta.label}
                                <ArrowRightIcon data-icon="inline-end" />
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

export { PlatformSection };
