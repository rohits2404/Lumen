import { PastPromotionsTable } from "@/components/dashboard/admin/promotions/past-promotions-table";
import {
    PromotionsBoard,
    type ParticipationCardRow,
    type PromotionCardRow,
} from "@/components/dashboard/admin/promotions/promotions-board";
import {
    compactMoney,
    discountLabel,
    formatCount,
    formatPromotionDay,
    scopeLabel,
    toDayValue,
} from "@/components/dashboard/admin/promotions/promotions-format";
import { initialsOf } from "@/lib/config/instructor-profiles";
import {
    getActivePromotions,
    getInstructorParticipation,
    getPastPromotions,
    getPromotionCategories,
    type ActivePromotion,
    type PromotionsQuery,
} from "@/lib/admin/promotions";

function metaFor(promotion: ActivePromotion) {
    const parts = [
        discountLabel(promotion.discountType, promotion.value),
        scopeLabel(promotion.scope, promotion.categoryNames),
    ];
    if (promotion.state === "LIVE") {
        parts.push(`Ends ${formatPromotionDay(promotion.endsAt)}`);
        parts.push(
            `${formatCount(promotion.redemptionCount)} ${
                promotion.redemptionCount === 1 ? "redemption" : "redemptions"
            }`,
        );
    } else {
        parts.push(`Starts ${formatPromotionDay(promotion.startsAt)}`);
        parts.push(`ends ${formatPromotionDay(promotion.endsAt)}`);
    }
    return parts.join(" · ");
}

async function PromotionsPage({ query }: { query: PromotionsQuery }) {
    const now = new Date();
    const [active, past, participation, categories] = await Promise.all([
        getActivePromotions(now),
        getPastPromotions(now),
        getInstructorParticipation(query),
        getPromotionCategories(),
    ]);

    const cards: PromotionCardRow[] = active.map((promotion) => ({
        id: promotion.id,
        name: promotion.name,
        live: promotion.state === "LIVE",
        meta: metaFor(promotion),
        redemptions: formatCount(promotion.redemptionCount),
        revenue: compactMoney(promotion.revenueCents),
        coursesIncluded: formatCount(promotion.coursesIncluded),
        coursesOptedOut: formatCount(promotion.coursesOptedOut),
        form: {
            name: promotion.name,
            discountType: promotion.discountType,
            value: promotion.value,
            scope: promotion.scope,
            categoryIds: promotion.categoryIds,
            startsOn: toDayValue(promotion.startsAt),
            endsOn: toDayValue(promotion.endsAt),
            forceOnAllCourses: promotion.forceOnAllCourses,
        },
    }));

    const rows: ParticipationCardRow[] = participation.rows.map((row) => ({
        ...row,
        initials: initialsOf(row.name),
    }));

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <PromotionsBoard
                active={cards}
                participation={rows}
                categories={categories}
                page={participation.page}
                pageCount={participation.pageCount}
                total={participation.total}
            >
                <PastPromotionsTable rows={past} />
            </PromotionsBoard>
        </main>
    );
}

export { PromotionsPage };
