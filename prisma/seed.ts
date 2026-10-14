import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const db = new PrismaClient({
    adapter: new PrismaPg({
        connectionString:
            process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
    }),
});

const SEED = "seed_";
const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date();

const REVENUE_SHARE_BPS = 7000;

const UPTIME_DAYS = 90;

async function clearSeededRows() {
    const seeded = { id: { startsWith: SEED } };

    await db.instructorFollow.deleteMany({ where: seeded });
    await db.notification.deleteMany({ where: seeded });
    await db.promotion.deleteMany({ where: seeded });
    await db.contentReport.deleteMany({ where: seeded });
    await db.communityTopic.deleteMany({ where: seeded });
    await db.conversation.deleteMany({ where: seeded });
    await db.auditLog.deleteMany({ where: seeded });
    await db.refund.deleteMany({ where: seeded });
    await db.instructorEarning.deleteMany({ where: seeded });
    await db.payout.deleteMany({ where: seeded });
    await db.payoutRun.deleteMany({ where: seeded });
    await db.payoutMethod.deleteMany({ where: seeded });
    await db.subscription.deleteMany({ where: seeded });
    await db.certificate.deleteMany({ where: seeded });
    await db.user.deleteMany({ where: seeded });
    await db.courseQuestion.deleteMany({ where: seeded });
    await db.coupon.deleteMany({ where: seeded });
    await db.course.deleteMany({ where: seeded });
    await db.instructor.deleteMany({ where: seeded });
    await db.uptimeSample.deleteMany({});
}

async function seedPlatformSettings() {
    await db.platformSetting.upsert({
        where: { id: "singleton" },
        update: {},
        create: { id: "singleton", defaultRevenueShareBps: REVENUE_SHARE_BPS },
    });
}

async function checkCategories(): Promise<number> {
    const rows = await db.category.findMany({ select: { id: true } });
    if (rows.length === 0) {
        console.warn(
            "\n  No categories exist yet.\n" +
                "  A course cannot be created without one — add them at\n" +
                "  /dashboard/admin/categories before an instructor starts.\n",
        );
    }
    return rows.length;
}

async function seedUptime() {
    const CHECKS_PER_DAY = 1440;
    const failures = new Map<number, number>([
        [6, 5],
        [19, 4],
        [33, 21],
        [41, 12],
        [48, 9],
        [55, 10],
        [67, 14],
        [78, 7],
    ]);

    await db.uptimeSample.createMany({
        data: Array.from({ length: UPTIME_DAYS }, (_, index) => {
            const daysAgo = index + 1;
            const day = new Date(NOW.getTime() - daysAgo * DAY);
            day.setUTCHours(0, 0, 0, 0);
            return {
                id: `${SEED}up_${day.toISOString().slice(0, 10)}`,
                day,
                checksTotal: CHECKS_PER_DAY,
                checksOk: CHECKS_PER_DAY - (failures.get(daysAgo) ?? 0),
            };
        }),
    });
}

async function main() {
    console.log("Clearing previously seeded rows…");
    await clearSeededRows();

    await seedPlatformSettings();
    const categories = await checkCategories();
    await seedUptime();

    console.log(
        [
            "",
            "Seeded platform scaffolding only:",
            `  categories        ${categories} (read, never written)`,
            "  platform settings 1",
            `  uptime samples    ${UPTIME_DAYS}`,
            "",
            "Everything else — courses, accounts, orders, enrolments, notifications,",
            "certificates — is now created by using the application.",
            "",
        ].join("\n"),
    );
}

main()
    .catch(async (error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await db.$disconnect();
    });
