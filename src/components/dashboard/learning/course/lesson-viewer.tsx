import Link from "next/link";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    FileQuestionIcon,
    FilmIcon,
    LockIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { LessonCompleteButton } from "@/components/dashboard/learning/course/lesson-complete-button";
import { Card } from "@/components/ui/card";
import { ArticleBody } from "@/components/dashboard/courses/article-body";
import type { LessonView } from "@/lib/course-player";
import { cn } from "@/lib/utils";

function LessonViewer({
    lesson,
    art,
    courseSlug,
    published,
    query,
}: {
    lesson: LessonView;
    art: string;
    courseSlug: string;
    published: boolean;
    query: string;
}) {
    const hrefFor = (id: string) =>
        `/dashboard/learning/${courseSlug}?lesson=${id}${query ? `&${query}` : ""}`;

    return (
        <div className="flex flex-col gap-3">
            {lesson.kind === "video" ? (
                lesson.video ? (
                    <div className="overflow-hidden rounded-2xl bg-black">
                        <video
                            key={lesson.id}
                            src={lesson.video.url}
                            controls
                            preload="metadata"
                            playsInline
                            className="aspect-video w-full"
                        >
                            Your Browser Can&apos;t Play This Video.
                        </video>
                    </div>
                ) : (
                    <Placeholder
                        art={art}
                        icon={<FilmIcon className="size-7" />}
                        title="Video Coming Soon"
                        body="The Instructor Hasn't Uploaded This Lesson's Video Yet."
                    />
                )
            ) : null}

            {lesson.kind === "article" ? (
                <Card className="gap-0 px-6 py-7 ring-border sm:px-9 sm:py-8">
                    <p className="text-[13px] font-medium text-muted-foreground">
                        Article
                        {lesson.minutes ? ` · ${lesson.minutes} Min Read` : ""}
                    </p>
                    <h2 className="mt-1.5 text-2xl leading-tight font-bold">
                        {lesson.title}
                    </h2>
                    {lesson.body && lesson.body.content.length > 0 ? (
                        <ArticleBody
                            doc={lesson.body}
                            className="mt-6 max-w-174"
                        />
                    ) : (
                        <p className="mt-6 text-[15px] text-muted-foreground">
                            The Instructor Hasn&apos;t Written This Article Yet.
                        </p>
                    )}
                </Card>
            ) : null}

            {lesson.kind === "quiz" ? (
                <Card className="flex-row flex-wrap items-center gap-5 px-6 py-7 ring-border sm:px-8">
                    <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-accent-1/10 text-accent-1">
                        <FileQuestionIcon className="size-7" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-muted-foreground">
                            Quiz · {lesson.questions}{" "}
                            {lesson.questions === 1 ? "Question" : "Questions"}
                        </p>
                        <h2 className="mt-1 text-xl leading-tight font-bold">
                            {lesson.title}
                        </h2>
                    </div>
                    {lesson.quizSlug && lesson.questions > 0 ? (
                        <Button
                            nativeButton={false}
                            render={
                                <Link
                                    href={`/dashboard/learning/${courseSlug}/quiz/${lesson.quizSlug}${query ? `?${query}` : ""}`}
                                />
                            }
                            className="h-10 px-5"
                        >
                            Start Quiz
                        </Button>
                    ) : (
                        <p className="text-[14px] text-muted-foreground">
                            No Questions Written Yet.
                        </p>
                    )}
                </Card>
            ) : null}

            {lesson.kind === "locked" ? (
                <Placeholder
                    art={art}
                    icon={<LockIcon className="size-7" />}
                    title="Enrol to unlock this lesson"
                    body="This lesson is part of the full course. Lessons marked Preview are free to watch."
                    action={
                        published ? (
                            <Button
                                nativeButton={false}
                                render={
                                    <Link
                                        href={`/dashboard/courses/${courseSlug}`}
                                    />
                                }
                                className="mt-4 h-10 bg-white px-5 text-neutral-900 hover:bg-white/90"
                            >
                                View Course
                            </Button>
                        ) : null
                    }
                />
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[13px] text-muted-foreground">
                        {lesson.sectionTitle} · Lesson {lesson.number} of{" "}
                        {lesson.total}
                    </p>
                    {lesson.kind !== "article" && lesson.kind !== "quiz" ? (
                        <p className="truncate text-[17px] font-semibold">
                            {lesson.title}
                        </p>
                    ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    {lesson.kind !== "locked" ? (
                        <LessonCompleteButton
                            lessonId={lesson.id}
                            completed={lesson.completed}
                        />
                    ) : null}
                    <StepLink
                        href={
                            lesson.previousId
                                ? hrefFor(lesson.previousId)
                                : null
                        }
                        label="Previous"
                        icon={<ChevronLeftIcon className="size-4" />}
                    />
                    <StepLink
                        href={lesson.nextId ? hrefFor(lesson.nextId) : null}
                        label="Next lesson"
                        icon={<ChevronRightIcon className="size-4" />}
                        trailing
                    />
                </div>
            </div>
        </div>
    );
}

function Placeholder({
    art,
    icon,
    title,
    body,
    action,
}: {
    art: string;
    icon: React.ReactNode;
    title: string;
    body: string;
    action?: React.ReactNode;
}) {
    return (
        <div
            className={cn(
                "relative grid aspect-video place-items-center overflow-hidden rounded-2xl bg-linear-to-br px-6 text-center",
                art,
            )}
        >
            <div className="absolute inset-0 bg-black/45" />
            <div className="relative flex max-w-sm flex-col items-center text-white">
                <span className="grid size-14 place-items-center rounded-full bg-white/15 backdrop-blur-sm">
                    {icon}
                </span>
                <p className="mt-4 text-lg font-bold">{title}</p>
                <p className="mt-1 text-[15px] text-white/80">{body}</p>
                {action}
            </div>
        </div>
    );
}

function StepLink({
    href,
    label,
    icon,
    trailing,
}: {
    href: string | null;
    label: string;
    icon: React.ReactNode;
    trailing?: boolean;
}) {
    const content = trailing ? (
        <>
            {label}
            {icon}
        </>
    ) : (
        <>
            {icon}
            {label}
        </>
    );
    const className = "h-10 gap-1.5 bg-card px-4 shadow-sm";

    return href ? (
        <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={href} scroll={false} />}
            className={className}
        >
            {content}
        </Button>
    ) : (
        <Button variant="outline" disabled className={className}>
            {content}
        </Button>
    );
}

export { LessonViewer };
