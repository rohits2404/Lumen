"use client";

import Link from "next/link";
import {
    BookOpenTextIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    CircleCheckIcon,
    FileQuestionIcon,
    GripVerticalIcon,
    PencilLineIcon,
    PlayIcon,
    Trash2Icon,
    UploadIcon,
} from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { EditableText } from "@/components/dashboard/instructor/courses/edit/editable-text";
import { RowButton } from "@/components/dashboard/instructor/courses/edit/row-button";
import {
    curriculumCopy,
    editorArticleHref,
    editorQuizHref,
    lessonKindTone,
    type LessonKind,
} from "@/lib/config/course-editor";
import type { EditorLesson } from "@/lib/instructor-course-edit";
import { cn } from "@/lib/utils";

const KIND_ICON = {
    VIDEO: PlayIcon,
    ARTICLE: BookOpenTextIcon,
    QUIZ: FileQuestionIcon,
} as const;

function LessonRow({
    lesson,
    index,
    sectionIndex,
    first,
    last,
    courseSlug,
    onRename,
    onMeta,
    onPreview,
    onVideo,
    onMove,
    onDelete,
    onDragStart,
    onDragOver,
    onDrop,
    dragging,
    settling,
}: {
    lesson: EditorLesson;
    index: number;
    sectionIndex: number;
    first: boolean;
    last: boolean;
    courseSlug: string;
    onRename: (title: string) => Promise<boolean>;
    onMeta: (value: number | null) => Promise<boolean>;
    onPreview: (next: boolean) => void;
    onVideo: () => void;
    onMove: (to: number) => void;
    onDelete: () => void;
    onDragStart: () => void;
    onDragOver: () => void;
    onDrop: () => void;
    dragging: boolean;
    settling: boolean;
}) {
    const tone = lessonKindTone[lesson.kind];
    const Icon = KIND_ICON[lesson.kind];
    const isQuiz = lesson.kind === "QUIZ";
    const metaValue = isQuiz ? lesson.questionsCount : lesson.durationMinutes;

    return (
        <li
            onDragStart={(event) => {
                event.stopPropagation();
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", lesson.id);
                onDragStart();
            }}
            onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                onDragOver();
            }}
            onDrop={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onDrop();
            }}
            onDragEnd={(event) => {
                event.currentTarget.draggable = false;
                onDrop();
            }}
            className={cn(
                "flex h-14 items-center gap-3 rounded-lg bg-background px-3 transition-opacity",
                dragging && "opacity-40",
            )}
        >
            <DragHandle disabled={settling} />

            <span className="w-8 shrink-0 text-[13px] text-subtle-foreground tabular-nums">
                {sectionIndex + 1}.{index + 1}
            </span>

            <span
                className={cn(
                    "grid size-8.5 shrink-0 place-items-center rounded-lg",
                    tone.tile,
                )}
            >
                <Icon className="size-4.5" />
            </span>

            <span className="min-w-0 flex-1">
                <EditableText
                    value={lesson.title}
                    onCommit={onRename}
                    disabled={settling}
                    ariaLabel="Lesson title"
                    placeholder={curriculumCopy.lessonTitlePlaceholder}
                    className="text-[15px]"
                />
            </span>

            <span
                className={cn(
                    "hidden h-5.5 shrink-0 items-center rounded-full px-2.5 text-[12px] font-medium sm:inline-flex",
                    tone.pill,
                )}
            >
                {tone.label}
            </span>

            <span className="hidden w-26 shrink-0 md:block">
                {isQuiz ? (
                    <span className="block px-1.5 py-1 text-right text-[13px] text-muted-foreground tabular-nums">
                        {curriculumCopy.meta.QUIZ(metaValue)}
                    </span>
                ) : (
                    <EditableText
                        value={metaValue === null ? "" : String(metaValue)}
                        onCommit={(next) => {
                            const trimmed = next.trim();
                            if (trimmed === "") return onMeta(null);
                            const parsed = Number.parseInt(trimmed, 10);
                            return Number.isNaN(parsed)
                                ? false
                                : onMeta(parsed);
                        }}
                        disabled={settling}
                        inputMode="numeric"
                        ariaLabel={isQuiz ? "Questions" : "Length in minutes"}
                        placeholder={curriculumCopy.meta[lesson.kind](null)}
                        className="text-right text-[13px] text-muted-foreground tabular-nums"
                    />
                )}
            </span>

            {lesson.kind === "VIDEO" ? (
                <ContentButton
                    label={
                        lesson.video
                            ? curriculumCopy.editVideo
                            : curriculumCopy.uploadVideo
                    }
                    icon={
                        lesson.video ? (
                            <CircleCheckIcon className="size-3.5 text-success" />
                        ) : (
                            <UploadIcon className="size-3.5" />
                        )
                    }
                    settling={settling}
                    onClick={onVideo}
                />
            ) : (
                <ContentButton
                    label={
                        isQuiz
                            ? curriculumCopy.editQuiz
                            : curriculumCopy.editArticle
                    }
                    icon={
                        isQuiz ? (
                            <FileQuestionIcon className="size-3.5" />
                        ) : lesson.hasArticle ? (
                            <CircleCheckIcon className="size-3.5 text-success" />
                        ) : (
                            <PencilLineIcon className="size-3.5" />
                        )
                    }
                    settling={settling}
                    href={
                        isQuiz
                            ? editorQuizHref(courseSlug, lesson.id)
                            : editorArticleHref(courseSlug, lesson.id)
                    }
                />
            )}

            {isQuiz ? null : (
                <span className="hidden shrink-0 items-center gap-2 lg:inline-flex">
                    <span className="text-[13px] text-muted-foreground">
                        {curriculumCopy.preview}
                    </span>
                    <Switch
                        checked={lesson.isPreview}
                        disabled={settling}
                        onCheckedChange={onPreview}
                        aria-label={`${curriculumCopy.preview} — ${lesson.title}`}
                    />
                </span>
            )}

            <span className="flex shrink-0 items-center gap-1">
                <RowButton
                    label={curriculumCopy.moveUp}
                    disabled={first}
                    onClick={() => onMove(index - 1)}
                >
                    <ChevronUpIcon className="size-4" />
                </RowButton>
                <RowButton
                    label={curriculumCopy.moveDown}
                    disabled={last}
                    onClick={() => onMove(index + 1)}
                >
                    <ChevronDownIcon className="size-4" />
                </RowButton>
                <RowButton
                    label={curriculumCopy.removeLesson}
                    disabled={settling}
                    onClick={onDelete}
                    destructive
                >
                    <Trash2Icon className="size-4" />
                </RowButton>
            </span>
        </li>
    );
}

function ContentButton({
    label,
    icon,
    settling,
    href,
    onClick,
}: {
    label: string;
    icon: React.ReactNode;
    settling: boolean;
    href?: string;
    onClick?: () => void;
}) {
    const className = cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-card px-2 text-[13px] font-medium whitespace-nowrap ring-1 ring-border transition-colors outline-none min-[1400px]:px-2.5",
        "hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring/50",
        settling && "cursor-not-allowed opacity-60 hover:bg-card",
    );
    const content = (
        <>
            {icon}
            <span className="sr-only min-[1400px]:not-sr-only">{label}</span>
        </>
    );

    if (settling) {
        return (
            <button
                type="button"
                disabled
                title={curriculumCopy.settling}
                className={className}
            >
                {content}
            </button>
        );
    }

    return href ? (
        <Link href={href} title={label} className={className}>
            {content}
        </Link>
    ) : (
        <button
            type="button"
            onClick={onClick}
            title={label}
            className={cn(className, "cursor-pointer")}
        >
            {content}
        </button>
    );
}

function DragHandle({ disabled }: { disabled: boolean }) {
    return (
        <span
            aria-hidden
            onPointerDown={(event) => {
                if (disabled) return;
                const row = event.currentTarget.closest("li, [data-section]");
                if (row instanceof HTMLElement) row.draggable = true;
            }}
            className={cn(
                "shrink-0 text-subtle-foreground",
                disabled
                    ? "cursor-not-allowed"
                    : "cursor-grab active:cursor-grabbing",
            )}
        >
            <GripVerticalIcon className="size-4" />
        </span>
    );
}

export { LessonRow, DragHandle };
export type { LessonKind };
