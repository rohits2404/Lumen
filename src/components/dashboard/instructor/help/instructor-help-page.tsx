"use client";

import * as React from "react";
import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { HelpContactCards } from "@/components/dashboard/instructor/help/help-contact-cards";
import { HelpFaqCard } from "@/components/dashboard/instructor/help/help-faq-card";
import { HelpTopicCard } from "@/components/dashboard/instructor/help/help-topic-card";
import {
    helpTopics,
    instructorFaqs,
    instructorHelpCopy,
    type HelpFacts,
} from "@/lib/config/instructor-help";
import { instructorHelpArticles } from "@/lib/config/instructor-help-articles";

function InstructorHelp({ facts }: { facts: HelpFacts }) {
    const [query, setQuery] = React.useState("");
    const deferred = React.useDeferredValue(query);
    const faqs = React.useMemo(() => instructorFaqs(facts), [facts]);

    const resolved = React.useMemo(
        () =>
            helpTopics.map((topic) => {
                const articles = instructorHelpArticles.filter(
                    (entry) => entry.categorySlug === topic.slug,
                );
                return {
                    topic,
                    count: articles.length,
                    href: articles[0]
                        ? `/dashboard/instructor/help/${articles[0].slug}`
                        : "/dashboard/instructor/help",
                    haystack:
                        `${topic.title} ${topic.description} ` +
                        articles
                            .map((entry) => `${entry.title} ${entry.lead}`)
                            .join(" "),
                };
            }),
        [],
    );

    const needle = deferred.trim().toLowerCase();
    const topics = needle
        ? resolved.filter((entry) =>
              entry.haystack.toLowerCase().includes(needle),
          )
        : resolved;
    const questions = needle
        ? faqs.filter((faq) =>
              `${faq.question} ${faq.answer}`.toLowerCase().includes(needle),
          )
        : faqs;
    const empty = topics.length === 0 && questions.length === 0;

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <div className="mx-auto w-full max-w-250">
                <div className="rounded-2xl border bg-card p-10 text-center">
                    <h1 className="text-3xl">{instructorHelpCopy.title}</h1>
                    <p className="mt-2.5 text-[15px] leading-6 text-muted-foreground">
                        {instructorHelpCopy.lead}
                    </p>
                    <div className="relative mx-auto mt-5.5 max-w-129.5">
                        <SearchIcon className="pointer-events-none absolute top-1/2 left-4.5 size-4.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={instructorHelpCopy.searchPlaceholder}
                            aria-label={instructorHelpCopy.searchPlaceholder}
                            className="h-12.5 rounded-lg border-transparent bg-background pr-4.5 pl-12.5 text-[15px] md:text-[15px] dark:bg-background"
                        />
                    </div>
                </div>

                {empty ? (
                    <div className="mt-9 rounded-xl border bg-card px-6 py-16 text-center">
                        <p className="text-[15px] font-semibold">
                            {instructorHelpCopy.noResults}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {instructorHelpCopy.noResultsHint}
                        </p>
                    </div>
                ) : null}

                {topics.length > 0 ? (
                    <>
                        <h2 className="mt-9 mb-4.5 text-xl leading-none font-bold">
                            {instructorHelpCopy.topicsHeading}
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {topics.map((entry) => (
                                <HelpTopicCard
                                    key={entry.topic.slug}
                                    topic={entry.topic}
                                    href={entry.href}
                                    count={entry.count}
                                />
                            ))}
                        </div>
                    </>
                ) : null}

                {questions.length > 0 ? (
                    <>
                        <h2 className="mt-9 mb-4.5 text-xl leading-none font-bold">
                            {instructorHelpCopy.faqHeading}
                        </h2>
                        <HelpFaqCard
                            key={questions.map((faq) => faq.question).join("|")}
                            faqs={questions}
                        />
                    </>
                ) : null}

                <div className="mt-6">
                    <HelpContactCards supportEmail={facts.supportEmail} />
                </div>
            </div>
        </main>
    );
}

export { InstructorHelp };
