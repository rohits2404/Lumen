import { Card, CardContent } from "@/components/ui/card";
import { NotificationsForm } from "@/components/dashboard/settings/notifications-form";
import type { NotificationSettings } from "@/lib/notifications";

function SettingsNotifications({
    settings,
}: {
    settings: NotificationSettings;
}) {
    return (
        <Card className="[--card-spacing:--spacing(7.5)]">
            <CardContent>
                <NotificationsForm settings={settings} />
            </CardContent>
        </Card>
    );
}

export { SettingsNotifications };
