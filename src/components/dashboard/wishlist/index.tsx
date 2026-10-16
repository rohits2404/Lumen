"use client";

import * as React from "react";
import Link from "next/link";
import { HeartIcon, LayoutGridIcon, Rows3Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AddAllToCartButton } from "./wishlist-actions";
import type { WishlistEntry } from "./wishlist-course";
import { WishlistRow } from "./wishlist-row";
import { WishlistTile } from "./wishlist-tile";
import { cn } from "@/lib/utils";

const wishlistViews = [
    { value: "list", label: "List View", icon: Rows3Icon, perPage: 4 },
    { value: "grid", label: "Grid View", icon: LayoutGridIcon, perPage: 8 },
] as const;

type WishlistView = (typeof wishlistViews)[number]["value"];

function Wishlist({
    entries,
    total,
}: {
    entries: WishlistEntry[];
    total: number;
}) {
    const [view, setView] = React.useState<WishlistView>("list");
    const [page, setPage] = React.useState(1);

    const count = entries.length;
    const perPage = (
        wishlistViews.find((option) => option.value === view) ??
        wishlistViews[0]
    ).perPage;

    const pageCount = Math.max(1, Math.ceil(count / perPage));
    const safePage = Math.min(page, pageCount);
    const start = (safePage - 1) * perPage;
    const visible = entries.slice(start, start + perPage);

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-[26px] leading-none font-bold">
                        Wishlist
                    </h1>
                    <p className="mt-2.5 text-[15px] text-muted-foreground">
                        {count === 0
                            ? "Nothing Saved Yet"
                            : `${count} Course${count === 1 ? "" : "s"} Saved · $${total.toFixed(2)} Total If You Enroll Today`}
                    </p>
                </div>

                {count > 0 ? (
                    <div className="flex items-center gap-3">
                        <ToggleGroup
                            spacing={0.75}
                            value={[view]}
                            onValueChange={(value: string[]) => {
                                setView(
                                    (current) =>
                                        (value[0] as WishlistView) ?? current,
                                );
                                setPage(1);
                            }}
                            aria-label="Wishlist layout"
                            className="bg-track p-0.75"
                        >
                            {wishlistViews.map((option) => (
                                <ToggleGroupItem
                                    key={option.value}
                                    value={option.value}
                                    aria-label={option.label}
                                    className="size-9.5 rounded-lg px-0 text-muted-foreground hover:bg-transparent hover:text-foreground aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-sm aria-pressed:hover:bg-card"
                                >
                                    <option.icon className="size-4.5" />
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>

                        <AddAllToCartButton />
                    </div>
                ) : null}
            </div>

            {count === 0 ? (
                <Empty className="mt-6 rounded-xl border bg-card py-16">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <HeartIcon />
                        </EmptyMedia>
                        <EmptyTitle>No Saved Courses Yet</EmptyTitle>
                        <EmptyDescription>
                            Tap The Heart On Any Course And It Will Wait For You
                            Here.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button
                            nativeButton={false}
                            render={<Link href="/dashboard/courses" />}
                        >
                            Browse Courses
                        </Button>
                    </EmptyContent>
                </Empty>
            ) : view === "list" ? (
                <div className="mt-6 flex flex-col gap-4">
                    {visible.map((entry) => (
                        <WishlistRow key={entry.id} course={entry.course} />
                    ))}
                </div>
            ) : (
                <div className="mt-6 grid gap-4.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {visible.map((entry) => (
                        <WishlistTile key={entry.id} course={entry.course} />
                    ))}
                </div>
            )}

            {count > 0 ? (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {start + 1}–{Math.min(start + perPage, count)}{" "}
                        Of {count} Saved Course{count === 1 ? "" : "s"}
                    </p>
                    <Pagination className="mx-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    className={cn(
                                        "bg-card",
                                        safePage <= 1 &&
                                            "pointer-events-none opacity-50",
                                    )}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        setPage((current) =>
                                            Math.max(1, current - 1),
                                        );
                                    }}
                                />
                            </PaginationItem>
                            {Array.from(
                                { length: pageCount },
                                (_, index) => index + 1,
                            ).map((pageNumber) => (
                                <PaginationItem key={pageNumber}>
                                    <PaginationLink
                                        isActive={pageNumber === safePage}
                                        className={cn(
                                            pageNumber === safePage
                                                ? "border-transparent! bg-primary! text-primary-foreground! hover:bg-primary/80! hover:text-white!"
                                                : "bg-card",
                                        )}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            setPage(pageNumber);
                                        }}
                                    >
                                        {pageNumber}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    className={cn(
                                        "bg-card",
                                        safePage >= pageCount &&
                                            "pointer-events-none opacity-50",
                                    )}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        setPage((current) =>
                                            Math.min(pageCount, current + 1),
                                        );
                                    }}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            ) : null}
        </div>
    );
}

export { Wishlist };
