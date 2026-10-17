import { RevenuePage } from "@/components/dashboard/instructor/revenue/revenue-page";
import { getRevenuePage } from "@/lib/instructor-revenue";
import { notFound } from "next/navigation";
import React from "react";

const InstructorRevenuePage = async () => {
    const page = await getRevenuePage();
    if (!page) notFound();

    return <RevenuePage page={page} />;
};

export default InstructorRevenuePage;
