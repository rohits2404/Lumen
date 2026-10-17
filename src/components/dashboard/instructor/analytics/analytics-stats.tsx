import { StatCard } from "@/components/dashboard/stat-card";
import {
    analyticsFootnotes,
    analyticsStatCards,
} from "@/lib/config/instructor-analytics";
import type { AnalyticsStats as Stats } from "@/lib/instructor-analytics";

function AnalyticsStats({ stats }: { stats: Stats }) {
    const footnotes: Record<
        (typeof analyticsStatCards)[number]["key"],
        string
    > = {
        enrolments: analyticsFootnotes.enrolments(stats.perDay),
        openQuestions: analyticsFootnotes.openQuestions,
        completion: analyticsFootnotes.completion,
        watchTime: analyticsFootnotes.watchTime,
    };

    return (
        <div className="mt-6 grid gap-4.5 sm:grid-cols-2 xl:grid-cols-4">
            {analyticsStatCards.map((card) => (
                <StatCard
                    key={card.key}
                    label={card.label}
                    icon={card.icon}
                    value={stats[card.key].value}
                    delta={stats[card.key].delta}
                    format={card.format}
                    deltaFormat={card.deltaFormat}
                    footnote={footnotes[card.key]}
                    arrow
                />
            ))}
        </div>
    );
}

export { AnalyticsStats };
