"use client";

import * as React from "react";
import Link from "next/link";
import { GraduationCapIcon, RocketIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { CurriculumBoard } from "@/components/dashboard/instructor/courses/edit/curriculum-board";
import { IntendedLearnersForm } from "@/components/dashboard/instructor/courses/edit/intended-learners-form";
import {
    LandingPageForm,
    type LandingValues,
} from "@/components/dashboard/instructor/courses/edit/landing-page-form";
import {
    PricingForm,
    type PricingValues,
} from "@/components/dashboard/instructor/courses/edit/pricing-form";
import { CouponsStep } from "@/components/dashboard/instructor/courses/edit/coupons-step";
import {
    CourseMessagesForm,
    type MessagesValues,
} from "@/components/dashboard/instructor/courses/edit/course-messages-form";
import {
    courseEditorCopy,
    publishCopy,
    type EditorStepKey,
} from "@/lib/config/course-editor";
import { courseStatusBadge } from "@/lib/config/course-status";
import type { EditorCourse } from "@/lib/instructor-course-edit";
import type { CourseCoupons } from "@/lib/instructor-coupons";
import {
    publishCourse,
    saveIntendedLearners,
    saveCourseMessages,
    saveLandingPage,
    savePricing,
} from "@/lib/actions/instructor-course-edit";

function CourseEditorPage({
    course,
    step,
    nav,
    previewHref,
    coupons,
}: {
    course: EditorCourse;
    step: EditorStepKey;
    nav: React.ReactNode;
    previewHref: string;
    coupons: CourseCoupons | null;
}) {
    const [values, setValues] = React.useState({
        learningOutcomes: course.learningOutcomes,
        requirements: course.requirements,
        intendedAudience: course.intendedAudience,
    });
    const [landing, setLanding] = React.useState<LandingValues>({
        title: course.landing.title,
        subtitle: course.landing.subtitle,
        description: course.landing.description,
    });
    const [pricing, setPricing] = React.useState<PricingValues>({
        currency: course.pricing.currency,
        listPriceCents: course.pricing.listPriceCents,
        includedInBusiness: course.pricing.includedInBusiness,
    });
    const [saving, startSaving] = React.useTransition();
    const [publishing, startPublishing] = React.useTransition();
    const [confirmOpen, setConfirmOpen] = React.useState(false);

    const badge = courseStatusBadge(course.status);
    const canSubmit =
        course.status === "DRAFT" || course.status === "NEEDS_CHANGES";
    const publishReason = publishCopy.unavailable[course.status];
    const [messages, setMessages] = React.useState<MessagesValues>({
        welcomeMessage: course.messages.welcomeMessage,
        congratulationsMessage: course.messages.congratulationsMessage,
    });
    const saveDraftReason = courseEditorCopy.saveDraftUnavailable[step];
    const hasForm = saveDraftReason === undefined;

    function save() {
        if (!hasForm) return;
        startSaving(async () => {
            const result =
                step === "landing-page"
                    ? await saveLandingPage(course.id, landing)
                    : step === "pricing"
                      ? await savePricing(course.id, pricing)
                      : step === "messages"
                        ? await saveCourseMessages(course.id, messages)
                        : await saveIntendedLearners(course.id, values);
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
        });
    }

    function submitForReview() {
        startPublishing(async () => {
            const result = await publishCourse(course.id);
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
            if (result.ok) setConfirmOpen(false);
        });
    }

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="min-w-0">
                    <h1 className="text-[28px] leading-none font-extrabold">
                        {courseEditorCopy.title}
                    </h1>
                    <p className="mt-2.5 truncate text-[15px] text-muted-foreground">
                        {course.title} · {badge.label}
                    </p>
                </div>

                <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={!hasForm}
                        loading={hasForm && saving}
                        title={saveDraftReason}
                        onClick={save}
                        className="h-10.5 bg-card px-4 text-[14px] shadow-sm"
                    >
                        {courseEditorCopy.saveDraft}
                    </Button>

                    <Button
                        variant="outline"
                        nativeButton={false}
                        render={<Link href={previewHref} />}
                        className="h-10.5 gap-2 bg-card px-4 text-[14px] shadow-sm"
                    >
                        <GraduationCapIcon className="size-4" />
                        {courseEditorCopy.preview}
                    </Button>

                    <Button
                        type="button"
                        disabled={!canSubmit}
                        title={publishReason}
                        onClick={() => setConfirmOpen(true)}
                        className="h-10.5 gap-2 px-4 text-[14px]"
                    >
                        <RocketIcon className="size-4" />
                        {courseEditorCopy.publish}
                    </Button>
                </div>
            </div>

            <div className="mt-6 grid gap-6.5 lg:grid-cols-[238px_minmax(0,1fr)] lg:items-start">
                {nav}

                <div className="min-w-0">
                    {step === "curriculum" ? (
                        <CurriculumBoard
                            courseId={course.id}
                            courseSlug={course.slug}
                            sections={course.sections}
                        />
                    ) : step === "landing-page" ? (
                        <LandingPageForm
                            courseId={course.id}
                            landing={course.landing}
                            values={landing}
                            pending={saving}
                            onChange={(next) =>
                                setLanding((current) => ({
                                    ...current,
                                    ...next,
                                }))
                            }
                            onSubmit={save}
                        />
                    ) : step === "coupons" && coupons ? (
                        <CouponsStep courseId={course.id} data={coupons} />
                    ) : step === "messages" ? (
                        <CourseMessagesForm
                            values={messages}
                            pending={saving}
                            onChange={(next) =>
                                setMessages((current) => ({
                                    ...current,
                                    ...next,
                                }))
                            }
                            onSubmit={save}
                        />
                    ) : step === "pricing" ? (
                        <PricingForm
                            courseId={course.id}
                            pricing={course.pricing}
                            values={pricing}
                            pending={saving}
                            onChange={(next) =>
                                setPricing((current) => ({
                                    ...current,
                                    ...next,
                                }))
                            }
                            onSubmit={save}
                        />
                    ) : (
                        <IntendedLearnersForm
                            values={values}
                            pending={saving}
                            onChange={(next) =>
                                setValues((current) => ({
                                    ...current,
                                    ...next,
                                }))
                            }
                            onSubmit={save}
                        />
                    )}
                </div>
            </div>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="w-110 gap-0 p-7.5 sm:max-w-110">
                    <DialogHeader className="gap-2">
                        <DialogTitle className="text-xl font-bold">
                            {publishCopy.title}
                        </DialogTitle>
                        <DialogDescription className="text-[15px] leading-6">
                            {publishCopy.description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-6">
                        <Button
                            type="button"
                            loading={publishing}
                            onClick={submitForReview}
                            className="h-11 px-5"
                        >
                            {publishCopy.confirm}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </main>
    );
}

export { CourseEditorPage };
