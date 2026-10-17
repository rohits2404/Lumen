import Link from "next/link";

import {
    instructorHelpCopy,
    type HelpTopic,
} from "@/lib/config/instructor-help";

function HelpTopicCard({
    topic,
    href,
    count,
}: {
    topic: HelpTopic;
    href: string;
    count: number;
}) {
    return (
        <Link
            href={href}
            className="flex flex-col rounded-xl border bg-card p-5.5 transition-colors hover:bg-hover"
        >
            <div className="grid size-10.5 place-items-center rounded-lg bg-hover">
                <topic.icon className="size-4.5" />
            </div>
            <h3 className="mt-4 text-base leading-none">{topic.title}</h3>
            <p className="mt-2.5 text-sm leading-5.25 text-muted-foreground">
                {topic.description}
            </p>
            <p className="mt-auto pt-3 text-[13px] leading-none text-subtle-foreground">
                {instructorHelpCopy.articles(count)}
            </p>
        </Link>
    );
}

export { HelpTopicCard };
