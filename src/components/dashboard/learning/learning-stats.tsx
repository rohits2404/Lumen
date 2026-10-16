import {
    AwardIcon,
    BookOpenIcon,
    CircleCheckIcon,
    ClockIcon,
} from "lucide-react";

import { LearningStatCard } from "@/components/dashboard/learning/learning-stat-card";
import type { MyLearning } from "@/lib/learning";

function LearningStats({ stats }: { stats: MyLearning["stats"] }) {
    const cards = [
        {
            icon: BookOpenIcon,
            value: String(stats.inProgress),
            label: "In Progress",
        },
        {
            icon: CircleCheckIcon,
            value: String(stats.completed),
            label: "Completed",
        },
        { icon: ClockIcon, value: String(stats.hours), label: "Hours Learned" },
        {
            icon: AwardIcon,
            value: String(stats.certificates),
            label: "Certificates",
        },
    ];

    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((stat) => (
                <LearningStatCard key={stat.label} {...stat} />
            ))}
        </div>
    );
}

export { LearningStats };
