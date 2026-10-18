import { Card, CardContent } from "@/components/ui/card";
import { PlatformControlsForm } from "@/components/dashboard/admin/settings/platform-controls-form";
import type { PlatformSetting } from "@/generated/prisma/client";

function AdminSettingsPlatform({ settings }: { settings: PlatformSetting }) {
    return (
        <Card className="[--card-spacing:--spacing(7.5)]">
            <CardContent>
                <PlatformControlsForm settings={settings} />
            </CardContent>
        </Card>
    );
}

export { AdminSettingsPlatform };
