"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboardIcon, LogOutIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { initialsOf, type MenuUser } from "@/lib/user";
import { cn } from "@/lib/utils";

function UserMenu({ user, className }: { user: MenuUser; className?: string }) {
    const router = useRouter();
    const [signingOut, setSigningOut] = React.useState(false);

    async function signOut() {
        setSigningOut(true);
        await authClient.signOut();
        router.push("/");
        router.refresh();
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label="Account menu"
                className={cn(
                    "cursor-pointer rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    className,
                )}
            >
                <Avatar className="size-9.5">
                    {signingOut ? (
                        <AvatarFallback className="bg-hover text-foreground">
                            <Spinner className="size-4" />
                        </AvatarFallback>
                    ) : (
                        <>
                            <AvatarImage
                                src={user.image ?? undefined}
                                alt=""
                                referrerPolicy="no-referrer"
                            />
                            <AvatarFallback className="bg-hover text-xs font-semibold text-foreground">
                                {initialsOf(user.name, user.email)}
                            </AvatarFallback>
                        </>
                    )}
                </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-60">
                <div className="flex items-center gap-3 px-2 py-1.5">
                    <Avatar className="size-9">
                        <AvatarImage
                            src={user.image ?? undefined}
                            alt=""
                            referrerPolicy="no-referrer"
                        />
                        <AvatarFallback className="bg-hover text-xs font-semibold text-foreground">
                            {initialsOf(user.name, user.email)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-bold">
                            {user.name}
                        </span>
                        <span className="truncate text-sm text-muted-foreground">
                            {user.email}
                        </span>
                    </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    render={<Link href="/dashboard" />}
                    className="cursor-pointer"
                >
                    <LayoutDashboardIcon />
                    Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={signOut}
                    disabled={signingOut}
                    className="cursor-pointer"
                >
                    <LogOutIcon />
                    Log Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export { UserMenu };
