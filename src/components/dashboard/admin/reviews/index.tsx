import { ReportedReviewsList } from "@/components/dashboard/admin/reviews/reported-reviews-list";
import type { ReportedReviewCardRow } from "@/components/dashboard/admin/reviews/reported-review-card";
import {
    formatReportedAt,
    formatReportedExact,
} from "@/components/dashboard/admin/reviews/reviews-format";
import { adminReviewsCopy } from "@/lib/config/admin-reviews";
import { getReportedReviewsPage, type ReviewsQuery } from "@/lib/admin/reviews";

async function ReportedReviewsPage({ query }: { query: ReviewsQuery }) {
    const page = await getReportedReviewsPage(query);

    const rows: ReportedReviewCardRow[] = page.rows.map((row) => ({
        id: row.id,
        reason: row.reason,
        reportedLabel: formatReportedAt(row.reportedAt, page.generatedAt),
        reportedTitle: formatReportedExact(row.reportedAt),
        body: row.body,
        courseTitle: row.courseTitle,
        authorName: row.authorName,
        authorEmail: row.authorEmail,
        authorImage: row.authorImage,
        authorSuspended: row.authorStatus === "SUSPENDED",
    }));

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <h1 className="text-[32px] leading-none font-bold">
                {adminReviewsCopy.title}
            </h1>
            <p className="mt-2.5 text-[15px] text-muted-foreground">
                {adminReviewsCopy.description}
            </p>

            <ReportedReviewsList
                rows={rows}
                page={page.page}
                pageCount={page.pageCount}
                total={page.total}
            />
        </main>
    );
}

export { ReportedReviewsPage };
