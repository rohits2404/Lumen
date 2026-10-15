"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { SearchIcon, StarIcon } from "lucide-react";

import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { CourseFeedbackDialog } from "@/components/dashboard/learning/course/course-feedback-dialog";
import { adminCommandPaletteGroups } from "@/lib/config/admin-nav";
import { instructorCommandPaletteGroups } from "@/lib/config/instructor-nav";
import { commandPaletteGroups } from "@/lib/config/dashboard";

function DashboardSearch({
    variant = "student",
}: {
    variant?: "student" | "admin" | "instructor";
} = {}) {
    const groups =
        variant === "admin"
            ? adminCommandPaletteGroups
            : variant === "instructor"
              ? instructorCommandPaletteGroups
              : commandPaletteGroups;
    const preview = variant === "student";
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = React.useState(false);
    const [feedbackOpen, setFeedbackOpen] = React.useState(false);

    const slug = pathname.match(
        /^\/dashboard\/(?:courses|learning)\/([^/]+)/,
    )?.[1];
    const courseTitle = slug
        ? slug
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
        : "this course";

    React.useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                setOpen((current) => !current);
            }
        }
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, []);

    function go(href: string) {
        setOpen(false);
        router.push(href);
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex h-10 w-full max-w-114.5 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-lg border bg-card pr-3 pl-3.5 text-left transition-colors hover:bg-hover"
            >
                <SearchIcon className="size-4 shrink-0 text-subtle-foreground" />
                <span className="flex-1 truncate text-sm text-muted-foreground">
                    Search...
                </span>
                <Kbd className="hidden shrink-0 sm:flex">⌘ K</Kbd>
            </button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <Command>
                    <CommandInput placeholder="Type a Command or Search..." />
                    <CommandList>
                        <CommandEmpty>Nothing Matches That Yet.</CommandEmpty>
                        {groups.map((group) => (
                            <CommandGroup
                                key={group.title}
                                heading={group.title}
                            >
                                {group.items.map((item) => (
                                    <CommandItem
                                        key={item.href}
                                        value={item.title}
                                        onSelect={() => go(item.href)}
                                        className="cursor-pointer"
                                    >
                                        <item.icon />
                                        {item.title}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        ))}

                        {preview ? (
                            <CommandGroup heading="Preview">
                                <CommandItem
                                    value="Rate this course"
                                    onSelect={() => {
                                        setOpen(false);
                                        setFeedbackOpen(true);
                                    }}
                                    className="cursor-pointer"
                                >
                                    <StarIcon />
                                    Rate This Course
                                </CommandItem>
                            </CommandGroup>
                        ) : null}
                    </CommandList>
                </Command>
            </CommandDialog>

            {preview ? (
                <CourseFeedbackDialog
                    open={feedbackOpen}
                    onOpenChange={setFeedbackOpen}
                    courseTitle={courseTitle}
                    instructorFirstName="The Instructor"
                />
            ) : null}
        </>
    );
}

export { DashboardSearch };
