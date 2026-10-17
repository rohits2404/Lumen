import { StudentsBoard } from "@/components/dashboard/instructor/students/students-board";
import { StudentsStats } from "@/components/dashboard/instructor/students/students-stats";
import type { StudentsPage as StudentsPageData } from "@/lib/instructor-students";

function StudentsPage({ page }: { page: StudentsPageData }) {
    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <StudentsBoard page={page}>
                <StudentsStats stats={page.stats} />
            </StudentsBoard>
        </main>
    );
}

export { StudentsPage };
