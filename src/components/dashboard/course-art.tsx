import {
    categoryGradients,
    categoryIcons,
    FALLBACK_CATEGORY_GRADIENT,
    FALLBACK_CATEGORY_ICON,
} from "@/lib/config/admin-overview";
import { cn } from "@/lib/utils";

function CourseArt({
    thumbnailUrl,
    categorySlug,
    categoryAccent,
    className,
    iconClassName,
}: {
    thumbnailUrl: string | null;
    categorySlug: string;
    categoryAccent: string;
    className?: string;
    iconClassName?: string;
}) {
    if (thumbnailUrl) {
        return (
            <img
                src={thumbnailUrl}
                alt=""
                className={cn("object-cover", className)}
                referrerPolicy="no-referrer"
            />
        );
    }

    const Icon = categoryIcons[categorySlug] ?? FALLBACK_CATEGORY_ICON;
    const gradient =
        categoryGradients[categoryAccent] ?? FALLBACK_CATEGORY_GRADIENT;

    return (
        <div
            aria-hidden
            className={cn(
                "grid shrink-0 place-items-center bg-linear-to-br",
                gradient,
                className,
            )}
        >
            <Icon className={cn("text-white/30", iconClassName)} />
        </div>
    );
}

export { CourseArt };
