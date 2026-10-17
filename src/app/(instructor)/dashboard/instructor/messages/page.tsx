import { Messages } from "@/components/dashboard/messages";
import { getMessagesPage, parseMessagesQuery } from "@/lib/messages";
import { redirect } from "next/navigation";
import React from "react";

const InstructorMessagesPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const params = await searchParams;
    const data = await getMessagesPage(
        "INSTRUCTOR",
        parseMessagesQuery(params),
    );
    if (!data) redirect("/login");

    return <Messages audience="INSTRUCTOR" data={data} />;
};

export default InstructorMessagesPage;
