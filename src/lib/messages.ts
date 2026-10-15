import { format } from "date-fns";

import { compactAge } from "@/lib/relative-time";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getInstructorProfile } from "@/lib/instructor";
import { initialsOf } from "@/lib/user";
import {
    CONVERSATION_LIMIT,
    MESSAGE_SEARCH_MAX,
    PRESENCE_WINDOW_HOURS,
    THREAD_MESSAGE_LIMIT,
    type MessageAudience,
} from "@/lib/config/messages";
import { Prisma } from "@/generated/prisma/client";

export type MessagesQuery = {
    conversationId: string | null;
    search: string;
};

export type Counterpart = {
    id: string;
    name: string;
    image: string | null;
    initials: string;
    online: boolean;
};

export type ConversationSummary = {
    id: string;
    counterpart: Counterpart;
    courseTitle: string | null;
    preview: string;
    age: string;
    unread: number;
};

export type ThreadMessage = {
    id: string;
    body: string;
    time: string;
    mine: boolean;
};

export type ActiveThread = {
    id: string;
    counterpart: Counterpart;
    courseTitle: string | null;
    messages: ThreadMessage[];
    writable: boolean;
};

export type MessagesPage = {
    conversations: ConversationSummary[];
    active: ActiveThread | null;
    unread: number;
    query: MessagesQuery;
};

export type Pairing = {
    courseId: string;
    courseTitle: string;
    instructorUserId: string;
    learnerUserId: string;
};

export async function resolvePairing(
    meId: string,
    counterpartId: string,
    courseId: string,
): Promise<Pairing | null> {
    if (meId === counterpartId) return null;

    const course = await db.course.findUnique({
        where: { id: courseId },
        select: {
            id: true,
            title: true,
            instructor: { select: { userId: true } },
            enrollments: {
                where: { userId: { in: [meId, counterpartId] } },
                select: { userId: true },
            },
        },
    });
    const instructorUserId = course?.instructor.userId;
    if (!course || !instructorUserId) return null;

    let learnerUserId: string;
    if (instructorUserId === meId) learnerUserId = counterpartId;
    else if (instructorUserId === counterpartId) learnerUserId = meId;
    else return null;

    if (!course.enrollments.some((row) => row.userId === learnerUserId)) {
        return null;
    }

    return {
        courseId,
        courseTitle: course.title,
        instructorUserId,
        learnerUserId,
    };
}

export function parseMessagesQuery(params: {
    c?: string | string[];
    q?: string | string[];
}): MessagesQuery {
    const one = (value: string | string[] | undefined) =>
        Array.isArray(value) ? value[0] : value;

    const conversationId = (one(params.c) ?? "").trim();
    return {
        conversationId:
            conversationId === "" ? null : conversationId.slice(0, 64),
        search: (one(params.q) ?? "").trim().slice(0, MESSAGE_SEARCH_MAX),
    };
}

function audienceWhere(
    audience: MessageAudience,
    instructorProfileId: string | null,
): Prisma.ConversationWhereInput {
    if (audience === "INSTRUCTOR") {
        return instructorProfileId
            ? { course: { is: { instructorId: instructorProfileId } } }
            : { id: { in: [] } };
    }
    return instructorProfileId
        ? { NOT: { course: { is: { instructorId: instructorProfileId } } } }
        : {};
}

function unreadWhere(
    rows: { conversationId: string; lastReadAt: Date | null }[],
    meId: string,
): Prisma.MessageWhereInput | null {
    if (rows.length === 0) return null;
    return {
        deletedAt: null,
        senderId: { not: meId },
        OR: rows.map((row) => ({
            conversationId: row.conversationId,
            ...(row.lastReadAt ? { sentAt: { gt: row.lastReadAt } } : {}),
        })),
    };
}

async function presentUsers(userIds: string[], now: Date) {
    if (userIds.length === 0) return new Set<string>();
    const since = new Date(
        now.getTime() - PRESENCE_WINDOW_HOURS * 60 * 60 * 1000,
    );
    const sessions = await db.session.findMany({
        where: {
            userId: { in: userIds },
            expiresAt: { gt: now },
            updatedAt: { gt: since },
        },
        select: { userId: true },
        distinct: ["userId"],
    });
    return new Set(sessions.map((session) => session.userId));
}

export async function getMessagesPage(
    audience: MessageAudience,
    query: MessagesQuery,
): Promise<MessagesPage | null> {
    const session = await getSession();
    if (!session) return null;

    const meId = session.user.id;
    const now = new Date();
    const profile = await getInstructorProfile(meId);
    const scope = audienceWhere(audience, profile?.id ?? null);
    const mine: Prisma.ConversationWhereInput = {
        participants: { some: { userId: meId } },
        ...scope,
    };

    const searched: Prisma.ConversationWhereInput = query.search
        ? {
              ...mine,
              OR: [
                  {
                      participants: {
                          some: {
                              userId: { not: meId },
                              user: {
                                  name: {
                                      contains: query.search,
                                      mode: "insensitive",
                                  },
                              },
                          },
                      },
                  },
                  {
                      course: {
                          is: {
                              title: {
                                  contains: query.search,
                                  mode: "insensitive",
                              },
                          },
                      },
                  },
                  {
                      messages: {
                          some: {
                              deletedAt: null,
                              body: {
                                  contains: query.search,
                                  mode: "insensitive",
                              },
                          },
                      },
                  },
              ],
          }
        : mine;

    const [rows, myRows] = await Promise.all([
        db.conversation.findMany({
            where: searched,
            orderBy: { lastMessageAt: "desc" },
            take: CONVERSATION_LIMIT,
            select: {
                id: true,
                lastMessageAt: true,
                course: { select: { id: true, title: true } },
                participants: {
                    select: {
                        userId: true,
                        lastReadAt: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                            },
                        },
                    },
                },
                messages: {
                    where: { deletedAt: null },
                    orderBy: { sentAt: "desc" },
                    take: 1,
                    select: { body: true, sentAt: true },
                },
            },
        }),
        db.conversationParticipant.findMany({
            where: { userId: meId, archivedAt: null, conversation: scope },
            orderBy: { conversation: { lastMessageAt: "desc" } },
            take: CONVERSATION_LIMIT,
            select: { conversationId: true, lastReadAt: true },
        }),
    ]);

    const selected =
        rows.find((row) => row.id === query.conversationId) ?? rows[0] ?? null;
    const selectedOther = selected
        ? selected.participants.find((entry) => entry.userId !== meId)
        : undefined;

    const counterpartIds = [
        ...new Set(
            rows
                .map(
                    (row) =>
                        row.participants.find((p) => p.userId !== meId)?.userId,
                )
                .filter((id): id is string => typeof id === "string"),
        ),
    ];
    const scoped = unreadWhere(myRows, meId);

    const [grouped, present, threadRows, pairing] = await Promise.all([
        scoped
            ? db.message.groupBy({
                  by: ["conversationId"],
                  where: scoped,
                  _count: { _all: true },
              })
            : Promise.resolve(
                  [] as { conversationId: string; _count: { _all: number } }[],
              ),
        presentUsers(counterpartIds, now),
        selected
            ? db.message.findMany({
                  where: { conversationId: selected.id, deletedAt: null },
                  orderBy: { sentAt: "desc" },
                  take: THREAD_MESSAGE_LIMIT,
                  select: {
                      id: true,
                      body: true,
                      sentAt: true,
                      senderId: true,
                  },
              })
            : Promise.resolve(
                  [] as {
                      id: string;
                      body: string;
                      sentAt: Date;
                      senderId: string;
                  }[],
              ),
        selected?.course && selectedOther
            ? resolvePairing(meId, selectedOther.userId, selected.course.id)
            : Promise.resolve(null),
    ]);

    const unreadById = new Map(
        grouped.map((entry) => [entry.conversationId, entry._count._all]),
    );

    const conversations: ConversationSummary[] = [];
    for (const row of rows) {
        const other = row.participants.find((p) => p.userId !== meId);
        if (!other) continue;
        conversations.push({
            id: row.id,
            counterpart: {
                id: other.user.id,
                name: other.user.name,
                image: other.user.image,
                initials: initialsOf(other.user.name, other.user.email),
                online: present.has(other.user.id),
            },
            courseTitle: row.course?.title ?? null,
            preview: row.messages[0]?.body ?? "",
            age: compactAge(row.messages[0]?.sentAt ?? row.lastMessageAt, now),
            unread: unreadById.get(row.id) ?? 0,
        });
    }

    const active: ActiveThread | null =
        selected && selectedOther
            ? {
                  id: selected.id,
                  counterpart: conversations.find(
                      (entry) => entry.id === selected.id,
                  )?.counterpart ?? {
                      id: selectedOther.user.id,
                      name: selectedOther.user.name,
                      image: selectedOther.user.image,
                      initials: initialsOf(
                          selectedOther.user.name,
                          selectedOther.user.email,
                      ),
                      online: present.has(selectedOther.user.id),
                  },
                  courseTitle: selected.course?.title ?? null,
                  messages: threadRows
                      .slice()
                      .reverse()
                      .map((message) => ({
                          id: message.id,
                          body: message.body,
                          time: format(message.sentAt, "h:mm a"),
                          mine: message.senderId === meId,
                      })),
                  writable: pairing !== null,
              }
            : null;

    return {
        conversations,
        active,
        unread: [...unreadById.values()].reduce((total, n) => total + n, 0),
        query: { ...query, conversationId: selected?.id ?? null },
    };
}

export async function getUnreadMessageCount(
    audience: MessageAudience,
): Promise<number> {
    const session = await getSession();
    if (!session) return 0;

    const meId = session.user.id;
    const profile = await getInstructorProfile(meId);
    const rows = await db.conversationParticipant.findMany({
        where: {
            userId: meId,
            archivedAt: null,
            conversation: audienceWhere(audience, profile?.id ?? null),
        },
        select: { conversationId: true, lastReadAt: true },
        take: CONVERSATION_LIMIT,
    });

    const where = unreadWhere(rows, meId);
    return where ? db.message.count({ where }) : 0;
}

export type MessageCandidate = {
    userId: string;
    name: string;
    image: string | null;
    initials: string;
    courseId: string;
    courseTitle: string;
};

const CANDIDATE_LIMIT = 40;

export async function getMessageCandidates(
    audience: MessageAudience,
    search: string,
): Promise<MessageCandidate[]> {
    const session = await getSession();
    if (!session) return [];

    const meId = session.user.id;
    const term = search.trim().slice(0, MESSAGE_SEARCH_MAX);
    const like = { contains: term, mode: "insensitive" } as const;

    if (audience === "INSTRUCTOR") {
        const profile = await getInstructorProfile(meId);
        if (!profile) return [];

        const rows = await db.enrollment.findMany({
            where: {
                course: { instructorId: profile.id },
                userId: { not: meId },
                ...(term
                    ? {
                          OR: [
                              { user: { name: like } },
                              { course: { is: { title: like } } },
                          ],
                      }
                    : {}),
            },
            orderBy: { createdAt: "desc" },
            take: CANDIDATE_LIMIT,
            select: {
                user: {
                    select: { id: true, name: true, email: true, image: true },
                },
                course: { select: { id: true, title: true } },
            },
        });

        return rows.map((row) => ({
            userId: row.user.id,
            name: row.user.name,
            image: row.user.image,
            initials: initialsOf(row.user.name, row.user.email),
            courseId: row.course.id,
            courseTitle: row.course.title,
        }));
    }

    const rows = await db.enrollment.findMany({
        where: {
            userId: meId,
            course: { instructor: { is: { userId: { not: null } } } },
            ...(term
                ? {
                      OR: [
                          { course: { is: { title: like } } },
                          {
                              course: {
                                  is: { instructor: { is: { name: like } } },
                              },
                          },
                      ],
                  }
                : {}),
        },
        orderBy: { createdAt: "desc" },
        take: CANDIDATE_LIMIT,
        select: {
            course: {
                select: {
                    id: true,
                    title: true,
                    instructor: {
                        select: {
                            name: true,
                            imageUrl: true,
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    image: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const candidates: MessageCandidate[] = [];
    for (const row of rows) {
        const user = row.course.instructor.user;
        if (!user || user.id === meId) continue;
        candidates.push({
            userId: user.id,
            name: row.course.instructor.name,
            image: row.course.instructor.imageUrl ?? user.image,
            initials: initialsOf(row.course.instructor.name, user.email),
            courseId: row.course.id,
            courseTitle: row.course.title,
        });
    }
    return candidates;
}
