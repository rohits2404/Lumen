import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getSession } from "@/lib/auth";
import { getCartCount, getWishlistCount } from "@/lib/cart";
import { canBecomeInstructor, canTeach } from "@/lib/instructor";
import { getUnreadMessageCount } from "@/lib/messages";
import { getUnreadCount } from "@/lib/notification-feed";
import { getBusinessOffer } from "@/lib/subscription";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
    const session = await getSession();
    if (!session) redirect("/login");

    const { user } = session;
    const sidebarOpen =
        (await cookies()).get("sidebar_state")?.value !== "false";
    const [
        cartCount,
        wishlistCount,
        showInstructorCta,
        teaches,
        unreadNotifications,
        unreadMessages,
        businessOffer,
    ] = await Promise.all([
        getCartCount(),
        getWishlistCount(),
        canBecomeInstructor(user),
        canTeach(user),
        getUnreadCount("LEARNER"),
        getUnreadMessageCount("LEARNER"),
        getBusinessOffer(),
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
            <DashboardSidebar
                user={{ name: user.name, email: user.email, image: user.image }}
                isAdmin={user.role === "admin"}
                canTeach={teaches}
                showUpgrade={businessOffer.state === "available"}
                businessOffer={businessOffer}
                navCounts={{
                    "/dashboard/wishlist": wishlistCount,
                    ...(unreadNotifications > 0
                        ? { "/dashboard/notifications": unreadNotifications }
                        : {}),
                    ...(unreadMessages > 0
                        ? { "/dashboard/messages": unreadMessages }
                        : {}),
                }}
            />
            <SidebarInset>
                <DashboardHeader
                    unreadNotifications={unreadNotifications}
                    user={{
                        name: user.name,
                        email: user.email,
                        image: user.image,
                    }}
                    isAdmin={user.role === "admin"}
                    cartCount={cartCount}
                    showInstructorCta={showInstructorCta}
                />
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
};

export default DashboardLayout;
