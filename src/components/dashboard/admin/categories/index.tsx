import { getCategoriesPage } from "@/lib/admin/categories";
import { CategoriesList } from "./categories-list";

async function CategoriesPage() {
    const page = await getCategoriesPage();

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <CategoriesList rows={page.rows} />
        </main>
    );
}

export { CategoriesPage };
