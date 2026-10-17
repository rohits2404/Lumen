import { editorStepHref, FIRST_STEP } from "@/lib/config/course-editor";
import { redirect } from "next/navigation";
import React from "react";

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    redirect(editorStepHref(slug, FIRST_STEP));
};

export default Page;
