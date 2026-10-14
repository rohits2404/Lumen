import { footerLegalNav, footerNav, siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Logo } from "../shared/logo";

function Footer({ className }: { className?: string }) {
    return (
        <footer className={cn("w-full border-t bg-background", className)}>
            <div className="mx-auto w-full max-w-300 px-6">
                <div className="grid grid-cols-2 gap-x-8 gap-y-10 pt-8 pb-4 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:gap-y-8 md:pt-13 md:pb-7">
                    <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
                        <Link
                            href="/"
                            aria-label={`${siteConfig.name} Home`}
                            className="w-fit"
                        >
                            <Logo markClassName="size-8" />
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            {siteConfig.tagline}
                        </p>
                    </div>

                    {footerNav.map((group) => (
                        <nav
                            key={group.title}
                            className="flex flex-col gap-2.5"
                        >
                            <h3 className="text-sm">{group.title}</h3>
                            <ul className="flex flex-col gap-2">
                                {group.items.map((item) => (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            {item.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                <div className="flex flex-col items-center justify-between gap-3 border-t py-5 text-[13px] sm:h-14 sm:flex-row sm:py-0">
                    <p className="text-subtle-foreground">
                        © {new Date().getFullYear()} {siteConfig.legalName}
                    </p>
                    <nav className="flex items-center gap-5">
                        {footerLegalNav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </footer>
    );
}

export { Footer };
