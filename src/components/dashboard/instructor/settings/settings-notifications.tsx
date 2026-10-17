import { Card, CardContent } from "@/components/ui/card";
import { InstructorNotificationsForm } from "@/components/dashboard/instructor/settings/instructor-notifications-form";
import type { InstructorNotificationSettings } from "@/lib/instructor-notifications";

function SettingsNotifications({
    settings,
}: {
    settings: InstructorNotificationSettings;
}) {
    return (
        <Card className="[--card-spacing:--spacing(7.5)]">
            <CardContent>
                <InstructorNotificationsForm settings={settings} />
            </CardContent>
        </Card>
    );
}

export { SettingsNotifications };
