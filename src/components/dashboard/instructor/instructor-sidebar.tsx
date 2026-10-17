"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
import { instructorNav } from "@/lib/config/instructor-nav";
import { siteConfig } from "@/lib/config/site";
import { type MenuUser } from "@/lib/user";

function InstructorSidebar({
    user,
    isAdmin,
    navCounts,
}: {
    user: MenuUser;
    isAdmin?: boolean;
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
                    <WorkspaceSwitch mode="instructor" canTeach />
                </SidebarHeader>

                <SidebarContent className="gap-0 px-3 pt-8 group-data-[collapsible=icon]:px-0">
                    {instructorNav.map((group) => (
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
                </SidebarContent>

                <SidebarFooter className="px-3 pt-5 pb-5 group-data-[collapsible=icon]:px-0">
                    <SidebarUser user={user} isAdmin={isAdmin} />
                </SidebarFooter>
            </Sidebar>
        </TooltipProvider>
    );
}

export { InstructorSidebar };
