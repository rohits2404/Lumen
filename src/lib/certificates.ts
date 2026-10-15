import { Prisma } from "@/generated/prisma/client";
import { getSession } from "@/lib/auth";
import { CERTIFICATES_PAGE_SIZE } from "@/lib/config/certificates";
import { db } from "@/lib/db";

export type CertificateRow = PublicCertificate & { id: string };

export type CertificatesPage = {
    rows: CertificateRow[];
    stats: {
        earned: number;
        hours: number;
        streakDays: number;
    };
    total: number;
    page: number;
    pageCount: number;
};

export type PublicCertificate = {
    serial: string;
    publicSlug: string;
    holderName: string;
    courseTitle: string;
    instructorName: string;
    issuedOn: string;
    issuedYear: number;
    issuedMonth: number;
    grade: string | null;
    scorePercent: number | null;
    categorySlug: string;
    categoryAccent: string;
    thumbnailUrl: string | null;
};

const DAY = 24 * 60 * 60 * 1000;

const issuedFormat = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
});

const certificateSelect = {
    id: true,
    serial: true,
    publicSlug: true,
    grade: true,
    scorePercent: true,
    issuedAt: true,
    user: { select: { name: true, email: true } },
    course: {
        select: {
            title: true,
            thumbnailUrl: true,
            instructor: { select: { name: true } },
            category: { select: { slug: true, accentColor: true } },
        },
    },
} as const;

async function longestStreak(userId: string): Promise<number> {
    const rows = await db.$queryRaw<{ day: Date }[]>`
    SELECT DISTINCT date_trunc('day', lp."completedAt" AT TIME ZONE 'UTC') AS day
    FROM "lesson_progress" lp
    JOIN "enrollment" e ON e.id = lp."enrollmentId"
    WHERE e."userId" = ${userId} AND lp."completedAt" IS NOT NULL
    ORDER BY 1
  `;
    if (rows.length === 0) return 0;

    const days = rows.map((row) =>
        Date.UTC(row.day.getFullYear(), row.day.getMonth(), row.day.getDate()),
    );

    let longest = 1;
    let run = 1;
    for (let index = 1; index < days.length; index += 1) {
        run = days[index]! - days[index - 1]! === DAY ? run + 1 : 1;
        if (run > longest) longest = run;
    }
    return longest;
}

export async function getCertificatesPage(
    page: number,
): Promise<CertificatesPage | null> {
    const session = await getSession();
    if (!session) return null;

    const userId = session.user.id;
    const where = { userId };

    const [total, hours, streakDays] = await Promise.all([
        db.certificate.count({ where }),
        db.course.aggregate({
            where: { certificates: { some: { userId } } },
            _sum: { totalDurationMinutes: true },
        }),
        longestStreak(userId),
    ]);

    const pageCount = Math.max(1, Math.ceil(total / CERTIFICATES_PAGE_SIZE));
    const current = Math.min(Math.max(1, page), pageCount);

    const rows = await db.certificate.findMany({
        where,
        orderBy: [{ issuedAt: "desc" }, { id: "asc" }],
        skip: (current - 1) * CERTIFICATES_PAGE_SIZE,
        take: CERTIFICATES_PAGE_SIZE,
        select: certificateSelect,
    });

    return {
        rows: rows.map((row) => ({
            ...toPublic(row),
            id: row.id,
        })),
        stats: {
            earned: total,
            hours: Math.round((hours._sum.totalDurationMinutes ?? 0) / 60),
            streakDays,
        },
        total,
        page: current,
        pageCount,
    };
}

export async function getPublicCertificate(
    slug: string,
): Promise<PublicCertificate | null> {
    const row = await db.certificate.findUnique({
        where: { publicSlug: slug },
        select: certificateSelect,
    });
    if (!row) return null;

    return toPublic(row);
}

function toPublic(
    row: Prisma.CertificateGetPayload<{ select: typeof certificateSelect }>,
): PublicCertificate {
    return {
        serial: row.serial,
        publicSlug: row.publicSlug,
        holderName: row.user.name?.trim() || row.user.email,
        courseTitle: row.course.title,
        instructorName: row.course.instructor.name,
        issuedOn: issuedFormat.format(row.issuedAt),
        issuedYear: row.issuedAt.getUTCFullYear(),
        issuedMonth: row.issuedAt.getUTCMonth() + 1,
        grade: row.grade,
        scorePercent: row.scorePercent,
        categorySlug: row.course.category.slug,
        categoryAccent: row.course.category.accentColor,
        thumbnailUrl: row.course.thumbnailUrl,
    };
}
