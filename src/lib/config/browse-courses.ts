import {
    BrainCircuitIcon,
    BriefcaseIcon,
    Code2Icon,
    LineChartIcon,
    MegaphoneIcon,
    PaletteIcon,
    type LucideIcon,
} from "lucide-react";

export const browseCourseCategories = [
    "All",
    "Web Dev",
    "Design",
    "Data & AI",
    "Business",
    "Marketing",
    "Finance",
] as const;

export type BrowseCourseCategory = Exclude<
    (typeof browseCourseCategories)[number],
    "All"
>;

export const courseLevels = [
    "Beginner",
    "Intermediate",
    "Advanced",
    "All Levels",
] as const;

export type CourseLevel = (typeof courseLevels)[number];

export const categoryIcons: Record<BrowseCourseCategory, LucideIcon> = {
    "Web Dev": Code2Icon,
    Design: PaletteIcon,
    "Data & AI": BrainCircuitIcon,
    Business: BriefcaseIcon,
    Marketing: MegaphoneIcon,
    Finance: LineChartIcon,
};

export type BrowseCourse = {
    id: number;
    slug: string;
    title: string;
    instructor: string;
    category: BrowseCourseCategory;
    level: CourseLevel;
    durationHours: number;
    rating: number;
    reviews: number;
    price: number;
    listPrice: number;
    art: string;
    icon: LucideIcon;
};

export const COURSES_PER_PAGE = 8;

export const priceFilters = [
    { value: "any", label: "Any price" },
    { value: "under-15", label: "Under $15" },
    { value: "15-17", label: "$15 – $17" },
    { value: "over-17", label: "$17+" },
] as const;

export type PriceFilter = (typeof priceFilters)[number]["value"];

export const levelFilters = [
    { value: "any", label: "Any level" },
    ...courseLevels.map((level) => ({ value: level, label: level })),
] as const;

export type LevelFilterValue = (typeof levelFilters)[number]["value"];

export const ratingFilters = [
    { value: "any", label: "Any Rating" },
    { value: "4.5", label: "4.5 & Up" },
    { value: "4.0", label: "4.0 & Up" },
    { value: "3.5", label: "3.5 & Up" },
] as const;

export type RatingFilterValue = (typeof ratingFilters)[number]["value"];

export const sortOptions = [
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Highest Rated" },
    { value: "newest", label: "Newest" },
    { value: "price-asc", label: "Price: Low To High" },
    { value: "price-desc", label: "Price: High To Low" },
] as const;

export type SortOption = (typeof sortOptions)[number]["value"];
