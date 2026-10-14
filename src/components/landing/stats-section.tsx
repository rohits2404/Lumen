import { cn } from "@/lib/utils";
import { Card } from "../ui/card";

const stats = [
    { figure: "12,000+", label: "Courses Across 10 Categories" },
    { figure: "480k", label: "Learners On The Platform" },
    { figure: "88%", label: "Median Completion Rate" },
    { figure: "$4.2M", label: "Paid Out To Instructors" },
];

function StatsSection({ className }: { className?: string }) {
    return (
        <section className={cn("w-full", className)}>
            <div className="mx-auto w-full max-w-300 px-6 py-7 md:py-12">
                <Card className="grid grid-cols-2 gap-px bg-border py-0 ring-border md:grid-cols-4">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="flex flex-col items-center gap-1.5 bg-card px-6 py-7 text-center"
                        >
                            <span className="stat-figure text-3xl tracking-[-0.04em] md:text-[32px] lg:text-[38px]">
                                {stat.figure}
                            </span>
                            <span className="text-sm tracking-[-0.01em] text-muted-foreground">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </Card>
            </div>
        </section>
    );
}

export { StatsSection };
