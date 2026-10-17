import { cache } from "react";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { longAgo } from "@/lib/relative-time";
import { getInstructorProfile } from "@/lib/instructor";
import { hasBeenLive } from "@/lib/config/instructor-courses";
import type { CourseStatus } from "@/generated/prisma/client";
import { ActivityKind } from "./types/instructor-course-manage";

export type ManageFacts = {
    sections: number;
    lessons: number;
    quizzes: number;
    students: number;
    unansweredQuestions: number;
    unrepliedReviews: number;
    activeCoupons: number;
};

export type ActivityItem = {
    id: string;
    kind: ActivityKind;
    text: string;
    when: string;
};

export type ManageCoursePage = {
    id: string;
    slug: string;
    title: string;
    status: CourseStatus;
    categorySlug: string;
    categoryAccent: string;
    thumbnailUrl: string | null;
    stats: {
        students: number;
        rating: number | null;
        revenueCents: number;
        lessons: number;
    };
    facts: ManageFacts;
    quizLessonIds: string[];
    health: {
        completion: number | null;
        watchTime: number | null;
        quizPass: number | null;
    };
    activity: ActivityItem[];
};

export const getManageCoursePage = cache(async function getManageCoursePage(
    slug: string,
): Promise<ManageCoursePage | null> {
    const session = await getSession();
    if (!session) return null;

    const profile = await getInstructorProfile(session.user.id);
    if (!profile) return null;

    const course = await db.course.findFirst({
        where: { slug, instructorId: profile.id },
        select: {
            id: true,
            slug: true,
            title: true,
            status: true,
            thumbnailUrl: true,
            lessonCount: true,
            enrollmentCount: true,
            rating: true,
            reviewsCount: true,
            category: { select: { slug: true, accentColor: true } },
        },
    });
    if (!course || !hasBeenLive(course.status)) return null;

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
        sections,
        quizzes,
        enrolmentAgg,
        completed,
        quizAttempts,
        quizPassed,
        unansweredQuestions,
        unrepliedReviews,
        activeCoupons,
        earnings,
        newEnrolments,
        recentReviews,
        recentQuestions,
    ] = await Promise.all([
        db.courseSection.count({ where: { courseId: course.id } }),
        db.courseLesson.findMany({
            where: { section: { courseId: course.id }, type: "QUIZ" },
            orderBy: [{ section: { order: "asc" } }, { order: "asc" }],
            select: { id: true },
        }),
        db.enrollment.aggregate({
            where: { courseId: course.id },
            _count: { _all: true },
            _avg: { progressPercent: true },
        }),
        db.enrollment.count({
            where: { courseId: course.id, completedAt: { not: null } },
        }),
        db.quizAttempt.count({
            where: {
                enrollment: { courseId: course.id },
                submittedAt: { not: null },
            },
        }),
        db.quizAttempt.count({
            where: {
                enrollment: { courseId: course.id },
                submittedAt: { not: null },
                passed: true,
            },
        }),
        db.courseQuestion.count({
            where: { courseId: course.id, answeredByInstructor: false },
        }),
        db.courseReview.count({
            where: {
                courseId: course.id,
                status: "VISIBLE",
                deletedAt: null,
                reply: null,
            },
        }),
        db.coupon.count({
            where: {
                courseId: course.id,
                startsAt: { lte: now },
                OR: [{ endsAt: null }, { endsAt: { gte: now } }],
            },
        }),
        db.instructorEarning.aggregate({
            where: {
                instructorId: profile.id,
                courseId: course.id,
                status: { not: "REVERSED" },
            },
            _sum: { netCents: true },
        }),
        db.enrollment.count({
            where: { courseId: course.id, createdAt: { gte: dayAgo } },
        }),
        db.courseReview.findMany({
            where: { courseId: course.id, status: "VISIBLE", deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 3,
            select: {
                id: true,
                rating: true,
                createdAt: true,
                user: { select: { name: true } },
            },
        }),
        db.courseQuestion.findMany({
            where: { courseId: course.id },
            orderBy: { createdAt: "desc" },
            take: 3,
            select: {
                id: true,
                createdAt: true,
                author: { select: { name: true } },
                lesson: { select: { title: true, order: true } },
            },
        }),
    ]);

    const weekEarnings = await db.instructorEarning.aggregate({
        where: {
            instructorId: profile.id,
            courseId: course.id,
            status: { not: "REVERSED" },
            createdAt: { gte: weekAgo },
        },
        _sum: { netCents: true },
    });

    const enrolled = enrolmentAgg._count._all;

    const activity: { at: Date; item: ActivityItem }[] = [];

    if (newEnrolments > 0) {
        activity.push({
            at: now,
            item: {
                id: "enrolments",
                kind: "enrolment",
                text: `${newEnrolments} new ${newEnrolments === 1 ? "enrolment" : "enrolments"}`,
                when: "Today",
            },
        });
    }

    for (const review of recentReviews) {
        activity.push({
            at: review.createdAt,
            item: {
                id: `review-${review.id}`,
                kind: "review",
                text: `${firstNameLast(review.user.name)} left a ${review.rating}★ review`,
                when: longAgo(review.createdAt, now),
            },
        });
    }

    for (const question of recentQuestions) {
        const where = question.lesson
            ? `lesson ${question.lesson.order + 1}`
            : "this course";
        activity.push({
            at: question.createdAt,
            item: {
                id: `question-${question.id}`,
                kind: "question",
                text: `${firstNameLast(question.author.name)} asked about ${where}`,
                when: longAgo(question.createdAt, now),
            },
        });
    }

    const weekCents = weekEarnings._sum.netCents ?? 0;
    if (weekCents > 0) {
        activity.push({
            at: weekAgo,
            item: {
                id: "earnings",
                kind: "earning",
                text: `${formatMoneyWhole(weekCents)} earned this week`,
                when: "Last 7 days",
            },
        });
    }

    activity.sort((a, b) => b.at.getTime() - a.at.getTime());

    return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        status: course.status,
        categorySlug: course.category.slug,
        categoryAccent: course.category.accentColor,
        thumbnailUrl: course.thumbnailUrl,
        stats: {
            students: course.enrollmentCount,
            rating: course.reviewsCount > 0 ? course.rating : null,
            revenueCents: earnings._sum.netCents ?? 0,
            lessons: course.lessonCount,
        },
        quizLessonIds: quizzes.map((lesson) => lesson.id),
        facts: {
            sections,
            lessons: course.lessonCount,
            quizzes: quizzes.length,
            students: course.enrollmentCount,
            unansweredQuestions,
            unrepliedReviews,
            activeCoupons,
        },
        health: {
            completion:
                enrolled === 0
                    ? null
                    : Math.round((completed / enrolled) * 100),
            watchTime:
                enrolmentAgg._avg.progressPercent === null
                    ? null
                    : Math.round(enrolmentAgg._avg.progressPercent),
            quizPass:
                quizAttempts === 0
                    ? null
                    : Math.round((quizPassed / quizAttempts) * 100),
        },
        activity: activity.slice(0, 5).map((entry) => entry.item),
    };
});

function firstNameLast(name: string): string {
    return name.trim() || "A learner";
}

function formatMoneyWhole(cents: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(Math.round(cents / 100));
}
