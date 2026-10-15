"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleCheckIcon, LogOutIcon, ShieldCheckIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initialsOf, type MenuUser } from "@/lib/user";
import { authClient } from "@/lib/auth-client";
import { accountMenu } from "@/lib/config/dashboard";
import { adminAccountMenu, EXIT_ADMIN_HREF } from "@/lib/config/admin-nav";

type Placement = React.ComponentProps<typeof DropdownMenuContent>;

function AccountMenu({
    user,
    isAdmin,
    adminMode,
    trigger,
    triggerClassName,
    side = "bottom",
    align = "end",
    sideOffset = 8,
    signingOut,
    onSignOutStart,
}: {
    user: MenuUser;
    isAdmin?: boolean;
    adminMode?: boolean;
    trigger: React.ReactNode;
    triggerClassName?: string;
    side?: Placement["side"];
    align?: Placement["align"];
    sideOffset?: Placement["sideOffset"];
    signingOut?: boolean;
    onSignOutStart?: () => void;
}) {
    const router = useRouter();

    async function signOut() {
        onSignOutStart?.();
        await authClient.signOut();
        router.push("/");
        router.refresh();
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className={triggerClassName}>
                {trigger}
            </DropdownMenuTrigger>

            <DropdownMenuContent
                side={side}
                align={align}
                sideOffset={sideOffset}
                className="w-60"
            >
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
                {(adminMode ? adminAccountMenu : accountMenu).map((entry) => (
                    <DropdownMenuItem
                        key={entry.href}
                        render={<Link href={entry.href} />}
                        className="cursor-pointer p-2"
                    >
                        <entry.icon />
                        {entry.title}
                    </DropdownMenuItem>
                ))}
                {adminMode ? (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            render={<Link href={EXIT_ADMIN_HREF} />}
                            className="cursor-pointer p-2 [&_svg]:text-role-admin"
                        >
                            <CircleCheckIcon />
                            Exit Admin Mode
                        </DropdownMenuItem>
                    </>
                ) : isAdmin ? (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            render={<Link href="/dashboard/admin" />}
                            className="cursor-pointer p-2"
                        >
                            <ShieldCheckIcon />
                            Admin Console
                        </DropdownMenuItem>
                    </>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={signOut}
                    disabled={signingOut}
                    className="cursor-pointer p-2"
                >
                    <LogOutIcon />
                    Log Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export { AccountMenu };
