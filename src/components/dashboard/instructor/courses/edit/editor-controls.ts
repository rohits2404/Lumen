import { cn } from "@/lib/utils";

export const EDITOR_CARD = "gap-0 p-7 ring-border";

export const EDITOR_HEADING = "text-xl leading-none font-bold";

export const EDITOR_FIELD =
    "w-full rounded-lg bg-background px-3.5 text-[15px] outline-none ring-1 ring-transparent transition-shadow placeholder:text-subtle-foreground focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-background md:text-[15px]";

export const EDITOR_SELECT = cn(
    EDITOR_FIELD,
    "justify-between gap-2 border-transparent py-0 pr-3.5 data-[size=default]:h-11 dark:hover:bg-background",
);

export const EDITOR_SUBMIT = "h-10 px-5";

export const EDITOR_SWITCH = cn(
    "border-0 p-[3px] data-[size=default]:h-6.5 data-[size=default]:w-11.5",
    "data-unchecked:bg-track dark:data-unchecked:bg-track",
    "[&_[data-slot=switch-thumb]]:size-5",
    "[&_[data-slot=switch-thumb]]:data-checked:translate-x-full",
);

export const EDITOR_LABEL = "block text-[16px] leading-5 font-bold";

export const EDITOR_LEAD =
    "mt-2.5 max-w-[620px] text-[15px] leading-[23px] text-muted-foreground [text-wrap:wrap]";
