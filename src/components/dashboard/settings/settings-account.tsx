import { Card, CardContent } from "@/components/ui/card";
import { AccountForm } from "@/components/dashboard/settings/account-form";
import type { Account } from "@/lib/account";
import { timeZoneOptions } from "@/lib/config/locale";

function SettingsAccount({ account }: { account: Account }) {
    return (
        <Card className="[--card-spacing:--spacing(7.5)]">
            <CardContent>
                <AccountForm account={account} timeZones={timeZoneOptions()} />
            </CardContent>
        </Card>
    );
}

export { SettingsAccount };
