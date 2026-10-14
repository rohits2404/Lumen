import { getSession } from "@/lib/auth";
import Link from "next/link";
import { Logo } from "../shared/logo";
import { marketingNav, siteConfig } from "@/lib/config/site";
import { ThemeToggle } from "../theme-toggle";
import { UserMenu } from "../shared/user-menu";
import { Button } from "../ui/button";
import { ArrowRightIcon } from "lucide-react";
import { MobileNav } from "./mobile-nav";

async function Header() {
    const session = await getSession();
    const user = session?.user ?? null;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background">
            <div className="mx-auto flex h-17.5 w-full max-w-300 items-center gap-8 px-6">
                <Link href="/" aria-label={`${siteConfig.name} home`}>
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
                    {user ? (
                        <>
                            <UserMenu
                                user={{
                                    name: user.name,
                                    email: user.email,
                                    image: user.image,
                                }}
                            />
                        </>
                    ) : (
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
                    )}
                    <MobileNav user={user} />
                </div>
            </div>
        </header>
    );
}

export { Header };
