import { WishlistLine } from "@/lib/cart";
import { CatalogCourse } from "@/lib/config/catalog-shape";

export type WishlistCourse = CatalogCourse;

export type WishlistEntry = {
    id: string;
    course: WishlistCourse;
};

export function toWishlistEntries(lines: WishlistLine[]): WishlistEntry[] {
    return lines.map(({ id, course }) => ({ id, course }));
}
