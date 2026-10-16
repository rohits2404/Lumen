"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import {
    counterpartRole,
    MessageAudience,
    messagesCopy,
    messagesEmpty,
    messagesLead,
} from "@/lib/config/messages";
import { MessagesPage } from "@/lib/messages";
import { GraduationCapIcon, PenSquareIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { ConversationList } from "./conversation-list";
import { MessageThread } from "./message-thread";
import { NewMessageDialog } from "./new-message-dialog";

function Messages({
    audience,
    data,
}: {
    audience: MessageAudience;
    data: MessagesPage;
}) {
    const [composing, setComposing] = useState(false);
    const empty = messagesEmpty[audience];
    const EmptyIcon = audience === "INSTRUCTOR" ? UsersIcon : GraduationCapIcon;

    const activeUnread =
        data.conversations.find((entry) => entry.id === data.active?.id)
            ?.unread ?? 0;

    const lead = data.active
        ? `${counterpartRole[audience]}${
              data.active.courseTitle ? ` · ${data.active.courseTitle}` : ""
          }`
        : messagesLead[audience];

    const blank = data.conversations.length === 0 && data.query.search === "";

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-[32px] leading-none font-bold">
                        {messagesCopy.title}
                    </h1>
                    <p className="mt-2.5 truncate text-[15px] text-muted-foreground">
                        {lead}
                    </p>
                </div>

                <Button
                    type="button"
                    onClick={() => setComposing(true)}
                    className="h-10 shrink-0 gap-2 px-4"
                >
                    <PenSquareIcon className="size-4" />
                    {messagesCopy.newMessage}
                </Button>
            </div>

            <Card className="mt-6 h-154.75 flex-row gap-0 overflow-hidden p-0 [--card-spacing:0px]">
                {blank ? (
                    <Empty className="flex-1">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <EmptyIcon />
                            </EmptyMedia>
                            <EmptyTitle>{empty.title}</EmptyTitle>
                            <EmptyDescription>
                                {empty.description}
                            </EmptyDescription>
                        </EmptyHeader>
                        <Button
                            type="button"
                            onClick={() => setComposing(true)}
                            className="h-10 gap-2 px-4"
                        >
                            <PenSquareIcon className="size-4" />
                            {messagesCopy.newMessage}
                        </Button>
                    </Empty>
                ) : (
                    <div className="flex min-h-0 w-full flex-col md:flex-row">
                        <ConversationList
                            conversations={data.conversations}
                            activeId={data.active?.id ?? null}
                            search={data.query.search}
                        />
                        {data.active ? (
                            <MessageThread
                                audience={audience}
                                thread={data.active}
                                unread={activeUnread}
                            />
                        ) : (
                            <div className="flex min-h-0 flex-1 items-center justify-center bg-background p-8">
                                <p className="text-[15px] text-muted-foreground">
                                    {messagesCopy.noMatches}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            <NewMessageDialog
                audience={audience}
                open={composing}
                onOpenChange={setComposing}
            />
        </main>
    );
}

export { Messages };
