import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export type Account = {
    name: string;
    dateOfBirth: string | null;
    language: string | null;
    timeZone: string | null;
};

export function toDateInput(value: Date | null): string | null {
    if (!value) return null;
    return value.toISOString().slice(0, 10);
}

export async function getAccount(): Promise<Account | null> {
    const session = await getSession();
    if (!session) return null;

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
            name: true,
            dateOfBirth: true,
            language: true,
            timeZone: true,
        },
    });
    if (!user) return null;

    return {
        name: user.name,
        dateOfBirth: toDateInput(user.dateOfBirth),
        language: user.language,
        timeZone: user.timeZone,
    };
}
