import { AwardIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { CertificateActions } from "@/components/dashboard/certificates/certificate-actions";
import { CourseArt } from "@/components/dashboard/course-art";
import {
    CERTIFICATE_ISSUER,
    certificatesCopy,
} from "@/lib/config/certificates";
import type { CertificateRow } from "@/lib/certificates";

function CertificateCard({ row }: { row: CertificateRow }) {
    return (
        <Card className="gap-0 overflow-hidden p-0 ring-border [--card-spacing:0px]">
            <div className="relative h-37.25 overflow-hidden">
                <CourseArt
                    thumbnailUrl={row.thumbnailUrl}
                    categorySlug={row.categorySlug}
                    categoryAccent={row.categoryAccent}
                    className="absolute inset-0 h-full w-full"
                    iconClassName="size-28 justify-self-end pr-7"
                />
                <div
                    aria-hidden
                    className="absolute inset-0 bg-linear-to-t from-black/25 to-black/5"
                />

                <div className="relative flex h-full flex-col p-6.5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/20">
                                <AwardIcon className="size-4 text-white" />
                            </span>
                            <span className="text-[13px] font-bold tracking-[0.14em] text-white uppercase">
                                {CERTIFICATE_ISSUER}
                            </span>
                        </div>
                        {row.grade ? (
                            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/20 text-[14px] font-semibold text-white">
                                {row.grade}
                            </span>
                        ) : null}
                    </div>

                    <div className="mt-auto">
                        <p className="text-[13px] font-semibold tracking-[0.12em] text-white/80 uppercase">
                            {certificatesCopy.ofCompletion}
                        </p>
                        <h3 className="mt-1.5 line-clamp-1 text-2xl font-bold text-white">
                            {row.courseTitle}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="p-6.5">
                <div className="flex items-start justify-between gap-6">
                    <div className="min-w-0">
                        <p className="text-[12px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
                            {certificatesCopy.instructor}
                        </p>
                        <p className="mt-1.5 truncate text-base font-semibold">
                            {row.instructorName}
                        </p>
                    </div>
                    <div className="shrink-0 text-right">
                        <p className="text-[12px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
                            {certificatesCopy.issued}
                        </p>
                        <p className="mt-1.5 text-base font-semibold">
                            {row.issuedOn}
                        </p>
                    </div>
                </div>

                <div className="mt-5 border-t border-border-subtle pt-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <p className="min-w-0 text-[15px]">
                            <span className="text-muted-foreground">
                                {certificatesCopy.idLabel}{" "}
                            </span>
                            <span className="font-mono tracking-tight">
                                {row.serial}
                            </span>
                        </p>
                        <CertificateActions row={row} />
                    </div>
                </div>
            </div>
        </Card>
    );
}

export { CertificateCard };
