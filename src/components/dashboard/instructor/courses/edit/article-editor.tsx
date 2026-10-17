"use client";

import * as React from "react";
import Link from "next/link";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import {
    ArrowLeftIcon,
    BoldIcon,
    Heading2Icon,
    Heading3Icon,
    ItalicIcon,
    ListIcon,
    ListOrderedIcon,
    PilcrowIcon,
    Redo2Icon,
    Undo2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { articleEditorCopy, editorStepHref } from "@/lib/config/course-editor";
import type { ArticleEditorLesson } from "@/lib/instructor-course-edit";
import { saveArticle } from "@/lib/actions/instructor-course-edit";
import { cn } from "@/lib/utils";

function ArticleEditor({ lesson }: { lesson: ArticleEditorLesson }) {
    const [dirty, setDirty] = React.useState(false);
    const [saving, startSaving] = React.useTransition();

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                blockquote: false,
                code: false,
                codeBlock: false,
                horizontalRule: false,
                link: false,
                strike: false,
                underline: false,
            }),
            Placeholder.configure({
                placeholder: articleEditorCopy.placeholder,
            }),
        ],
        content: lesson.body ?? "",
        onUpdate: () => setDirty(true),
        editorProps: {
            attributes: {
                "aria-label": lesson.title,
                class: cn(
                    "min-h-[480px] px-7 py-6 text-[16px] leading-[27px] outline-none",
                    "[&>*+*]:mt-4",
                    "[&_h2]:mt-7 [&_h2]:text-[22px] [&_h2]:leading-8 [&_h2]:font-bold",
                    "[&_h3]:mt-6 [&_h3]:text-[18px] [&_h3]:leading-7 [&_h3]:font-bold",
                    "[&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6",
                    "[&_li]:mt-1.5 [&_li::marker]:text-muted-foreground [&_li>p]:mt-0",
                    "[&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:text-subtle-foreground [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
                ),
            },
        },
    });

    const save = React.useCallback(() => {
        if (!editor || saving) return;
        const doc = JSON.stringify(editor.getJSON());
        startSaving(async () => {
            const result = await saveArticle(
                lesson.courseId,
                lesson.lessonId,
                doc,
            );
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
            if (result.ok) setDirty(false);
        });
    }, [editor, saving, lesson.courseId, lesson.lessonId]);

    React.useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (
                (event.metaKey || event.ctrlKey) &&
                typeof event.key === "string" &&
                event.key.toLowerCase() === "s"
            ) {
                event.preventDefault();
                save();
            }
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [save]);

    React.useEffect(() => {
        if (!dirty) return;
        function onBeforeUnload(event: BeforeUnloadEvent) {
            event.preventDefault();
        }
        window.addEventListener("beforeunload", onBeforeUnload);
        return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, [dirty]);

    return (
        <div className="mx-auto w-full max-w-190">
            <Link
                href={editorStepHref(lesson.courseSlug, "curriculum")}
                className="flex w-fit items-center gap-2.5 text-[15px] text-muted-foreground hover:text-foreground"
            >
                <ArrowLeftIcon className="size-4.5" />
                {articleEditorCopy.back}
            </Link>

            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0">
                    <p className="truncate text-[13px] text-muted-foreground">
                        {lesson.courseTitle} · {lesson.sectionTitle}
                    </p>
                    <h1 className="mt-1 text-[26px] leading-tight font-bold">
                        {lesson.title}
                    </h1>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    <span
                        className="text-[13px] text-muted-foreground"
                        aria-live="polite"
                    >
                        {dirty
                            ? articleEditorCopy.unsaved
                            : articleEditorCopy.allSaved}
                    </span>
                    <Button
                        type="button"
                        loading={saving}
                        disabled={!editor || !dirty}
                        onClick={save}
                        className="h-10 px-4"
                    >
                        {articleEditorCopy.save}
                    </Button>
                </div>
            </div>
            <p className="mt-2 text-[15px] text-muted-foreground">
                {articleEditorCopy.lead}
            </p>

            <Card className="mt-5 overflow-visible ring-border [--card-spacing:0px]">
                <div className="sticky top-17.5 z-10 flex flex-wrap items-center gap-1 rounded-t-xl border-b border-border bg-card px-3 py-2">
                    <Toolbar editor={editor} />
                </div>
                {editor ? (
                    <EditorContent editor={editor} />
                ) : (
                    <div className="min-h-120" aria-hidden />
                )}
            </Card>
        </div>
    );
}

function Toolbar({ editor }: { editor: Editor | null }) {
    const state = useEditorState({
        editor,
        selector: ({ editor: current }) =>
            current
                ? {
                      paragraph:
                          current.isActive("paragraph") &&
                          !current.isActive("bulletList") &&
                          !current.isActive("orderedList"),
                      h2: current.isActive("heading", { level: 2 }),
                      h3: current.isActive("heading", { level: 3 }),
                      bulletList: current.isActive("bulletList"),
                      orderedList: current.isActive("orderedList"),
                      bold: current.isActive("bold"),
                      italic: current.isActive("italic"),
                      canUndo: current.can().undo(),
                      canRedo: current.can().redo(),
                  }
                : null,
    });

    const labels = articleEditorCopy.toolbar;
    const chain = () => editor?.chain().focus();

    return (
        <>
            <ToolButton
                label={labels.paragraph}
                active={state?.paragraph}
                disabled={!editor}
                onClick={() => chain()?.setParagraph().run()}
            >
                <PilcrowIcon />
            </ToolButton>
            <ToolButton
                label={labels.heading2}
                active={state?.h2}
                disabled={!editor}
                onClick={() => chain()?.toggleHeading({ level: 2 }).run()}
            >
                <Heading2Icon />
            </ToolButton>
            <ToolButton
                label={labels.heading3}
                active={state?.h3}
                disabled={!editor}
                onClick={() => chain()?.toggleHeading({ level: 3 }).run()}
            >
                <Heading3Icon />
            </ToolButton>

            <Divider />

            <ToolButton
                label={labels.bulletList}
                active={state?.bulletList}
                disabled={!editor}
                onClick={() => chain()?.toggleBulletList().run()}
            >
                <ListIcon />
            </ToolButton>
            <ToolButton
                label={labels.orderedList}
                active={state?.orderedList}
                disabled={!editor}
                onClick={() => chain()?.toggleOrderedList().run()}
            >
                <ListOrderedIcon />
            </ToolButton>

            <Divider />

            <ToolButton
                label={labels.bold}
                active={state?.bold}
                disabled={!editor}
                onClick={() => chain()?.toggleBold().run()}
            >
                <BoldIcon />
            </ToolButton>
            <ToolButton
                label={labels.italic}
                active={state?.italic}
                disabled={!editor}
                onClick={() => chain()?.toggleItalic().run()}
            >
                <ItalicIcon />
            </ToolButton>

            <span className="ml-auto flex items-center gap-1">
                <ToolButton
                    label={labels.undo}
                    disabled={!state?.canUndo}
                    onClick={() => chain()?.undo().run()}
                >
                    <Undo2Icon />
                </ToolButton>
                <ToolButton
                    label={labels.redo}
                    disabled={!state?.canRedo}
                    onClick={() => chain()?.redo().run()}
                >
                    <Redo2Icon />
                </ToolButton>
            </span>
        </>
    );
}

function ToolButton({
    label,
    active,
    disabled,
    onClick,
    children,
}: {
    label: string;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            aria-pressed={active ?? undefined}
            title={label}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClick}
            className={cn(
                "grid size-9 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors outline-none [&_svg]:size-4.5",
                "hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
                "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
                active && "bg-hover text-foreground",
            )}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <span aria-hidden className="mx-1 h-5 w-px bg-border" />;
}

export { ArticleEditor };
