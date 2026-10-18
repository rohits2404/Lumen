"use server";

import { getPayoutRun, type PayoutRunDetail } from "@/lib/admin/reports";
import { getSession } from "@/lib/auth";

export async function loadPayoutRun(
    id: string,
): Promise<
    { ok: true; run: PayoutRunDetail } | { ok: false; message: string }
> {
    const session = await getSession();
    if (session?.user.role !== "admin") {
        return { ok: false, message: "You Do Not Have Access To Payout Runs." };
    }

    const run = await getPayoutRun(id);
    if (!run)
        return { ok: false, message: "That Payout Run No Longer Exists." };

    return { ok: true, run };
}
