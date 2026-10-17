export const adminCategoriesCopy = {
    title: "Categories",
    description:
        "How The Catalog Is Organised, And Where Demand Actually Sits.",
    newLabel: "New Category",
    emptyTitle: "No Categories Yet",
    emptyDescription:
        "Categories Are How Learners Browse The Catalog And How Instructors File A Course. Add The First One To Get Started.",
    courses: (count: number) =>
        `${count.toLocaleString("en-US")} ${count === 1 ? "Course" : "Courses"}`,
    students: (count: number) =>
        `${count.toLocaleString("en-US")} ${count === 1 ? "Student" : "Students"}`,
    edit: "Edit Category",
    delete: "Delete Category",
    deleteBlockedByCourses: (count: number) =>
        `${count.toLocaleString("en-US")} ${
            count === 1 ? "Course Is" : "Courses Are"
        } Still Filed Under This Category`,
    deleteBlockedByChildren: (count: number) =>
        `${count} Sub-Categor${count === 1 ? "y Rolls" : "ies Roll"} Up Into This One`,
} as const;

export const CATEGORY_ACCENTS = [
    "blue",
    "violet",
    "cyan",
    "green",
    "amber",
    "red",
] as const;

export type CategoryAccent = (typeof CATEGORY_ACCENTS)[number];

export const FALLBACK_CATEGORY_ACCENT: CategoryAccent = "blue";

export function isCategoryAccent(value: unknown): value is CategoryAccent {
    return (
        typeof value === "string" &&
        (CATEGORY_ACCENTS as readonly string[]).includes(value)
    );
}

export function categoryAccent(value: string): CategoryAccent {
    return isCategoryAccent(value) ? value : FALLBACK_CATEGORY_ACCENT;
}

export const categoryAccentClasses: Record<
    CategoryAccent,
    { tile: string; icon: string; swatch: string; bar: string }
> = {
    blue: {
        tile: "bg-accent-2/10",
        icon: "text-accent-2",
        swatch: "bg-accent-2",
        bar: "[&_[data-slot=progress-indicator]]:bg-accent-2",
    },
    violet: {
        tile: "bg-accent-1/10",
        icon: "text-accent-1",
        swatch: "bg-accent-1",
        bar: "[&_[data-slot=progress-indicator]]:bg-accent-1",
    },
    cyan: {
        tile: "bg-accent-3/10",
        icon: "text-accent-3",
        swatch: "bg-accent-3",
        bar: "[&_[data-slot=progress-indicator]]:bg-accent-3",
    },
    green: {
        tile: "bg-success/10",
        icon: "text-success",
        swatch: "bg-success",
        bar: "[&_[data-slot=progress-indicator]]:bg-success",
    },
    amber: {
        tile: "bg-star/10",
        icon: "text-star",
        swatch: "bg-star",
        bar: "[&_[data-slot=progress-indicator]]:bg-star",
    },
    red: {
        tile: "bg-destructive/10",
        icon: "text-destructive",
        swatch: "bg-destructive",
        bar: "[&_[data-slot=progress-indicator]]:bg-destructive",
    },
};

export const categoryAccentLabels: Record<CategoryAccent, string> = {
    blue: "Blue",
    violet: "Violet",
    cyan: "Cyan",
    green: "Green",
    amber: "Amber",
    red: "Red",
};

export const CATEGORY_NAME_MAX_LENGTH = 60;
export const CATEGORY_DESCRIPTION_MAX_LENGTH = 160;

export const categoryDialogCopy = {
    createTitle: "New Category",
    editTitle: "Edit Category",
    description:
        "Categories Shape How Learners Browse The Catalog And How Instructors Classify A Course.",
    nameLabel: "Name",
    namePlaceholder: "E.g. Photography",
    descriptionLabel: "Short Description",
    descriptionPlaceholder: "What Belongs In This Category?",
    accentLabel: "Accent Colour",
    navTitle: "Show In Main Navigation",
    navDescription: "Featured Categories Appear In The Browse Menu.",
    createSubmit: "Create Category",
    editSubmit: "Save Changes",
} as const;

export const deleteCategoryCopy = {
    title: "Delete Category?",
    description: (name: string) =>
        `${name} Will Be Removed From The Catalog. Nothing Else Changes, And This Cannot Be Undone.`,
    submit: "Delete Category",
} as const;
