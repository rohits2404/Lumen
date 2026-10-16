"use client";

import * as React from "react";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import type { CoursePlayerCourse } from "@/lib/config/course-player";

function CourseOverviewTab({ about }: { about: CoursePlayerCourse["about"] }) {
    const [expanded, setExpanded] = React.useState(false);
    const [lead, ...rest] = about.description;
    const ToggleIcon = expanded ? ChevronUpIcon : ChevronDownIcon;

    return (
        <div className="pt-2">
            <h2 className="text-xl font-bold">About This Course</h2>
            <p className="mt-3 text-[17px] leading-8 text-muted-foreground">
                {lead}
            </p>

            {expanded
                ? rest.map((paragraph) => (
                      <p
                          key={paragraph}
                          className="mt-4 text-[17px] leading-8 text-muted-foreground"
                      >
                          {paragraph}
                      </p>
                  ))
                : null}

            {rest.length > 0 ? (
                <button
                    type="button"
                    onClick={() => setExpanded((open) => !open)}
                    className="mt-3 flex cursor-pointer items-center gap-2 text-[15px] font-bold text-foreground hover:text-muted-foreground"
                >
                    {expanded ? "Show Less" : "Show More"}
                    <ToggleIcon className="size-4" />
                </button>
            ) : null}

            <h2 className="mt-8 text-xl font-bold">This Course Suit For:</h2>
            <ul className="mt-4 flex flex-col gap-4">
                {about.suitFor.map((line) => (
                    <li key={line} className="flex items-start gap-4">
                        <CheckIcon className="mt-1 size-4 shrink-0 text-success" />
                        <span className="text-[15px] leading-6">{line}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export { CourseOverviewTab };
