"use client";

import * as React from "react";
import { PlayIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CourseNote } from "@/lib/config/course-player";

function CourseNotesTab({ notes: initialNotes }: { notes: CourseNote[] }) {
    const [notes, setNotes] = React.useState(initialNotes);
    const [draft, setDraft] = React.useState("");
    const timestamp = "0:00";

    function addNote(event: React.FormEvent) {
        event.preventDefault();
        const body = draft.trim();
        if (!body) return;
        setNotes((current) => [
            ...current,
            { id: `note-${Date.now()}`, timestamp, body },
        ]);
        setDraft("");
    }

    return (
        <Card className="gap-0 p-6.5 ring-border">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold">Lesson Notes</h2>
                <p className="text-[15px] text-muted-foreground">
                    Scrub The Bar, Then Note The Moment
                </p>
            </div>

            <form onSubmit={addNote} className="mt-5 flex items-center gap-4">
                <div className="flex h-14 flex-1 items-center gap-3 rounded-xl bg-soft px-3.5">
                    <span className="shrink-0 rounded-md bg-track px-2.5 py-1 text-[15px] leading-5 font-bold tabular-nums">
                        {timestamp}
                    </span>
                    <input
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder="Add a Note At This Timestamp..."
                        aria-label="Add a note at this timestamp"
                        className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
                    />
                </div>

                <Button
                    type="submit"
                    className="h-14 shrink-0 gap-2 px-6 font-semibold"
                >
                    <PlusIcon data-icon="inline-start" className="size-4.5" />
                    Add Note
                </Button>
            </form>

            {notes.length > 0 ? (
                <ul className="mt-4 flex flex-col gap-3.5">
                    {notes.map((note) => (
                        <li
                            key={note.id}
                            className="flex items-center gap-4 rounded-xl bg-soft px-4 py-4"
                        >
                            <span className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-[15px] leading-6 font-bold text-primary-foreground tabular-nums">
                                <PlayIcon className="size-3.5" />
                                {note.timestamp}
                            </span>
                            <span className="min-w-0 flex-1 text-[15px] leading-6">
                                {note.body}
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    setNotes((current) =>
                                        current.filter(
                                            (entry) => entry.id !== note.id,
                                        ),
                                    )
                                }
                                className="shrink-0 cursor-pointer text-subtle-foreground transition-colors hover:text-destructive"
                            >
                                <Trash2Icon className="size-4.5" />
                                <span className="sr-only">
                                    Delete Note At {note.timestamp}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-4 rounded-xl bg-soft px-5 py-8 text-center text-[15px] text-muted-foreground">
                    No Notes Yet — Pause At Anything Worth Coming Back To And
                    Jot It Down.
                </p>
            )}
        </Card>
    );
}

export { CourseNotesTab };
