import { InstructorSettingsNav } from "@/components/dashboard/instructor/settings/instructor-settings-nav";
import { instructorSettingsHeading } from "@/lib/config/instructor-settings";
import React from "react";

const InstructorSettingsLayout = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <div className="max-w-294.5">
                <div>
                    <h1 className="text-[32px] leading-none font-bold">
                        {instructorSettingsHeading.title}
                    </h1>
                    <p className="mt-2.5 text-muted-foreground">
                        {instructorSettingsHeading.description}
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-7 lg:grid-cols-[228px_minmax(0,1fr)]">
                    <div className="lg:self-start">
                        <InstructorSettingsNav />
                    </div>
                    {children}
                </div>
            </div>
        </main>
    );
};

export default InstructorSettingsLayout;
