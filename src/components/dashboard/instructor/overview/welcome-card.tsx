import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { instructorOverviewCards as copy } from "@/lib/config/instructor-overview";

function WelcomeCard({
    firstName,
    learners,
}: {
    firstName: string;
    learners: number;
}) {
    return (
        <Card className="gap-0 overflow-hidden p-7.5 ring-border">
            <div className="flex items-center gap-6">
                <div className="min-w-0 flex-1">
                    <p className="text-[30px] leading-none font-extrabold tracking-[-0.02em]">
                        {copy.welcome.greeting(firstName)}{" "}
                        <span aria-hidden>👋</span>
                    </p>
                    <h2 className="mt-4 max-w-105 text-[22px] leading-[1.3] font-bold">
                        {learners > 0
                            ? copy.welcome.headline(learners)
                            : copy.welcome.headlineEmpty}
                    </h2>
                    <p className="mt-3 max-w-105 text-[15px] leading-[1.55] text-muted-foreground">
                        {copy.welcome.lead}
                    </p>
                    <Button
                        nativeButton={false}
                        render={
                            <Link href="/dashboard/instructor/courses/new" />
                        }
                        className="mt-6 h-11 px-5 font-semibold"
                    >
                        {copy.welcome.cta}
                    </Button>
                </div>

                <div className="hidden w-55 shrink-0 lg:block">
                    <img
                        src="/illustrations/academy-dashboard-light.svg"
                        alt=""
                        aria-hidden
                        className="w-full dark:hidden"
                    />
                    <img
                        src="/illustrations/academy-dashboard-dark.svg"
                        alt=""
                        aria-hidden
                        className="hidden w-full dark:block"
                    />
                </div>
            </div>
        </Card>
    );
}

export { WelcomeCard };
