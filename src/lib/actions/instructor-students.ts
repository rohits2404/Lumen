"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import {
    MESSAGE_ALL_LIMIT,
    STUDENTS_EXPORT_LIMIT,
    studentStatusLabel,
} from "@/lib/config/instructor-students";
import { db } from "@/lib/db";
import { getInstructorProfile } from "@/lib/instructor";
import { getAllStudents, parseStudentsQuery } from "@/lib/instructor-students";
import { startConversation } from "@/lib/actions/messages";

export type StudentsActionResult = { ok: boolean; message: string };

const MESSAGE_MAX = 4000;

export type StudentsFilter = {
    tab?: string;
    course?: string;
    q?: string;
};

export type StudentsCsvResult = {
    ok: boolean;
    message: string;
    csv?: string;
    truncated?: boolean;
    rows?: number;
};

export async function exportStudentsCsv(
    filter: StudentsFilter,
): Promise<StudentsCsvResult> {
    const query = parseStudentsQuery(filter);
    const rows = await getAllStudents(query, STUDENTS_EXPORT_LIMIT + 1);
    if (rows === null) {
        return {
            ok: false,
            message: "You Need A Teaching Profile To Do That.",
        };
    }

    const truncated = rows.length > STUDENTS_EXPORT_LIMIT;
    const kept = truncated ? rows.slice(0, STUDENTS_EXPORT_LIMIT) : rows;

    const header = [
        "Student",
        "Email",
        "Course",
        "Progress %",
        "Lessons completed",
        "Lessons total",
        "Status",
        "Last active",
    ];
    const body = kept.map((row) => [
        row.name,
        row.email,
        row.courseTitle,
        String(row.progressPercent),
        String(row.completedLessons),
        String(row.totalLessons),
        studentStatusLabel[row.status],
        row.lastActive,
    ]);

    return {
        ok: true,
        message: "",
        csv: [header, ...body]
            .map((line) => line.map(csvCell).join(","))
            .join("\n"),
        truncated,
        rows: kept.length,
    };
}

function csvCell(value: string): string {
    const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
    return `"${safe.replaceAll('"', '""')}"`;
}

export type OpenConversationResult = StudentsActionResult & {
    conversationId?: string;
};

export async function openStudentConversation(
    enrollmentId: string,
): Promise<OpenConversationResult> {
    const found = await ownedEnrolment(enrollmentId);
    if (!found)
        return { ok: false, message: "That Student Isn't In Your Cohort." };

    return startConversation(
        "INSTRUCTOR",
        found.enrolment.userId,
        found.enrolment.courseId,
    );
}

export type MessageAllResult = StudentsActionResult & { sent?: number };

export async function messageAllStudents(
    filter: StudentsFilter,
    body: string,
): Promise<MessageAllResult> {
    const session = await getSession();
    if (!session) return { ok: false, message: "Sign In To Send a Message." };

    const profile = await getInstructorProfile(session.user.id);
    if (!profile) {
        return {
            ok: false,
            message: "You Need a Teaching Profile To Do That.",
        };
    }

    const text = body.trim().slice(0, MESSAGE_MAX);
    if (text === "") return { ok: false, message: "Write a Message First." };

    const query = parseStudentsQuery(filter);
    const rows = await getAllStudents(query, MESSAGE_ALL_LIMIT);
    if (rows === null) {
        return {
            ok: false,
            message: "You Need a Teaching Profile To Do That.",
        };
    }
    if (rows.length === 0) {
        return { ok: false, message: "No student Matches That Filter." };
    }

    const meId = session.user.id;
    const existing = new Map<string, string>(
        (
            await db.conversation.findMany({
                where: {
                    courseId: {
                        in: [...new Set(rows.map((row) => row.courseId))],
                    },
                    participants: { some: { userId: meId } },
                },
                select: {
                    id: true,
                    courseId: true,
                    participants: { select: { userId: true } },
                },
            })
        ).flatMap((conversation) =>
            conversation.participants
                .filter((participant) => participant.userId !== meId)
                .map((participant): [string, string] => [
                    `${participant.userId}:${conversation.courseId}`,
                    conversation.id,
                ]),
        ),
    );

    let sent = 0;
    for (const row of rows) {
        if (row.userId === meId) continue;
        try {
            const key = `${row.userId}:${row.courseId}`;
            const conversationId =
                existing.get(key) ??
                (
                    await db.conversation.create({
                        data: {
                            courseId: row.courseId,
                            participants: {
                                create: [
                                    { userId: meId, lastReadAt: new Date() },
                                    { userId: row.userId },
                                ],
                            },
                        },
                        select: { id: true },
                    })
                ).id;

            await db.message.create({
                data: { conversationId, senderId: meId, body: text },
            });
            sent += 1;
        } catch {}
    }

    revalidatePath("/dashboard/instructor/messages", "layout");
    return {
        ok: sent > 0,
        message:
            sent === 0
                ? "Nothing Was Sent."
                : `Sent To ${sent} ${sent === 1 ? "Student" : "Students"}.`,
        sent,
    };
}

async function ownedEnrolment(enrollmentId: string) {
    const session = await getSession();
    if (!session) return null;

    const profile = await getInstructorProfile(session.user.id);
    if (!profile) return null;

    const enrolment = await db.enrollment.findFirst({
        where: { id: enrollmentId, course: { instructorId: profile.id } },
        select: { userId: true, courseId: true },
    });
    if (!enrolment) return null;

    return { meId: session.user.id, enrolment };
}
