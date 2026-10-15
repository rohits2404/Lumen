import Link from "next/link";
import { BellIcon, ShoppingCartIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSearch } from "@/components/dashboard/dashboard-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { AccountMenu } from "@/components/dashboard/account-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initialsOf, type MenuUser } from "@/lib/user";

function DashboardHeader({
    user,
    isAdmin,
    cartCount = 0,
    unreadNotifications = 0,
    showInstructorCta = false,
}: {
    user: MenuUser;
    isAdmin?: boolean;
    cartCount?: number;
    unreadNotifications?: number;
    showInstructorCta?: boolean;
}) {
    return (
        <header className="sticky top-0 z-40 flex h-17.5 shrink-0 items-center gap-3 border-b bg-background px-4 sm:gap-4 sm:px-6">
            <SidebarTrigger className="size-9.5 shrink-0 cursor-pointer border bg-card shadow-sm dark:bg-card" />

            <DashboardSearch />

            <div className="ml-auto flex items-center gap-3">
                {showInstructorCta ? (
                    <Link
                        href="/teach"
                        className="text-gradient hidden text-sm font-semibold transition-opacity hover:opacity-80 lg:block"
                    >
                        Become an Instructor
                    </Link>
                ) : null}

                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={
                        cartCount > 0
                            ? `Cart, ${cartCount} ${cartCount === 1 ? "course" : "courses"}`
                            : "Cart"
                    }
                    nativeButton={false}
                    className="relative hidden size-9.5 cursor-pointer sm:inline-flex"
                    render={<Link href="/dashboard/cart" />}
                >
                    <ShoppingCartIcon />
                    {cartCount > 0 ? (
                        <span
                            aria-hidden
                            className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-none font-semibold text-primary-foreground tabular-nums"
                        >
                            {cartCount > 99 ? "99+" : cartCount}
                        </span>
                    ) : null}
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={
                        unreadNotifications > 0
                            ? `Notifications — ${unreadNotifications} unread`
                            : "Notifications"
                    }
                    nativeButton={false}
                    className="relative hidden size-9.5 cursor-pointer sm:inline-flex"
                    render={<Link href="/dashboard/notifications" />}
                >
                    <BellIcon />
                    {unreadNotifications > 0 ? (
                        <span className="absolute top-2 right-2 size-1.5 rounded-full bg-destructive" />
                    ) : null}
                </Button>

                <ThemeToggle variant="ghost" />

                <Separator
                    orientation="vertical"
                    className="mx-1 hidden h-6 sm:block"
                />

                <AccountMenu
                    user={user}
                    isAdmin={isAdmin}
                    triggerClassName="cursor-pointer rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    trigger={
                        <Avatar className="size-9.5">
                            <AvatarImage
                                src={user.image ?? undefined}
                                alt=""
                                referrerPolicy="no-referrer"
                            />
                            <AvatarFallback className="bg-hover text-xs font-semibold text-foreground">
                                {initialsOf(user.name, user.email)}
                            </AvatarFallback>
                        </Avatar>
                    }
                />
            </div>
        </header>
    );
}

export { DashboardHeader };
