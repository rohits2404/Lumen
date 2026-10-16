"use client";

import * as React from "react";
import Link from "next/link";
import {
    BarChart3Icon,
    BookOpenTextIcon,
    CheckIcon,
    ChevronRightIcon,
    FileQuestionIcon,
    LockIcon,
    PauseIcon,
    PlayIcon,
} from "lucide-react";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import {
    courseTotals,
    sectionProgress,
    type PlayerLesson,
    type PlayerSection,
} from "@/lib/config/course-player";
import { cn } from "@/lib/utils";

function LessonMarker({ lesson }: { lesson: PlayerLesson }) {
    if (lesson.state === "done") {
        return (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success text-white">
                <CheckIcon className="size-4.5" strokeWidth={2.5} />
            </span>
        );
    }

    if (lesson.state === "current") {
        return (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <PauseIcon className="size-4 fill-current stroke-none" />
            </span>
        );
    }

    const Icon =
        lesson.type === "quiz"
            ? FileQuestionIcon
            : lesson.type === "article"
              ? BookOpenTextIcon
              : PlayIcon;
    return (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-track text-muted-foreground">
            <Icon
                className={cn(
                    "size-4",
                    lesson.type === "video" && "fill-current stroke-none",
                )}
            />
        </span>
    );
}

function LessonRow({
    lesson,
    courseSlug,
    via,
    selected,
    showPreviewTag,
}: {
    lesson: PlayerLesson;
    courseSlug: string;
    via?: string;
    selected: boolean;
    showPreviewTag: boolean;
}) {
    const className = cn(
        "flex items-center gap-3.5 px-4 py-3",
        (lesson.id ? selected : lesson.state === "current")
            ? "bg-soft"
            : "bg-card",
    );

    const body = (
        <>
            <LessonMarker lesson={lesson} />
            <span className="min-w-0 flex-1">
                <span className="block text-[15px] leading-6">
                    {lesson.title}
                </span>
                <span className="block text-sm leading-5 text-muted-foreground tabular-nums">
                    {lesson.meta}
                </span>
            </span>
            {showPreviewTag && lesson.preview && !lesson.locked ? (
                <span className="shrink-0 text-sm font-medium text-info">
                    Preview
                </span>
            ) : null}
            {lesson.locked ? (
                <LockIcon className="size-4 shrink-0 text-muted-foreground" />
            ) : lesson.id || lesson.quizSlug ? (
                <ChevronRightIcon className="size-4.5 shrink-0 text-muted-foreground" />
            ) : null}
        </>
    );

    if (lesson.id) {
        return (
            <Link
                href={`/dashboard/learning/${courseSlug}?lesson=${lesson.id}${via ? `&via=${via}` : ""}`}
                aria-current={selected ? "true" : undefined}
                scroll={false}
                className={cn(className, !selected && "hover:bg-hover")}
            >
                {body}
            </Link>
        );
    }

    if (!lesson.quizSlug) return <div className={className}>{body}</div>;

    return (
        <Link
            href={`/dashboard/learning/${courseSlug}/quiz/${lesson.quizSlug}${via ? `?via=${via}` : ""}`}
            className={cn(className, "hover:bg-hover")}
        >
            {body}
        </Link>
    );
}

function CourseCompletionCard({
    sections,
    courseSlug,
    via,
    selectedLessonId,
    showPreviewTags = false,
}: {
    sections: PlayerSection[];
    courseSlug: string;
    selectedLessonId?: string;
    showPreviewTags?: boolean;
    via?: string;
}) {
    const totals = courseTotals(sections);
    const holding = (match: (lesson: PlayerLesson) => boolean) =>
        sections.findIndex((section) => section.lessons.some(match));
    const selectedIndex = selectedLessonId
        ? holding((lesson) => lesson.id === selectedLessonId)
        : -1;
    const currentIndex = holding((lesson) => lesson.state === "current");
    const initial =
        selectedIndex !== -1 ? selectedIndex : Math.max(0, currentIndex);

    const [open, setOpen] = React.useState<string[]>([`section-${initial}`]);
    const [seenLesson, setSeenLesson] = React.useState(selectedLessonId);
    if (selectedLessonId !== seenLesson) {
        setSeenLesson(selectedLessonId);
        const key = `section-${selectedIndex}`;
        if (selectedIndex !== -1 && !open.includes(key))
            setOpen([...open, key]);
    }

    return (
        <Card className="gap-0 p-6 ring-border">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-bold">Course Completion</h2>
                <p className="text-sm text-muted-foreground">
                    {totals.sections} Sections · {totals.lessons} Lessons
                </p>
            </div>

            <Accordion
                multiple
                value={open}
                onValueChange={(next) => setOpen(next as string[])}
                className="mt-5 divide-y divide-border-subtle overflow-hidden rounded-xl ring-1 ring-border"
            >
                {sections.map((section, index) => {
                    const { total, done } = sectionProgress(section);

                    return (
                        <AccordionItem
                            key={`section-${index}`}
                            value={`section-${index}`}
                            className="border-none"
                        >
                            <AccordionTrigger className="items-center gap-3.5 rounded-none bg-soft px-4 py-3 text-left hover:no-underline">
                                <span
                                    className={cn(
                                        "flex size-9 shrink-0 items-center justify-center rounded-full",
                                        "bg-card text-muted-foreground ring-1 ring-border group-aria-expanded/accordion-trigger:bg-primary group-aria-expanded/accordion-trigger:text-primary-foreground group-aria-expanded/accordion-trigger:ring-0",
                                    )}
                                >
                                    <BarChart3Icon className="size-4 group-aria-expanded/accordion-trigger:hidden" />
                                    <PlayIcon className="hidden size-4 fill-current stroke-none group-aria-expanded/accordion-trigger:block" />
                                </span>

                                <span className="min-w-0 flex-1">
                                    <span className="block text-[13px] leading-5 font-medium text-subtle-foreground">
                                        Section {index + 1}
                                    </span>
                                    <span className="block text-[15px] leading-6 font-semibold">
                                        {section.title}
                                    </span>
                                </span>

                                <span className="flex shrink-0 items-center gap-3 text-sm font-normal text-muted-foreground">
                                    <span className="tabular-nums">
                                        {total} Lessons · {done} Done
                                    </span>
                                    <span className="hidden h-1.5 w-14 overflow-hidden rounded-full bg-track sm:block">
                                        <span
                                            className="block h-full rounded-full bg-bar-fill"
                                            style={{
                                                width: `${total ? (done / total) * 100 : 0}%`,
                                            }}
                                        />
                                    </span>
                                </span>
                            </AccordionTrigger>

                            <AccordionContent className="divide-y divide-border-subtle border-t border-border-subtle p-0 [&_a]:no-underline">
                                {section.lessons.map((lesson, lessonIndex) => (
                                    <LessonRow
                                        key={
                                            lesson.id ??
                                            `${lessonIndex}-${lesson.title}`
                                        }
                                        lesson={lesson}
                                        courseSlug={courseSlug}
                                        via={via}
                                        selected={
                                            lesson.id !== undefined &&
                                            lesson.id === selectedLessonId
                                        }
                                        showPreviewTag={showPreviewTags}
                                    />
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </Card>
    );
}

export { CourseCompletionCard };
