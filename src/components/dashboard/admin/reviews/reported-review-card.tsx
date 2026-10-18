"use client";

import { BadgeCheckIcon, MailIcon, Trash2Icon, XIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    adminReviewsCopy,
    reportReasonBadge,
} from "@/lib/config/admin-reviews";
import { initialsOf } from "@/lib/user";
import { cn } from "@/lib/utils";

export type ReportedReviewCardRow = {
    id: string;
    reason: Parameters<typeof reportReasonBadge>[0];
    reportedLabel: string;
    reportedTitle: string;
    body: string;
    courseTitle: string;
    authorName: string;
    authorEmail: string;
    authorImage: string | null;
    authorSuspended: boolean;
};

export type CardAction = "remove" | "keep" | "hide" | "suspend";

function ReportedReviewCard({
    row,
    busy,
    disabled,
    onAct,
}: {
    row: ReportedReviewCardRow;
    busy: CardAction | null;
    disabled: boolean;
    onAct: (action: CardAction) => void;
}) {
    const badge = reportReasonBadge(row.reason);

    return (
        <Card className="ring-border [--card-spacing:0px]">
            <div className="px-5 py-4.5">
                <div className="flex items-center gap-3">
                    <Avatar className="size-9 shrink-0">
                        <AvatarImage
                            src={row.authorImage ?? undefined}
                            alt=""
                            referrerPolicy="no-referrer"
                        />
                        <AvatarFallback className="bg-hover text-[11px] font-semibold text-foreground">
                            {initialsOf(row.authorName, row.authorEmail)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span className="text-[15px] font-semibold">
                            {row.authorName}
                        </span>
                        <span className="min-w-0 truncate text-[15px] text-muted-foreground">
                            {adminReviewsCopy.on(row.courseTitle)}
                        </span>
                        <span
                            className={cn(
                                "inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[13px] font-medium",
                                badge.className,
                            )}
                        >
                            {badge.label}
                        </span>
                    </div>

                    <span
                        title={row.reportedTitle}
                        className="shrink-0 text-[15px] text-subtle-foreground"
                    >
                        {row.reportedLabel}
                    </span>
                </div>

                <p className="mt-3 border-l-2 border-border pl-3.5 text-base leading-6 text-muted-foreground">
                    {row.body}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                    <Button
                        loading={busy === "remove"}
                        disabled={disabled}
                        onClick={() => onAct("remove")}
                        className="h-10 gap-2 px-4"
                    >
                        <Trash2Icon className="size-4" />
                        {adminReviewsCopy.remove}
                    </Button>

                    <Button
                        variant="outline"
                        loading={busy === "keep"}
                        disabled={disabled}
                        onClick={() => onAct("keep")}
                        className="h-10 bg-card px-4 shadow-sm"
                    >
                        {adminReviewsCopy.keep}
                    </Button>

                    <Button
                        variant="outline"
                        loading={busy === "hide"}
                        disabled={disabled}
                        onClick={() => onAct("hide")}
                        className="h-10 gap-2 bg-card px-4 shadow-sm"
                    >
                        <XIcon className="size-4" />
                        {adminReviewsCopy.hide}
                    </Button>

                    <Button
                        variant="outline"
                        loading={busy === "suspend"}
                        disabled={disabled || row.authorSuspended}
                        title={
                            row.authorSuspended
                                ? adminReviewsCopy.suspendUnavailable
                                : undefined
                        }
                        onClick={() => onAct("suspend")}
                        className="h-10 gap-2 bg-card px-4 text-destructive shadow-sm hover:text-destructive [&_svg]:text-destructive"
                    >
                        <BadgeCheckIcon className="size-4" />
                        {adminReviewsCopy.suspend}
                    </Button>

                    <Button
                        variant="outline"
                        nativeButton={false}
                        className="ml-auto h-10 gap-2 bg-card px-4 text-muted-foreground shadow-sm"
                        render={<a href={`mailto:${row.authorEmail}`} />}
                    >
                        <MailIcon className="size-4" />
                        {adminReviewsCopy.message}
                    </Button>
                </div>
            </div>
        </Card>
    );
}

export { ReportedReviewCard };
