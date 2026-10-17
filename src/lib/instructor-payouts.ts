import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import type {
    PayoutMethodRoleValue,
    PayoutMethodTypeValue,
} from "@/lib/config/instructor-payouts";

export type PayoutMethodView = {
    id: string;
    type: PayoutMethodTypeValue;
    label: string;
    last4: string | null;
    currency: string;
    role: PayoutMethodRoleValue;
    verified: boolean;
    addedOn: string;
};

export type PayoutSettings = {
    methods: PayoutMethodView[];
    payoutDayOfMonth: number;
    minimumPayoutCents: number;
    emailPayoutReceipt: boolean;
};

export async function getPayoutSettings(): Promise<PayoutSettings | null> {
    const session = await getSession();
    if (!session) return null;

    const instructor = await db.instructor.findUnique({
        where: { userId: session.user.id },
        select: {
            payoutDayOfMonth: true,
            minimumPayoutCents: true,
            emailPayoutReceipt: true,
            payoutMethods: {
                orderBy: [{ role: "asc" }, { createdAt: "asc" }],
                select: {
                    id: true,
                    type: true,
                    label: true,
                    last4: true,
                    currency: true,
                    role: true,
                    verifiedAt: true,
                    createdAt: true,
                },
            },
        },
    });
    if (!instructor) return null;

    return {
        methods: instructor.payoutMethods.map((method) => ({
            id: method.id,
            type: method.type,
            label: method.label,
            last4: method.last4,
            currency: method.currency,
            role: method.role,
            verified: method.verifiedAt !== null,
            addedOn: method.createdAt.toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
            }),
        })),
        payoutDayOfMonth: instructor.payoutDayOfMonth,
        minimumPayoutCents: instructor.minimumPayoutCents,
        emailPayoutReceipt: instructor.emailPayoutReceipt,
    };
}
