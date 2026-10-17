export type HelpCallout = {
    label: string;
    body: string;
};

export type HelpArticleSection = {
    title: string;
    paragraphs: string[];
    callout?: HelpCallout;
};

export type HelpArticleLink = {
    slug: string;
    title: string;
    readMinutes: number;
};

export type HelpArticle = {
    slug: string;
    categorySlug: string;
    title: string;
    lead: string;
    readMinutes: number;
    updatedAt: string;
    sections: HelpArticleSection[];
    related?: string[];
};

export type HelpArticleView = {
    article: HelpArticle;
    categoryTitle: string;
    updatedLabel: string;
    related: HelpArticleLink[];
    homeHref: string;
    articleHref: (slug: string) => string;
    supportEmail: string;
};

export function sectionId(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function formatArticleDate(iso: string): string {
    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(iso));
}

export const helpArticleCopy = {
    breadcrumbHome: "Help Center",
    onThisPage: "On This Page",
    relatedArticles: "Related Articles",
    readTime: (minutes: number) => `${minutes} Min Read`,
    updated: (label: string) => `Updated ${label}`,
    feedback: {
        title: "Was This Article Helpful?",
        description: "Your Feedback Helps Us Write Better Guides.",
        yes: "Yes",
        no: "No",
        thanks: "Thanks — That Helps.",
    },
    support: {
        title: "Still Need A Hand?",
        description: "Support Replies Within One Business Day.",
        action: "Contact Support",
        subject: "Help With A Lumen Guide",
    },
} as const;
