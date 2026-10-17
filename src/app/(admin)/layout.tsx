import { AdminHeader } from "@/components/dashboard/admin/admin-header";
import { AdminSidebar } from "@/components/dashboard/admin/admin-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getAttentionFacts } from "@/lib/admin/overview";
import { getSession } from "@/lib/auth";
import { adminNavCounts } from "@/lib/config/admin-nav";
import { getUnreadCount } from "@/lib/notification-feed";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import React from "react";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.user.role !== "admin") notFound();

    const { user } = session;

    const sidebarOpen =
        (await cookies()).get("sidebar_state")?.value !== "false";
    const [attention, unreadNotifications] = await Promise.all([
        getAttentionFacts(),
        getUnreadCount("ADMIN"),
    ]);

    return (
        <SidebarProvider
            defaultOpen={sidebarOpen}
            style={
                {
                    "--sidebar-width": "244px",
                    "--sidebar-width-icon": "76px",
                } as React.CSSProperties
            }
        >
            <AdminSidebar
                user={{ name: user.name, email: user.email, image: user.image }}
                navCounts={adminNavCounts(attention, unreadNotifications)}
            />
            <SidebarInset>
                <AdminHeader
                    user={{
                        name: user.name,
                        email: user.email,
                        image: user.image,
                    }}
                    unreadNotifications={unreadNotifications}
                />
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
};

export default AdminLayout;
