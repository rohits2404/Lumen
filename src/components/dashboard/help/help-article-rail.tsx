import Link from "next/link";

import {
    helpArticleCopy,
    sectionId,
    type HelpArticleLink,
    type HelpArticleSection,
} from "@/lib/config/help-article";

function HelpArticleRail({
    sections,
    related,
    articleHref,
}: {
    sections: HelpArticleSection[];
    related: HelpArticleLink[];
    articleHref: (slug: string) => string;
}) {
    return (
        <aside className="lg:sticky lg:top-21.5 lg:mt-9.5 lg:max-h-[calc(100vh-102px)] lg:self-start lg:overflow-y-auto">
            {sections.length > 0 ? (
                <>
                    <p className="text-xs font-semibold tracking-[0.08em] text-subtle-foreground uppercase">
                        {helpArticleCopy.onThisPage}
                    </p>
                    <nav
                        aria-label={helpArticleCopy.onThisPage}
                        className="mt-2.5 border-l"
                    >
                        {sections.map((section) => (
                            <Link
                                key={section.title}
                                href={`#${sectionId(section.title)}`}
                                className="block py-1.5 pl-3.5 text-sm leading-5.25 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {section.title}
                            </Link>
                        ))}
                    </nav>
                </>
            ) : null}

            {related.length > 0 ? (
                <>
                    <p className="mt-5.5 text-xs font-semibold tracking-[0.08em] text-subtle-foreground uppercase">
                        {helpArticleCopy.relatedArticles}
                    </p>
                    <div className="mt-3 flex flex-col gap-3">
                        {related.map((entry) => (
                            <Link
                                key={entry.slug}
                                href={articleHref(entry.slug)}
                                className="rounded-xl border bg-card p-3 transition-colors hover:bg-hover"
                            >
                                <span className="block text-sm leading-4.75 font-bold">
                                    {entry.title}
                                </span>
                                <span className="mt-1.5 block text-xs leading-none text-subtle-foreground">
                                    {helpArticleCopy.readTime(
                                        entry.readMinutes,
                                    )}
                                </span>
                            </Link>
                        ))}
                    </div>
                </>
            ) : null}
        </aside>
    );
}

export { HelpArticleRail };
