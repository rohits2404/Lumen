import { Card, CardContent } from "@/components/ui/card";
import { PayoutSettingsForm } from "@/components/dashboard/instructor/settings/payout-settings-form";
import type { PayoutSettings } from "@/lib/instructor-payouts";

function SettingsPayouts({ settings }: { settings: PayoutSettings }) {
    return (
        <Card className="[--card-spacing:--spacing(7.5)]">
            <CardContent>
                <PayoutSettingsForm settings={settings} />
            </CardContent>
        </Card>
    );
}

export { SettingsPayouts };
