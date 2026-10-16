"use client";

import * as React from "react";
import {
    EllipsisVerticalIcon,
    MaximizeIcon,
    PauseIcon,
    PlayIcon,
    Volume2Icon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const CHAPTER_MARKS = [2.5, 13, 31];

function CourseVideoPlayer({
    art,
    lessonTitle,
}: {
    art: string;
    lessonTitle: string;
}) {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const TransportIcon = isPlaying ? PauseIcon : PlayIcon;

    return (
        <div
            className={cn(
                "relative aspect-video overflow-hidden rounded-2xl bg-linear-to-br",
                art,
            )}
        >
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-4 bg-linear-to-t from-black/60 to-transparent px-5 pt-16 pb-4">
                <button
                    type="button"
                    onClick={() => setIsPlaying((playing) => !playing)}
                    className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                >
                    <TransportIcon className="size-5 fill-current stroke-none" />
                    <span className="sr-only">
                        {isPlaying ? "Pause" : "Play"} {lessonTitle}
                    </span>
                </button>

                <span className="shrink-0 text-[15px] leading-5 font-medium text-white tabular-nums">
                    0:00
                </span>

                <div className="relative h-1.5 flex-1 rounded-full bg-white/45">
                    {CHAPTER_MARKS.map((mark) => (
                        <span
                            key={mark}
                            className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-star"
                            style={{ left: `${mark}%` }}
                        />
                    ))}
                </div>

                <div className="flex shrink-0 items-center gap-4 text-white">
                    <button type="button" className="cursor-pointer">
                        <Volume2Icon className="size-5" />
                        <span className="sr-only">Mute</span>
                    </button>
                    <button type="button" className="cursor-pointer">
                        <MaximizeIcon className="size-5" />
                        <span className="sr-only">Full Screen</span>
                    </button>
                    <button type="button" className="cursor-pointer">
                        <EllipsisVerticalIcon className="size-5" />
                        <span className="sr-only">More Options</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export { CourseVideoPlayer };
