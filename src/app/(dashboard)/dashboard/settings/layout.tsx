import { SettingsNav } from "@/components/dashboard/settings/settings-nav";
import { settingsHeading } from "@/lib/config/settings";
import React from "react";

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <div className="max-w-294.5">
                <div>
                    <h1 className="text-[32px] leading-none font-bold">
                        {settingsHeading.title}
                    </h1>
                    <p className="mt-2.5 text-muted-foreground">
                        {settingsHeading.description}
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-7 lg:grid-cols-[228px_minmax(0,1fr)]">
                    <div className="lg:self-start">
                        <SettingsNav />
                    </div>
                    {children}
                </div>
            </div>
        </main>
    );
};

export default SettingsLayout;
