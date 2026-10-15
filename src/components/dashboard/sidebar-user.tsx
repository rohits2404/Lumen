"use client";

import * as React from "react";
import { EllipsisVerticalIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebar } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { AccountMenu } from "@/components/dashboard/account-menu";
import { initialsOf, type MenuUser } from "@/lib/user";

function SidebarUser({
    user,
    isAdmin,
    adminMode,
}: {
    user: MenuUser;
    isAdmin?: boolean;
    adminMode?: boolean;
}) {
    const { isMobile } = useSidebar();
    const [signingOut, setSigningOut] = React.useState(false);

    return (
        <AccountMenu
            user={user}
            isAdmin={isAdmin}
            adminMode={adminMode}
            signingOut={signingOut}
            onSignOutStart={() => setSigningOut(true)}
            side={isMobile ? "top" : "right"}
            align="end"
            sideOffset={isMobile ? 8 : 20}
            triggerClassName="flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors outline-none hover:bg-hover focus-visible:ring-3 focus-visible:ring-ring/50 data-[popup-open]:bg-hover group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            trigger={
                <>
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
                    <span className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
                        <span className="truncate text-[13px] font-semibold">
                            {user.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                            {user.email}
                        </span>
                    </span>
                    <EllipsisVerticalIcon className="size-4 shrink-0 text-subtle-foreground group-data-[collapsible=icon]:hidden" />
                </>
            }
        />
    );
}

export { SidebarUser };
