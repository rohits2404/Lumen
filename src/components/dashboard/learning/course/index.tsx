import { CoursePlayerCourse } from "@/lib/config/course-player";
import { LessonView } from "@/lib/course-player";
import { learningReturnLink } from "@/lib/course-return";
import { ArrowLeftIcon, EyeIcon } from "lucide-react";
import Link from "next/link";
import { LessonViewer } from "./lesson-viewer";
import { CourseVideoPlayer } from "./course-video-player";
import { CourseInstructorBar } from "./course-instructor-bar";
import { CourseTabs } from "./course-tabs";
import { StudyProgressCard } from "./study-progress-card";
import { CourseCompletionCard } from "./course-completion-card";

function Courses({
    course,
    backLink,
    via,
    lesson,
}: {
    course: CoursePlayerCourse;
    backLink: ReturnType<typeof learningReturnLink>;
    via?: string;
    lesson: LessonView | null;
}) {
    const currentLesson =
        course.sections
            .flatMap((section) => section.lessons)
            .find((lesson) => lesson.state === "current")?.title ??
        course.title;

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                    href={backLink.href}
                    className="flex w-fit items-center gap-2.5 text-[15px] text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeftIcon className="size-4.5" />
                    {backLink.label}
                </Link>
                {backLink.preview ? (
                    <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-role-instructor/10 px-3 text-[13px] font-medium text-role-instructor">
                        <EyeIcon className="size-3.5" />
                        Student Preview
                    </span>
                ) : null}
            </div>

            <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start xl:grid-cols-[minmax(0,1fr)_576px]">
                <div className="flex min-w-0 flex-col gap-4.5">
                    <h1 className="text-[32px] leading-tight font-bold">
                        {course.title}
                    </h1>
                    {lesson ? (
                        <LessonViewer
                            lesson={lesson}
                            art={course.art}
                            courseSlug={course.slug}
                            published={course.published ?? false}
                            query={via ? `via=${via}` : ""}
                        />
                    ) : (
                        <CourseVideoPlayer
                            art={course.art}
                            lessonTitle={currentLesson}
                        />
                    )}
                    <CourseInstructorBar
                        instructor={course.instructor}
                        courseSlug={course.slug}
                        via={via}
                    />
                    <CourseTabs course={course} />
                </div>

                <div className="flex flex-col gap-6">
                    <StudyProgressCard
                        progress={course.progress}
                        encouragement={course.encouragement}
                    />
                    <CourseCompletionCard
                        sections={course.sections}
                        courseSlug={course.slug}
                        via={via}
                        selectedLessonId={lesson?.id}
                        showPreviewTags={course.access === "preview"}
                    />
                </div>
            </div>
        </div>
    );
}

export { Courses };
