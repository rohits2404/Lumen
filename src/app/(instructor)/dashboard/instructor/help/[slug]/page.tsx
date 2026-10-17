import { HelpArticlePage } from "@/components/dashboard/help/help-article-page";
import { getPlatformSettings } from "@/lib/admin/settings";
import {
    formatArticleDate,
    HelpArticleLink,
    HelpArticleView,
} from "@/lib/config/help-article";
import { helpTopics } from "@/lib/config/instructor-help";
import {
    instructorHelpArticle,
    instructorHelpArticles,
} from "@/lib/config/instructor-help-articles";
import { notFound } from "next/navigation";
import React from "react";

const RELATED_LIMIT = 4;

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    const article = instructorHelpArticle(slug);
    if (!article) notFound();

    const settings = await getPlatformSettings();
    const topic = helpTopics.find(
        (entry) => entry.slug === article.categorySlug,
    );

    const toLink = (entry: (typeof instructorHelpArticles)[number]) =>
        ({
            slug: entry.slug,
            title: entry.title,
            readMinutes: entry.readMinutes,
        }) satisfies HelpArticleLink;

    const named = (article.related ?? [])
        .map((s) => instructorHelpArticles.find((entry) => entry.slug === s))
        .filter((entry) => entry !== undefined);
    const sameCategory = instructorHelpArticles.filter(
        (entry) =>
            entry.categorySlug === article.categorySlug &&
            entry.slug !== article.slug,
    );
    const related = [...named, ...sameCategory]
        .filter(
            (entry, index, all) =>
                entry.slug !== article.slug &&
                all.findIndex((other) => other.slug === entry.slug) === index,
        )
        .slice(0, RELATED_LIMIT)
        .map(toLink);

    const view: HelpArticleView = {
        article,
        categoryTitle: topic?.title ?? "Help Center",
        updatedLabel: formatArticleDate(article.updatedAt),
        related,
        homeHref: "/dashboard/instructor/help",
        articleHref: (target) => `/dashboard/instructor/help/${target}`,
        supportEmail: settings.supportEmail,
    };

    return <HelpArticlePage view={view} />;
};

export default Page;
