import { SettingsPayouts } from "@/components/dashboard/instructor/settings/settings-payouts";
import { Card, CardContent } from "@/components/ui/card";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty";
import { getPayoutSettings } from "@/lib/instructor-payouts";
import React from "react";

const InstructorSettingsPayoutsPage = async () => {
    const settings = await getPayoutSettings();

    if (!settings) {
        return (
            <Card className="[--card-spacing:--spacing(7.5)]">
                <CardContent>
                    <Empty>
                        <EmptyHeader>
                            <EmptyTitle>
                                Your Teaching Profile Isn&apos;t Ready Yet
                            </EmptyTitle>
                            <EmptyDescription>
                                Payout Settings Appear Once Your Instructor
                                Profile Has Finished Being Set Up. Check Back
                                Shortly.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </CardContent>
            </Card>
        );
    }

    return <SettingsPayouts settings={settings} />;
};

export default InstructorSettingsPayoutsPage;
