import {
    AwardIcon,
    BarChart3Icon,
    BookOpenIcon,
    ClockIcon,
    DownloadIcon,
    FileQuestionIcon,
    PlayIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CoursePreviewDialog } from "@/components/dashboard/courses/sale/course-preview-dialog";
import {
    CourseBuyButtons,
    CourseSaveButtons,
} from "@/components/dashboard/courses/sale/course-purchase-actions";
import { isWishlisted } from "@/lib/cart";
import type { CourseDetail } from "@/lib/config/course-details";
import type { SalePreviewLesson } from "@/lib/course-sale";
import { cn } from "@/lib/utils";

async function CoursePurchaseCard({
    course,
    previews = null,
    purchasable = true,
}: {
    course: CourseDetail;
    previews?: SalePreviewLesson[] | null;
    purchasable?: boolean;
}) {
    const wishlisted = purchasable ? await isWishlisted(course.slug) : false;

    const includes = [
        {
            icon: PlayIcon,
            label: `${course.includes.videoHours} Hours On-Demand Video`,
        },
        {
            icon: BookOpenIcon,
            label: `${course.includes.articlesCount} Articles And Cheat Sheets`,
        },
        {
            icon: FileQuestionIcon,
            label: `${course.includes.quizzesCount} Quizzes With Explanations`,
        },
        course.includes.downloadableResources
            ? { icon: DownloadIcon, label: "Downloadable Project Files" }
            : null,
        course.includes.certificate
            ? { icon: AwardIcon, label: "Certificate Of Completion" }
            : null,
        course.includes.lifetimeAccess
            ? { icon: BarChart3Icon, label: "Lifetime Access, All Devices" }
            : null,
    ].filter((item) => item !== null);

    const { icon: CourseIcon, ...previewCourse } = course;

    return (
        <Card className="gap-0 overflow-hidden p-0 ring-border lg:sticky lg:top-21.5 lg:self-start">
            <div
                className={cn(
                    "relative aspect-696/300 bg-linear-to-br",
                    course.art,
                )}
            >
                {course.thumbnailUrl ? (
                    <img
                        src={course.thumbnailUrl}
                        alt=""
                        className="absolute inset-0 size-full object-cover"
                    />
                ) : (
                    <CourseIcon className="absolute inset-0 m-auto size-16 text-white/15" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
                <CoursePreviewDialog
                    course={previewCourse}
                    previews={previews}
                    purchasable={purchasable}
                >
                    <button
                        type="button"
                        className="absolute bottom-4 left-4 flex cursor-pointer items-center gap-2 text-sm font-semibold text-white"
                    >
                        <PlayIcon className="size-4 fill-white" />
                        Preview this course
                    </button>
                </CoursePreviewDialog>
            </div>

            <div className="p-6.5">
                <div className="flex items-baseline gap-2.5">
                    <span className="text-[28px] font-extrabold tracking-[-0.02em] tabular-nums">
                        ${course.price.toFixed(2)}
                    </span>
                    {course.listPrice > course.price ? (
                        <>
                            <span className="text-base text-muted-foreground tabular-nums line-through">
                                ${course.listPrice.toFixed(2)}
                            </span>
                            <Badge className="h-6 bg-destructive/10 px-2 text-xs font-semibold text-destructive">
                                {course.discountPercent}% Off
                            </Badge>
                        </>
                    ) : null}
                </div>

                {course.saleEndsInDays > 0 ? (
                    <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-destructive">
                        <ClockIcon className="size-4" />
                        Sale Ends In {course.saleEndsInDays} Day
                        {course.saleEndsInDays === 1 ? "" : "s"}
                    </p>
                ) : null}

                <CourseBuyButtons
                    slug={course.slug}
                    unavailable={
                        purchasable
                            ? undefined
                            : "Enrolment for this course isn't open yet."
                    }
                />
                <p className="mt-3 text-center text-[13px] text-muted-foreground">
                    30-Day Money-Back Guarantee
                </p>

                <Separator className="my-5" />

                <h3 className="font-semibold">This course includes</h3>
                <ul className="mt-3.5 flex flex-col gap-2.5">
                    {includes.map((item) => (
                        <li
                            key={item.label}
                            className="flex items-center gap-3 text-sm text-muted-foreground"
                        >
                            <item.icon className="size-4 shrink-0" />
                            {item.label}
                        </li>
                    ))}
                </ul>

                <Separator className="my-5" />

                <CourseSaveButtons
                    slug={course.slug}
                    wishlisted={wishlisted}
                    wishlistable={purchasable}
                />
            </div>
        </Card>
    );
}

export { CoursePurchaseCard };
