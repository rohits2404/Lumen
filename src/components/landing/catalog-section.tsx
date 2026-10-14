import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { CatalogBrowser } from "./catalog-browser";
import { CatalogCourse } from "@/lib/config/catalog-shape";

async function CatalogSection({ className }: { className?: string }) {
    const courses: CatalogCourse[] = [];

    return (
        <section className={cn("w-full", className)}>
            <div className="mx-auto w-full max-w-300 px-6 py-12 md:py-20">
                <div className="flex flex-wrap items-start justify-between gap-6">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.14em] text-subtle-foreground uppercase">
                            The Catalog
                        </p>
                        <h2 className="mt-2.5 text-4xl leading-[1.1] lg:text-[44px]">
                            12,000 Courses. No Filler.
                        </h2>
                    </div>
                    <Button
                        variant="outline"
                        nativeButton={false}
                        className="h-11 gap-2 bg-card px-4.5! font-semibold"
                        render={<Link href="/courses" />}
                    >
                        Explore All
                        <ArrowRightIcon data-icon="inline-end" />
                    </Button>
                </div>

                <CatalogBrowser courses={courses} />
            </div>
        </section>
    );
}

export { CatalogSection };
