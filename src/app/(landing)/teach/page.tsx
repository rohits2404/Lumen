import Link from "next/link";
import { redirect } from "next/navigation";
import {
    ArrowRightIcon,
    CheckCircle2,
    Clock3,
    ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InstructorApplicationForm } from "@/components/landing/instructor-application-form";
import { getPlatformSettings } from "@/lib/admin/settings";
import { getSession } from "@/lib/auth";
import { getInstructorApplicationForUser } from "@/lib/actions/instructor-application";
import { canTeach } from "@/lib/instructor";

const TeachPage = async () => {
    const session = await getSession();
    if (!session) redirect("/login");

    const [settings, teaches, application] = await Promise.all([
        getPlatformSettings(),
        canTeach(session.user),
        getInstructorApplicationForUser(session.user.id),
    ]);

    if (!settings.instructorApplicationsOpen) {
        return (
            <main className="mx-auto max-w-4xl px-4 py-16 md:py-20">
                <Card className="border-dashed border-border bg-muted/30 p-8 md:p-12">
                    <div className="flex items-center gap-3 text-primary">
                        <ShieldCheck className="size-5" />
                        <span className="text-sm font-medium uppercase tracking-[0.18em]">
                            Instructor Applications
                        </span>
                    </div>
                    <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                        Applications Are Currently Paused.
                    </h1>
                    <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
                        We Are Temporarily Not Accepting New Instructor
                        Applications. Please Check Back Soon Or Visit The
                        Instructor Dashboard To Keep Learning.
                    </p>
                    <div className="mt-8">
                        <Button
                            nativeButton={false}
                            render={<Link href="/dashboard" />}
                            className="h-11 gap-2 px-5"
                        >
                            Return To Dashboard
                            <ArrowRightIcon className="size-4" />
                        </Button>
                    </div>
                </Card>
            </main>
        );
    }

    if (teaches) {
        return (
            <main className="mx-auto max-w-4xl px-4 py-16 md:py-20">
                <Card className="p-8 md:p-12">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="size-4" />
                        You Are Already Approved To Teach
                    </div>
                    <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
                        Become an Instructor
                    </h1>
                    <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
                        Your Instructor Access Is Already Active. Continue To
                        Your Instructor Workspace To Manage Courses, Students,
                        And Payouts.
                    </p>
                    <div className="mt-8">
                        <Button
                            nativeButton={false}
                            render={<Link href="/dashboard/instructor" />}
                            className="h-11 gap-2 px-5"
                        >
                            Open Instructor Dashboard
                            <ArrowRightIcon className="size-4" />
                        </Button>
                    </div>
                </Card>
            </main>
        );
    }

    if (application?.status === "pending") {
        return (
            <main className="mx-auto max-w-4xl px-4 py-16 md:py-20">
                <Card className="p-8 md:p-12">
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-700 dark:text-amber-300">
                        <Clock3 className="size-4" />
                        Application Pending Review
                    </div>
                    <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
                        Your Instructor Application Is Under Review.
                    </h1>
                    <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
                        We Have Already Received Your Application And Will
                        Review It As Soon As Possible. Please Wait For An Update
                        Before Submitting A Second Application.
                    </p>
                    <div className="mt-8">
                        <Button
                            nativeButton={false}
                            render={<Link href="/dashboard" />}
                            className="h-11 gap-2 px-5"
                        >
                            Return To Learning Dashboard
                            <ArrowRightIcon className="size-4" />
                        </Button>
                    </div>
                </Card>
            </main>
        );
    }

    if (application?.status === "approved") {
        return (
            <main className="mx-auto max-w-4xl px-4 py-16 md:py-20">
                <Card className="p-8 md:p-12">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="size-4" />
                        Application Approved
                    </div>
                    <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
                        Your Instructor Access Is Being Prepared.
                    </h1>
                    <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
                        We Approved Your Instructor Application. Your Instructor
                        Workspace Will Be Available As Soon As Your Access Is
                        Provisioned.
                    </p>
                    <div className="mt-8">
                        <Button
                            nativeButton={false}
                            render={<Link href="/dashboard/instructor" />}
                            className="h-11 gap-2 px-5"
                        >
                            Go To Instructor Dashboard
                            <ArrowRightIcon className="size-4" />
                        </Button>
                    </div>
                </Card>
            </main>
        );
    }

    if (application?.status === "rejected") {
        return (
            <main className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-20">
                <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                    <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
                        <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-700 dark:text-amber-300">
                            <Clock3 className="size-4" />
                            Previous Application Was Not Approved
                        </div>
                        <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
                            Become an Instructor
                        </h1>
                        <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
                            Your Last Application Was Declined, But You Can
                            Apply Again If You Want To Update Your Teaching
                            Pitch Or Portfolio.
                        </p>
                        <InstructorApplicationForm />
                    </section>

                    <aside className="rounded-2xl border border-border bg-muted/30 p-6 md:p-8">
                        <h2 className="text-xl font-semibold">
                            What We Look For
                        </h2>
                        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                            <li>
                                • Demonstrated Expertise In The Subject You Want
                                To Teach.
                            </li>
                            <li>
                                • A Clear Teaching Approach And Student
                                Outcomes.
                            </li>
                            <li>
                                • Helpful Portfolios, Examples, Or Prior Work.
                            </li>
                            <li>
                                • A Strong Understanding Of Your Audience And
                                Teaching Style.
                            </li>
                        </ul>
                    </aside>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-20">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        <ShieldCheck className="size-4" />
                        Start Teaching on Lumen
                    </div>
                    <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
                        Become an Instructor
                    </h1>
                    <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
                        Share Your Expertise, Build Your Teaching Brand, And
                        Help Students Learn From Practical, High-Quality
                        Lessons.
                    </p>
                    <InstructorApplicationForm />
                </section>

                <aside className="rounded-2xl border border-border bg-muted/30 p-6 md:p-8">
                    <h2 className="text-xl font-semibold">What Happens Next</h2>
                    <ol className="mt-4 space-y-4 text-sm text-muted-foreground">
                        <li>
                            <span className="font-semibold text-foreground">
                                1.
                            </span>{" "}
                            Submit Your Teaching Pitch And Portfolio Links.
                        </li>
                        <li>
                            <span className="font-semibold text-foreground">
                                2.
                            </span>{" "}
                            Our Team Reviews Your Application For Fit And
                            Quality.
                        </li>
                        <li>
                            <span className="font-semibold text-foreground">
                                3.
                            </span>{" "}
                            If Approved, You Will Gain Access To The Instructor
                            Workspace And Course Tools.
                        </li>
                    </ol>
                </aside>
            </div>
        </main>
    );
};

export default TeachPage;
