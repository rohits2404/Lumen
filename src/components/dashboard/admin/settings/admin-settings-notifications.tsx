import { Card, CardContent } from "@/components/ui/card";
import { AdminNotificationsForm } from "@/components/dashboard/admin/settings/admin-notifications-form";
import type { AdminNotificationSettings } from "@/lib/admin/notifications";

function AdminSettingsNotifications({
    settings,
}: {
    settings: AdminNotificationSettings;
}) {
    return (
        <Card className="[--card-spacing:--spacing(7.5)]">
            <CardContent>
                <AdminNotificationsForm settings={settings} />
            </CardContent>
        </Card>
    );
}

export { AdminSettingsNotifications };
