"use client";

import * as React from "react";
import { HeartIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { helpArticleCopy } from "@/lib/config/help-article";

function HelpArticleFeedback() {
    const [answered, setAnswered] = React.useState(false);
    const { feedback } = helpArticleCopy;

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5.5">
            <div>
                <p className="text-[15px] leading-none font-bold">
                    {feedback.title}
                </p>
                <p className="mt-2.5 text-[13px] leading-none text-muted-foreground">
                    {feedback.description}
                </p>
            </div>
            {answered ? (
                <p aria-live="polite" className="text-sm font-medium">
                    {feedback.thanks}
                </p>
            ) : (
                <div className="flex items-center gap-2.5">
                    <Button
                        variant="outline"
                        onClick={() => setAnswered(true)}
                        className="h-10 gap-2 px-4.5 text-sm font-medium"
                    >
                        <HeartIcon className="size-4.5" />
                        {feedback.yes}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setAnswered(true)}
                        className="h-10 gap-2 px-4.5 text-sm font-medium"
                    >
                        <XIcon className="size-4.5" />
                        {feedback.no}
                    </Button>
                </div>
            )}
        </div>
    );
}

export { HelpArticleFeedback };
