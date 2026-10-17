import Link from "next/link";
import {
    ChevronRightIcon,
    ClockIcon,
    SendIcon,
    SparklesIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HelpArticleFeedback } from "./help-article-feedback";
import { HelpArticleRail } from "./help-article-rail";
import {
    helpArticleCopy,
    sectionId,
    type HelpArticleView,
} from "@/lib/config/help-article";

function HelpArticlePage({ view }: { view: HelpArticleView }) {
    const { article, categoryTitle, updatedLabel, related, homeHref } = view;
    const mailto = `mailto:${view.supportEmail}?subject=${encodeURIComponent(
        `${helpArticleCopy.support.subject}: ${article.title}`,
    )}`;

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <div className="mx-auto w-full max-w-250">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
                    <article className="min-w-0">
                        <nav
                            aria-label="Breadcrumb"
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                            <Link
                                href={homeHref}
                                className="transition-colors hover:text-foreground"
                            >
                                {helpArticleCopy.breadcrumbHome}
                            </Link>
                            <ChevronRightIcon className="size-4 shrink-0 text-subtle-foreground" />
                            <span>{categoryTitle}</span>
                        </nav>

                        <h1 className="mt-3.5 text-3xl">{article.title}</h1>

                        <div className="mt-3 flex items-center gap-2.5 text-[13px] text-muted-foreground">
                            <ClockIcon className="size-4 shrink-0" />
                            <span>
                                {helpArticleCopy.readTime(article.readMinutes)}
                            </span>
                            <span
                                aria-hidden
                                className="text-subtle-foreground"
                            >
                                •
                            </span>
                            <span>{helpArticleCopy.updated(updatedLabel)}</span>
                        </div>

                        <div className="max-w-174">
                            <p className="mt-5 text-[17px] leading-7">
                                {article.lead}
                            </p>

                            {article.sections.map((section) => (
                                <section
                                    key={section.title}
                                    id={sectionId(section.title)}
                                    className="scroll-mt-21.5"
                                >
                                    <h2 className="mt-8 text-xl font-bold">
                                        {section.title}
                                    </h2>
                                    {section.paragraphs.map(
                                        (paragraph, index) => (
                                            <p
                                                key={paragraph}
                                                className={cn(
                                                    "text-base leading-6.75 text-muted-foreground",
                                                    index === 0
                                                        ? "mt-2"
                                                        : "mt-4",
                                                )}
                                            >
                                                {paragraph}
                                            </p>
                                        ),
                                    )}
                                    {section.callout ? (
                                        <div className="mt-4 flex gap-3 rounded-lg rounded-l-none border border-l-[3px] border-l-foreground bg-hover px-5 py-4.5">
                                            <SparklesIcon className="mt-0.5 size-4.5 shrink-0" />
                                            <div>
                                                <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                                                    {section.callout.label}
                                                </p>
                                                <p className="mt-2 text-[15px] leading-6">
                                                    {section.callout.body}
                                                </p>
                                            </div>
                                        </div>
                                    ) : null}
                                </section>
                            ))}
                        </div>

                        <div className="mt-10 flex flex-col gap-4">
                            <HelpArticleFeedback />

                            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5.5">
                                <div>
                                    <p className="text-[15px] leading-none font-bold">
                                        {helpArticleCopy.support.title}
                                    </p>
                                    <p className="mt-2.5 text-[13px] leading-none text-muted-foreground">
                                        {helpArticleCopy.support.description}
                                    </p>
                                </div>
                                <Button
                                    nativeButton={false}
                                    className="h-10 gap-2 px-4.5 text-sm font-semibold"
                                    render={<a href={mailto} />}
                                >
                                    <SendIcon className="size-4.5" />
                                    {helpArticleCopy.support.action}
                                </Button>
                            </div>
                        </div>
                    </article>

                    <HelpArticleRail
                        sections={article.sections}
                        related={related}
                        articleHref={view.articleHref}
                    />
                </div>
            </div>
        </main>
    );
}

export { HelpArticlePage };
