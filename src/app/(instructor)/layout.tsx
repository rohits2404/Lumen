import { InstructorHeader } from "@/components/dashboard/instructor/instructor-header";
import { InstructorSidebar } from "@/components/dashboard/instructor/instructor-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getSession } from "@/lib/auth";
import { instructorNavCounts } from "@/lib/config/instructor-nav";
import { canTeach } from "@/lib/instructor";
import { getUnreadMessageCount } from "@/lib/messages";
import { getUnreadCount } from "@/lib/notification-feed";
import { getUnansweredQuestionCount } from "@/lib/qa";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import React from "react";

const InstructorLayout = async ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const session = await getSession();
    if (!session) redirect("/login");

    const { user } = session;
    if (!(await canTeach(user))) notFound();

    const sidebarOpen =
        (await cookies()).get("sidebar_state")?.value !== "false";
    const [unreadNotifications, unreadMessages, unansweredQuestions] =
        await Promise.all([
            getUnreadCount("INSTRUCTOR"),
            getUnreadMessageCount("INSTRUCTOR"),
            getUnansweredQuestionCount(),
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
            <InstructorSidebar
                user={{ name: user.name, email: user.email, image: user.image }}
                isAdmin={user.role === "admin"}
                navCounts={instructorNavCounts(
                    unreadNotifications,
                    unreadMessages,
                    unansweredQuestions,
                )}
            />
            <SidebarInset>
                <InstructorHeader
                    user={{
                        name: user.name,
                        email: user.email,
                        image: user.image,
                    }}
                    isAdmin={user.role === "admin"}
                    unreadNotifications={unreadNotifications}
                />
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
};

export default InstructorLayout;
