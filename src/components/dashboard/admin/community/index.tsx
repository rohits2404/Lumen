import { CommunityBoard } from "@/components/dashboard/admin/community/community-board";
import { CommunityStats } from "@/components/dashboard/admin/community/community-stats";
import {
    getCommunityStats,
    getModerators,
    getTopics,
    type CommunityQuery,
} from "@/lib/admin/community";

async function CommunityPage({ query }: { query: CommunityQuery }) {
    const [stats, topics] = await Promise.all([
        getCommunityStats(),
        getTopics(),
    ]);
    const moderators = await getModerators(
        query,
        topics.map((topic) => topic.id),
    );

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <CommunityBoard
                topics={topics}
                moderators={moderators.rows}
                page={moderators.page}
                pageCount={moderators.pageCount}
                total={moderators.total}
            >
                <CommunityStats stats={stats} />
            </CommunityBoard>
        </main>
    );
}

export { CommunityPage };
