import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config/site";

type LogoTone = "brand" | "solid";

function LogoMark({
    className,
    tone = "brand",
}: {
    className?: string;
    tone?: LogoTone;
}) {
    return (
        <span
            className={cn(
                "relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[14px]",
                "transition-transform duration-200",
                tone === "brand"
                    ? "bg-linear-to-br from-indigo-600 via-violet-600 to-purple-700 shadow-lg shadow-violet-600/20"
                    : "bg-foreground",
                className,
            )}
        >
            {/* Subtle decorative glow */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-3 -top-3 size-8 rounded-full bg-white/20 blur-xl"
            />

            <svg
                viewBox="0 0 40 40"
                fill="none"
                aria-hidden="true"
                className="relative size-[76%] text-white"
            >
                <defs>
                    <linearGradient
                        id="lumen-book-gradient"
                        x1="8"
                        y1="12"
                        x2="32"
                        y2="30"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="white" />
                        <stop offset="1" stopColor="#E9D5FF" />
                    </linearGradient>
                </defs>

                {/* Open book: left page */}
                <path
                    d="M19.4 13.8C16.1 11.4 11.8 11 7.8 12.7V27.2C12 25.6 16.1 26.2 19.4 29"
                    stroke="url(#lumen-book-gradient)"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Open book: right page */}
                <path
                    d="M20.6 13.8C23.9 11.4 28.2 11 32.2 12.7V27.2C28 25.6 23.9 26.2 20.6 29"
                    stroke="url(#lumen-book-gradient)"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Center fold */}
                <path
                    d="M20 14V29"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                />

                {/* Lines on the pages */}
                <path
                    d="M11 17.2C13.1 16.7 15.1 17 16.7 17.8M11 21C13.1 20.5 15.1 20.8 16.7 21.6M23.3 17.8C24.9 17 26.9 16.7 29 17.2M23.3 21.6C24.9 20.8 26.9 20.5 29 21"
                    stroke="white"
                    strokeOpacity=".75"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                />

                {/* Spark: curiosity and new ideas */}
                <path
                    d="M29.5 4.5L31 8.3L34.5 9.5L31 10.8L29.5 14.5L28.2 10.8L24.5 9.5L28.2 8.3L29.5 4.5Z"
                    fill="#FDE68A"
                    stroke="#FDE68A"
                    strokeWidth=".6"
                    strokeLinejoin="round"
                />
            </svg>
        </span>
    );
}

function Logo({
    className,
    markClassName,
    labelClassName,
}: {
    className?: string;
    markClassName?: string;
    labelClassName?: string;
}) {
    return (
        <span className={cn("inline-flex items-center gap-3", className)}>
            <LogoMark className={markClassName} />

            <span className="flex flex-col justify-center">
                <span
                    className={cn(
                        "text-xl font-extrabold leading-none tracking-[-0.045em]",
                        labelClassName,
                    )}
                >
                    {siteConfig.name}
                </span>

                <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.19em] text-muted-foreground">
                    Learn · Create · Share
                </span>
            </span>
        </span>
    );
}

export { Logo, LogoMark };
