import Link from "next/link";
import {
    ArrowLeftIcon,
    CheckIcon,
    FileQuestionIcon,
    PlayIcon,
    XIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { CourseArt } from "@/components/dashboard/course-art";
import { CourseReviewActions } from "@/components/dashboard/admin/courses/course-review-actions";
import {
    formatSubmittedAt,
    formatSubmittedExact,
} from "@/components/dashboard/admin/courses/courses-format";
import {
    awaitsDecision,
    changeReasonLabels,
    courseViewCopy,
} from "@/lib/config/admin-courses";
import { courseStatusBadge } from "@/lib/config/course-status";
import type { CourseReview } from "@/lib/admin/courses";
import type { ChangeReason } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

function CourseReviewPage({ course }: { course: CourseReview }) {
    const badge = courseStatusBadge(course.status);
    const submitted = formatSubmittedAt(course.submittedAt, course.generatedAt);

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <Link
                href="/dashboard/admin/courses"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeftIcon className="size-4" />
                {courseViewCopy.back}
            </Link>

            <Card className="mt-4 w-full max-w-220 gap-0 overflow-hidden ring-border [--card-spacing:0px]">
                <CourseArt
                    thumbnailUrl={course.thumbnailUrl}
                    categorySlug={course.categorySlug}
                    categoryAccent={course.categoryAccent}
                    className="aspect-4/1 w-full"
                    iconClassName="size-14"
                />

                <div className="p-6.5">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold">{course.title}</h1>
                        <span
                            className={cn(
                                "inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[13px] font-medium",
                                badge.className,
                            )}
                        >
                            {badge.label}
                        </span>
                    </div>

                    <p className="mt-2 flex flex-wrap items-center gap-x-4 text-[15px] text-muted-foreground">
                        <span>By {course.instructorName}</span>
                        <span>
                            {course.lessonCount}{" "}
                            {course.lessonCount === 1 ? "Lesson" : "Lessons"}
                        </span>
                        {submitted ? (
                            <span
                                className="text-subtle-foreground"
                                title={
                                    course.submittedAt
                                        ? formatSubmittedExact(
                                              course.submittedAt,
                                          )
                                        : undefined
                                }
                            >
                                {submitted}
                            </span>
                        ) : null}
                    </p>

                    <LastDecision course={course} />

                    <h2 className="mt-7 text-base font-bold">
                        {courseViewCopy.checklistHeading}
                    </h2>
                    {course.checks.length === 0 ? (
                        <p className="mt-3.5 text-[15px] text-muted-foreground">
                            {courseViewCopy.checklistEmpty}
                        </p>
                    ) : (
                        <ul className="mt-3.5 flex flex-col gap-2.5">
                            {course.checks.map((check) => (
                                <li
                                    key={check.key}
                                    className="flex h-12 items-center gap-3.5 rounded-lg bg-background px-3.5"
                                >
                                    <span
                                        aria-hidden
                                        className={cn(
                                            "grid size-5.5 shrink-0 place-items-center rounded-full text-white",
                                            check.passed
                                                ? "bg-success"
                                                : "bg-destructive",
                                        )}
                                    >
                                        {check.passed ? (
                                            <CheckIcon className="size-3.5 stroke-3" />
                                        ) : (
                                            <XIcon className="size-3.5 stroke-3" />
                                        )}
                                    </span>
                                    <span className="text-[15px]">
                                        {check.label}
                                    </span>
                                    <span className="sr-only">
                                        {check.passed ? "Passed" : "Failed"}
                                        {check.automated
                                            ? ""
                                            : " — Checked By a Reviewer"}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <h2 className="mt-7 text-base font-bold">
                        {courseViewCopy.curriculumHeading}
                    </h2>
                    {course.curriculum.length === 0 ? (
                        <p className="mt-3.5 text-[15px] text-muted-foreground">
                            {courseViewCopy.curriculumEmpty}
                        </p>
                    ) : (
                        <ul className="mt-3.5 flex flex-col gap-2">
                            {course.curriculum.map((lesson) => {
                                const Icon =
                                    lesson.type === "QUIZ"
                                        ? FileQuestionIcon
                                        : PlayIcon;
                                return (
                                    <li
                                        key={lesson.id}
                                        className="flex h-14 items-center gap-3.5 rounded-lg border border-border px-3.5"
                                    >
                                        <Icon
                                            aria-hidden
                                            className="size-4 shrink-0 text-subtle-foreground"
                                        />
                                        <span className="min-w-0 flex-1 truncate text-[15px]">
                                            {lesson.title}
                                        </span>
                                        <span className="shrink-0 text-[13px] text-subtle-foreground tabular-nums">
                                            {lesson.questionsCount !== null
                                                ? `${lesson.questionsCount} Questions`
                                                : lesson.durationMinutes !==
                                                    null
                                                  ? `${lesson.durationMinutes} Min`
                                                  : ""}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {awaitsDecision(course.status) ? (
                        <CourseReviewActions
                            courseId={course.id}
                            courseTitle={course.title}
                            instructorName={course.instructorName}
                        />
                    ) : null}
                </div>
            </Card>
        </main>
    );
}

function LastDecision({ course }: { course: CourseReview }) {
    const decision = course.lastDecision;
    if (!decision || decision.decision === "APPROVED") return null;
    if (!decision.noteToInstructor && decision.changeReasons.length === 0) {
        return null;
    }

    return (
        <div className="mt-5 rounded-xl border border-border bg-background p-4">
            <p className="text-[13px] font-semibold text-subtle-foreground uppercase">
                {courseViewCopy.decisionHeading} ·{" "}
                {courseViewCopy.decisionLabels[decision.decision] ??
                    decision.decision}
            </p>

            {decision.changeReasons.length > 0 ? (
                <ul className="mt-2.5 flex flex-wrap gap-2">
                    {decision.changeReasons.map((reason) => (
                        <li
                            key={reason}
                            className="rounded-full bg-warning/10 px-2.5 py-0.5 text-[13px] font-medium text-warning"
                        >
                            {changeReasonLabels[reason as ChangeReason] ??
                                reason}
                        </li>
                    ))}
                </ul>
            ) : null}

            {decision.noteToInstructor ? (
                <p className="mt-2.5 text-[15px] leading-6">
                    {decision.noteToInstructor}
                </p>
            ) : null}
        </div>
    );
}

export { CourseReviewPage };
