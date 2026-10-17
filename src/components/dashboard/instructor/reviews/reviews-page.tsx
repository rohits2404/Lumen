import { RatingByCourseCard } from "@/components/dashboard/instructor/reviews/rating-by-course-card";
import { RatingSummaryCard } from "@/components/dashboard/instructor/reviews/rating-summary-card";
import { ReviewsBoard } from "@/components/dashboard/instructor/reviews/reviews-board";
import { reviewsCopy } from "@/lib/config/instructor-reviews";
import type { ReviewsPage as ReviewsPageData } from "@/lib/instructor-reviews";

function ReviewsPage({ page }: { page: ReviewsPageData }) {
    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <div className="min-w-0">
                <h1 className="text-[32px] leading-none font-bold">
                    {reviewsCopy.title}
                </h1>
                <p className="mt-2.5 text-[15px] text-muted-foreground">
                    {reviewsCopy.description}
                </p>
            </div>

            <div className="mt-6 grid items-stretch gap-4 lg:grid-cols-2">
                <RatingSummaryCard summary={page.summary} />
                <RatingByCourseCard rows={page.byCourse} />
            </div>

            <ReviewsBoard page={page} />
        </main>
    );
}

export { ReviewsPage };
