import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Stars({
    rating,
    className,
    gapClassName = "gap-[3px]",
}: {
    rating: number;
    className?: string;
    gapClassName?: string;
}) {
    const filled = Math.floor(rating);

    return (
        <span
            aria-hidden
            className={cn("flex shrink-0 items-center", gapClassName)}
        >
            {Array.from({ length: 5 }, (_, index) => (
                <StarIcon
                    key={index}
                    className={cn(
                        "size-3",
                        index < filled
                            ? "fill-star text-star"
                            : "fill-track text-track",
                        className,
                    )}
                />
            ))}
        </span>
    );
}

export { Stars };
