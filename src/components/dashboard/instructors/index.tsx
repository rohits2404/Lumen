import {
    firstNameOf,
    PublicInstructorProfile,
} from "@/lib/config/instructor-profiles";
import { ProfileRelationship } from "@/lib/instructor-relationship";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { InstructorHeaderCard } from "./instructor-header-card";
import { InstructorAboutCard } from "./instructor-about-card";
import { InstructorReviewsCard } from "./instructor-reviews-card";
import { InstructorCoursesSection } from "./instructor-courses-section";

function InstructorProfilePage({
    instructor,
    backHref,
    backLabel,
    relationship,
}: {
    instructor: PublicInstructorProfile;
    relationship: ProfileRelationship;
    backHref: string;
    backLabel: string;
}) {
    const firstName = firstNameOf(instructor.name);

    return (
        <div>
            <Link
                href={backHref}
                className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeftIcon className="size-4" />
                {backLabel}
            </Link>

            <div className="mt-4 flex flex-col gap-4.5">
                <InstructorHeaderCard
                    instructor={instructor}
                    relationship={relationship}
                />

                <div className="grid gap-4.5 lg:grid-cols-[1.6fr_1fr] lg:items-start">
                    <InstructorAboutCard
                        firstName={firstName}
                        about={instructor.about}
                        skills={instructor.skills}
                    />
                    <InstructorReviewsCard reviews={instructor.reviews} />
                </div>
            </div>

            <div className="mt-8">
                <InstructorCoursesSection
                    firstName={firstName}
                    courses={instructor.courses}
                />
            </div>
        </div>
    );
}

export { InstructorProfilePage };
