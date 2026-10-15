import type { CertificatesPage as CertificatesPageData } from "@/lib/certificates";
import {
    CERTIFICATES_PAGE_SIZE,
    certificatesCopy,
    certificateStats,
} from "@/lib/config/certificates";
import { CountCard } from "../count-card";
import { AwardIcon, ClockIcon, FlameIcon } from "lucide-react";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { CertificateCard } from "./certificate-card";
import { CertificatesPager } from "./certificates-pager";

function Certificates({ page }: { page: CertificatesPageData }) {
    const from =
        page.total === 0 ? 0 : (page.page - 1) * CERTIFICATES_PAGE_SIZE + 1;
    const to = from === 0 ? 0 : from + page.rows.length - 1;

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <div className="min-w-0">
                <h1 className="text-[32px] leading-none font-bold">
                    {certificatesCopy.title}
                </h1>
                <p className="mt-2.5 text-[15px] text-muted-foreground">
                    {certificatesCopy.description}
                </p>
            </div>
            <div className="mt-6 grid gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
                <CountCard
                    icon={AwardIcon}
                    value={page.stats.earned.toLocaleString("en-US")}
                    label={certificateStats.earned}
                />
                <CountCard
                    icon={ClockIcon}
                    value={page.stats.hours.toLocaleString("en-US")}
                    label={certificateStats.hours}
                />
                <CountCard
                    icon={FlameIcon}
                    value={`${page.stats.streakDays} d`}
                    label={certificateStats.streak}
                />
            </div>
            {page.total === 0 ? (
                <Empty className="mt-6 rounded-xl bg-card py-16 ring-1 ring-border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <AwardIcon />
                        </EmptyMedia>
                        <EmptyTitle>{certificatesCopy.empty.title}</EmptyTitle>
                        <EmptyDescription>
                            {certificatesCopy.empty.description}
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <>
                    <div className="mt-6 grid gap-4.5 xl:grid-cols-2">
                        {page.rows.map((row) => (
                            <CertificateCard key={row.id} row={row} />
                        ))}
                    </div>

                    <CertificatesPager
                        from={from}
                        to={to}
                        total={page.total}
                        page={page.page}
                        pageCount={page.pageCount}
                        basePath="/dashboard/certificates"
                    />
                </>
            )}
        </main>
    );
}

export { Certificates };
