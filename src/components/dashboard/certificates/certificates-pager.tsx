"use client";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { certificatesCopy } from "@/lib/config/certificates";
import { cn } from "@/lib/utils";

function CertificatesPager({
    from,
    to,
    total,
    page,
    pageCount,
    basePath,
}: {
    from: number;
    to: number;
    total: number;
    page: number;
    pageCount: number;
    basePath: string;
}) {
    const hrefFor = (next: number) =>
        next <= 1 ? basePath : `${basePath}?page=${next}`;

    return (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <p className="text-[13px] text-muted-foreground">
                {certificatesCopy.showing(from, to, total)}
            </p>
            {pageCount > 1 ? (
                <Pagination className="mx-0 w-auto justify-end">
                    <PaginationContent className="gap-2">
                        <PaginationItem>
                            <PaginationPrevious
                                href={hrefFor(page - 1)}
                                aria-disabled={page <= 1}
                                className={cn(
                                    "h-9",
                                    page <= 1 &&
                                        "pointer-events-none opacity-50",
                                )}
                            />
                        </PaginationItem>
                        {Array.from(
                            { length: Math.min(pageCount, 6) },
                            (_, index) => (
                                <PaginationItem key={index}>
                                    <PaginationLink
                                        href={hrefFor(index + 1)}
                                        isActive={index + 1 === page}
                                        className={cn(
                                            "size-9",
                                            index + 1 === page &&
                                                "bg-primary! text-primary-foreground!",
                                        )}
                                    >
                                        {index + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ),
                        )}
                        <PaginationItem>
                            <PaginationNext
                                href={hrefFor(page + 1)}
                                aria-disabled={page >= pageCount}
                                className={cn(
                                    "h-9",
                                    page >= pageCount &&
                                        "pointer-events-none opacity-50",
                                )}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            ) : null}
        </div>
    );
}

export { CertificatesPager };
