"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar";
import { NavRow, NavRowWithChildren } from "@/components/dashboard/sidebar-nav";
import { WorkspaceSwitch } from "@/components/dashboard/workspace-switch";
import { SidebarUser } from "@/components/dashboard/sidebar-user";
import { Logo } from "@/components/shared/logo";
import { type MenuUser } from "@/lib/user";
import { dashboardNav } from "@/lib/config/dashboard";
import { type BusinessOffer, plans } from "@/lib/config/pricing";
import { siteConfig } from "@/lib/config/site";

const business = plans.find((plan) => plan.id === "lumen-business");

function UpgradeCard({ offer }: { offer?: BusinessOffer }) {
    const monthly = offer?.price.monthly ?? business?.price.monthly;
    const yearly = offer?.price.yearly ?? business?.price.yearly;

    return (
        <div className="rounded-xl border bg-card p-5">
            <p className="text-[15px] font-bold">Unlock {business?.name}</p>
            <p className="mt-2 text-[13px] leading-5 text-wrap text-muted-foreground">
                Go Beyond Single Courses. One Plan Unlocks Every Course From
                Every Instructor — {monthly}/mo Or {yearly}/yr.
            </p>
            <Button
                nativeButton={false}
                className="mt-4 h-10 w-full gap-2 text-sm font-semibold"
                render={<Link href="/pricing" />}
            >
                <span className="size-2 rounded-full bg-success" />
                Upgrade Plan
            </Button>
        </div>
    );
}

function DashboardSidebar({
    user,
    isAdmin,
    canTeach,
    navCounts,
    showUpgrade,
    businessOffer,
}: {
    user: MenuUser;
    isAdmin?: boolean;
    showUpgrade?: boolean;
    businessOffer?: BusinessOffer;
    canTeach?: boolean;
    navCounts?: Record<string, number>;
}) {
    const pathname = usePathname();

    return (
        <TooltipProvider>
            <Sidebar collapsible="icon" className="border-r bg-sidebar">
                <SidebarHeader className="gap-0 px-3 pt-5 pb-0 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
                    <Link href="/" aria-label={`${siteConfig.name} home`}>
                        <Logo labelClassName="group-data-[collapsible=icon]:hidden" />
                    </Link>
                    <WorkspaceSwitch mode="student" canTeach={canTeach} />
                </SidebarHeader>

                <SidebarContent className="gap-0 px-3 pt-8 group-data-[collapsible=icon]:px-0">
                    {dashboardNav.map((group) => (
                        <div key={group.title} className="not-first:mt-4.5">
                            <p className="px-3 pb-1.5 text-[11px] font-semibold text-subtle-foreground group-data-[collapsible=icon]:hidden">
                                {group.title}
                            </p>
                            <div className="flex flex-col gap-px">
                                {group.items.map((item) =>
                                    item.items ? (
                                        <NavRowWithChildren
                                            key={item.href}
                                            item={item}
                                            pathname={pathname}
                                        />
                                    ) : (
                                        <NavRow
                                            key={item.href}
                                            item={item}
                                            active={pathname === item.href}
                                            badge={
                                                navCounts?.[item.href] ??
                                                item.badge
                                            }
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    ))}
                    <div className="sticky bottom-0 mt-auto bg-sidebar pt-8 pb-1 group-data-[collapsible=icon]:hidden">
                        {showUpgrade ? (
                            <UpgradeCard offer={businessOffer} />
                        ) : null}
                    </div>
                </SidebarContent>

                <SidebarFooter className="px-3 pt-5 pb-5 group-data-[collapsible=icon]:px-0">
                    <SidebarUser user={user} isAdmin={isAdmin} />
                </SidebarFooter>
            </Sidebar>
        </TooltipProvider>
    );
}

export { DashboardSidebar };
