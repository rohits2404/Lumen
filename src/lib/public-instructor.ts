import { cache } from "react";

import { db } from "@/lib/db";
import {
    categoryGradients,
    FALLBACK_CATEGORY_GRADIENT,
} from "@/lib/config/admin-overview";
import {
    type InstructorReview,
    type ProfileCourse,
    type PublicInstructorProfile,
} from "@/lib/config/instructor-profiles";
import { longAgo } from "@/lib/relative-time";

const REVIEW_LIMIT = 2;

export const getPublicInstructor = cache(async function getPublicInstructor(
    slug: string,
): Promise<PublicInstructorProfile | null> {
    return buildFromDatabase(slug);
});

async function buildFromDatabase(
    slug: string,
): Promise<PublicInstructorProfile | null> {
    const instructor = await db.instructor.findUnique({
        where: { slug },
        select: {
            id: true,
            slug: true,
            name: true,
            title: true,
            bio: true,
            about: true,
            skills: true,
            imageUrl: true,
            teachingSince: true,
            user: { select: { image: true } },
            courses: {
                where: { status: "PUBLISHED" },
                orderBy: [{ enrollmentCount: "desc" }, { title: "asc" }],
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    rating: true,
                    reviewsCount: true,
                    enrollmentCount: true,
                    durationHours: true,
                    priceCents: true,
                    listPriceCents: true,
                    thumbnailUrl: true,
                    category: {
                        select: { name: true, slug: true, accentColor: true },
                    },
                },
            },
        },
    });
    if (!instructor) return null;

    const courses = instructor.courses;
    const reviews = courses.length
        ? await db.courseReview.findMany({
              where: {
                  courseId: { in: courses.map((course) => course.id) },
                  status: "VISIBLE",
                  deletedAt: null,
              },
              orderBy: { createdAt: "desc" },
              take: REVIEW_LIMIT,
              select: {
                  id: true,
                  rating: true,
                  body: true,
                  createdAt: true,
                  user: { select: { name: true, image: true } },
              },
          })
        : [];

    const reviewsCount = courses.reduce(
        (sum, row) => sum + row.reviewsCount,
        0,
    );
    const weightedRating =
        reviewsCount === 0
            ? 0
            : courses.reduce(
                  (sum, row) => sum + row.rating * row.reviewsCount,
                  0,
              ) / reviewsCount;
    const now = new Date();

    return {
        slug: instructor.slug,
        name: instructor.name,
        title: instructor.title,
        avatarUrl: instructor.imageUrl ?? instructor.user?.image ?? undefined,
        teachingSince: instructor.teachingSince,
        rating: Math.round(weightedRating * 10) / 10,
        reviewsCount,
        studentsCount: courses.reduce(
            (sum, row) => sum + row.enrollmentCount,
            0,
        ),
        about:
            instructor.about.length > 0
                ? instructor.about
                : instructor.bio.trim() !== ""
                  ? [instructor.bio.trim()]
                  : [],
        skills: instructor.skills,
        reviews: reviews.map<InstructorReview>((review) => ({
            name: review.user.name,
            avatarUrl: review.user.image ?? undefined,
            rating: review.rating,
            timeAgo: longAgo(review.createdAt, now),
            body: review.body,
        })),
        courses: courses.map<ProfileCourse>((course) => ({
            slug: course.slug,
            title: course.title,
            categoryLabel: course.category.name,
            art:
                categoryGradients[course.category.accentColor] ??
                FALLBACK_CATEGORY_GRADIENT,
            glyph: { from: "database", categorySlug: course.category.slug },
            thumbnailUrl: course.thumbnailUrl,
            rating: course.rating,
            reviews: course.reviewsCount,
            durationHours: course.durationHours,
            price: course.priceCents / 100,
            listPrice: course.listPriceCents / 100,
            href: `/dashboard/courses/${course.slug}`,
        })),
    };
}
