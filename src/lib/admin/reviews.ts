import { db } from "@/lib/db";
import { REPORTED_REVIEWS_PAGE_SIZE } from "@/lib/config/admin-reviews";
import type { ReportReason, UserStatus } from "@/generated/prisma/client";

export type ReportedReviewRow = {
    id: string;
    reason: ReportReason;
    reportedAt: Date;
    reviewId: string;
    body: string;
    courseTitle: string;
    authorId: string;
    authorName: string;
    authorEmail: string;
    authorImage: string | null;
    authorStatus: UserStatus;
};

export type ReportedReviewsPage = {
    rows: ReportedReviewRow[];
    total: number;
    page: number;
    pageCount: number;
    generatedAt: Date;
};

export type ReviewsQuery = { page: number };

export function parseReviewsQuery(params: {
    page?: string | string[];
}): ReviewsQuery {
    const raw = Array.isArray(params.page) ? params.page[0] : params.page;
    const page = Number(raw);
    return { page: Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1 };
}

export async function getReportedReviewsPage(
    query: ReviewsQuery,
): Promise<ReportedReviewsPage> {
    const where = { status: "OPEN", targetType: "REVIEW" } as const;

    const total = await db.contentReport.count({ where });
    const pageCount = Math.max(
        1,
        Math.ceil(total / REPORTED_REVIEWS_PAGE_SIZE),
    );
    const page = Math.min(query.page, pageCount);

    const reports = await db.contentReport.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * REPORTED_REVIEWS_PAGE_SIZE,
        take: REPORTED_REVIEWS_PAGE_SIZE,
        select: { id: true, targetId: true, reason: true, createdAt: true },
    });

    const reviews = await db.courseReview.findMany({
        where: { id: { in: reports.map((report) => report.targetId) } },
        select: {
            id: true,
            body: true,
            course: { select: { title: true } },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    status: true,
                },
            },
        },
    });

    const byId = new Map(reviews.map((review) => [review.id, review]));

    const rows = reports.flatMap<ReportedReviewRow>((report) => {
        const review = byId.get(report.targetId);
        if (!review) return [];
        return [
            {
                id: report.id,
                reason: report.reason,
                reportedAt: report.createdAt,
                reviewId: review.id,
                body: review.body,
                courseTitle: review.course.title,
                authorId: review.user.id,
                authorName: review.user.name,
                authorEmail: review.user.email,
                authorImage: review.user.image,
                authorStatus: review.user.status,
            },
        ];
    });

    return { rows, total, page, pageCount, generatedAt: new Date() };
}
