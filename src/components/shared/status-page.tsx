import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function StatusPage({
    code,
    title,
    description,
    children,
    className,
}: {
    code?: string;
    title: string;
    description: string;
    children?: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex min-h-[60vh] w-full flex-col items-center justify-center px-6 py-16 text-center",
                className,
            )}
        >
            {code ? (
                <p className="text-[64px] leading-none font-extrabold tracking-[-0.03em] text-subtle-foreground tabular-nums">
                    {code}
                </p>
            ) : null}
            <h1 className="mt-5 text-[26px] leading-tight font-bold">
                {title}
            </h1>
            <p className="mt-2.5 max-w-md text-[15px] text-muted-foreground">
                {description}
            </p>
            {children ? (
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                    {children}
                </div>
            ) : null}
        </div>
    );
}

function HomeButton({
    href = "/dashboard",
    label = "Back To Dashboard",
    variant = "default",
}: {
    href?: string;
    label?: string;
    variant?: "default" | "outline";
}) {
    return (
        <Button
            nativeButton={false}
            variant={variant}
            className={cn(
                "h-10 px-5",
                variant === "outline" && "bg-card shadow-sm",
            )}
            render={<Link href={href} />}
        >
            {label}
        </Button>
    );
}

export { StatusPage, HomeButton };
