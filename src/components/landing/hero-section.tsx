import Link from "next/link";
import { HeroBackdrop } from "./hero-backdrop";
import { ArrowRightIcon, ChevronRightIcon, StarIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "../ui/avatar";
import { HeroAppPreview } from "./hero-app-preview";
import { TrustedBy } from "./trusted-by";

const learners = [
    { name: "Amara Osei", src: "/avatars/learner-1.png" },
    { name: "Jonas Reyes", src: "/avatars/learner-2.png" },
    { name: "Sofia Kaur", src: "/avatars/learner-3.png" },
    { name: "Tomas Neri", src: "/avatars/learner-4.png" },
];

function HeroSection() {
    return (
        <section className="relative isolate overflow-hidden">
            <HeroBackdrop />

            <div className="relative mx-auto flex w-full max-w-300 flex-col items-center px-6 py-12 md:py-20">
                <Link
                    href="/changelog"
                    className="group flex items-center gap-2 rounded-full border bg-card py-1.5 pr-2.5 pl-1.5 shadow-sm transition-colors hover:bg-hover"
                >
                    <span className="bg-logo rounded-full px-2 py-0.5 text-[11px] font-extrabold tracking-[0.04em] text-white">
                        NEW
                    </span>
                    <span className="text-sm text-muted-foreground">
                        <span className="sm:hidden">
                            Payouts Now Run Monthly
                        </span>
                        <span className="hidden sm:inline">
                            Instructor Payouts Now Run Monthly
                        </span>
                    </span>
                    <ChevronRightIcon className="size-4 text-subtle-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>

                <h1 className="mt-8 text-center text-[clamp(2.3rem,11.5vw,3rem)] leading-[0.97] sm:text-6xl lg:text-[4.5rem]">
                    Learn Anything.
                    <br />
                    <span className="text-gradient">Teach Everything.</span>
                </h1>

                <p className="mt-7 max-w-2xl text-center text-[19px] leading-[1.66] text-muted-foreground">
                    One Platform For Both Sides Of The Classroom — 12,000
                    Courses To Learn From, And Everything You Need To Build And
                    Sell Your Own.
                </p>

                <div className="mt-9 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
                    <Button
                        nativeButton={false}
                        className="h-13 w-full max-w-[320px] gap-2 px-6! text-[15px] font-semibold sm:w-auto sm:max-w-none"
                        render={<Link href="/register" />}
                    >
                        Start Learning Free
                        <ArrowRightIcon data-icon="inline-end" />
                    </Button>
                    <Button
                        variant="outline"
                        nativeButton={false}
                        className="h-13 w-full max-w-[320px] bg-card px-6 text-[15px] font-semibold sm:w-auto sm:max-w-none"
                        render={<Link href="/teach" />}
                    >
                        Become An Instructor
                    </Button>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <AvatarGroup className="-space-x-1.5">
                        {learners.map((learner) => (
                            <Avatar key={learner.name} size="sm">
                                <AvatarImage
                                    src={learner.src}
                                    alt={learner.name}
                                />
                                <AvatarFallback className="bg-hover text-[10px] font-semibold">
                                    {learner.name
                                        .split(" ")
                                        .map((part) => part[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                    </AvatarGroup>
                    <div className="flex gap-0.5 text-star">
                        {Array.from({ length: 5 }, (_, index) => (
                            <StarIcon
                                key={index}
                                className="size-3.5 fill-current"
                            />
                        ))}
                    </div>
                    <p className="text-[15px] text-muted-foreground">
                        4.8 From 28,000+ Learners
                    </p>
                </div>

                <HeroAppPreview className="mt-18 animate-floaty" />

                <TrustedBy className="mt-20" />
            </div>
        </section>
    );
}

export { HeroSection };
