import { cn } from "@/lib/utils";

function HeroBackdrop({ className }: { className?: string }) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                "pointer-events-none absolute inset-0 overflow-hidden",
                className,
            )}
        >
            <div className="bg-hero-grid absolute inset-0" />

            <div className="orb top-44.75 left-[29.2%] size-130 -translate-x-1/2 -translate-y-1/2 animate-drift-1 bg-accent-1 opacity-(--orb-strong)" />
            <div className="orb top-38.75 left-[66%] size-120 -translate-x-1/2 -translate-y-1/2 animate-drift-2 bg-accent-2 opacity-(--orb-soft)" />
            <div className="orb top-147.75 left-[50.3%] size-140 -translate-x-1/2 -translate-y-1/2 animate-drift-3 bg-accent-3 opacity-(--ambient)" />

            <div className="absolute inset-x-0 bottom-0 h-64 bg-linear-to-b from-transparent to-background" />
        </div>
    );
}

export { HeroBackdrop };
