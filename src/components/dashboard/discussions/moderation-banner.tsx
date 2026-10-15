import { InfoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { moderationBanner } from "@/lib/config/discussions";

function ModerationBanner({
    count,
    onReview,
}: {
    count: number;
    onReview: () => void;
}) {
    return (
        <div className="mt-4 flex items-center gap-4 rounded-xl border border-warning bg-warning/10 px-4 py-3.5">
            <div className="grid size-9.5 shrink-0 place-items-center rounded-lg bg-warning text-white">
                <InfoIcon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-foreground">
                    {moderationBanner.title(count)}
                </p>
                <p className="text-[13px] text-muted-foreground">
                    {moderationBanner.description}
                </p>
            </div>
            <Button
                type="button"
                onClick={onReview}
                className="h-9 shrink-0 px-4"
            >
                {moderationBanner.action}
            </Button>
        </div>
    );
}

export { ModerationBanner };
