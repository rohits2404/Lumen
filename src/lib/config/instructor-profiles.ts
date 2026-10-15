import {
    type BrowseCourse,
    type BrowseCourseCategory,
} from "@/lib/config/browse-courses";

export type InstructorReview = {
    name: string;
    avatarUrl?: string;
    rating: number;
    timeAgo: string;
    body: string;
};

export type InstructorProfile = {
    slug: string;
    name: string;
    title: string;
    avatarUrl?: string;
    teachingSince: number;
    rating: number;
    reviewsCount: number;
    studentsCount: number;
    about: string[];
    skills: string[];
    reviews: InstructorReview[];
    courses: BrowseCourse[];
};

export type ProfileCourse = {
    slug: string;
    title: string;
    categoryLabel: string;
    art: string;
    glyph:
        | { from: "catalog"; category: BrowseCourseCategory }
        | { from: "database"; categorySlug: string };
    thumbnailUrl: string | null;
    rating: number;
    reviews: number;
    durationHours: number;
    price: number;
    listPrice: number;
    href: string;
};

export type PublicInstructorProfile = Omit<InstructorProfile, "courses"> & {
    courses: ProfileCourse[];
};

export function instructorSlug(name: string) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

const NAME_TITLES = new Set([
    "dr",
    "dr.",
    "mr",
    "mr.",
    "mrs",
    "mrs.",
    "ms",
    "ms.",
    "prof",
    "prof.",
]);

export function firstNameOf(fullName: string) {
    const parts = fullName.split(" ").filter(Boolean);
    const index = parts.findIndex(
        (part) => !NAME_TITLES.has(part.toLowerCase()),
    );
    return parts[index === -1 ? 0 : index] ?? fullName;
}

export function initialsOf(fullName: string) {
    const parts = fullName.split(" ").filter(Boolean);
    const first = firstNameOf(fullName);
    const last = parts[parts.length - 1];
    const secondInitial = last && last !== first ? (last[0] ?? "") : "";
    return `${first[0] ?? ""}${secondInitial}`.toUpperCase();
}
