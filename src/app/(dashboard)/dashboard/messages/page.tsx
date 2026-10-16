import { Messages } from "@/components/dashboard/messages";
import { getMessagesPage, parseMessagesQuery } from "@/lib/messages";
import { redirect } from "next/navigation";
import React from "react";

const MessagesPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const params = await searchParams;
    const data = await getMessagesPage("LEARNER", parseMessagesQuery(params));
    if (!data) redirect("/login");

    return <Messages audience="LEARNER" data={data} />;
};

export default MessagesPage;
