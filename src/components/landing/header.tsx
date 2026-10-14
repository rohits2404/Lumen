import { marketingNav, siteConfig } from "@/lib/config/site";
import Link from "next/link";
import { Logo } from "../shared/logo";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";
import { ArrowRightIcon } from "lucide-react";
import { MobileNav } from "./mobile-nav";

async function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background">
            <div className="mx-auto flex h-17.5 w-full max-w-300 items-center gap-8 px-6">
                <Link href="/" aria-label={`${siteConfig.name} Home`}>
                    <Logo />
                </Link>

                <nav className="hidden items-center gap-8 md:flex">
                    {marketingNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {item.title}
                        </Link>
                    ))}
                </nav>

                <div className="ml-auto flex items-center gap-3">
                    <ThemeToggle />
                    <>
                        <Button
                            variant="ghost"
                            nativeButton={false}
                            className="hidden h-10 px-4 text-muted-foreground sm:inline-flex"
                            render={<Link href="/login" />}
                        >
                            Log In
                        </Button>
                        <Button
                            nativeButton={false}
                            className="hidden h-10 gap-2 px-4.5! font-semibold sm:inline-flex"
                            render={<Link href="/register" />}
                        >
                            Get Started
                            <ArrowRightIcon data-icon="inline-end" />
                        </Button>
                    </>
                    <MobileNav />
                </div>
            </div>
        </header>
    );
}

export { Header };
