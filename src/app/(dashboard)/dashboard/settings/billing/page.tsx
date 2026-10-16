import { SettingsBilling } from "@/components/dashboard/settings/settings-billing";
import { getSession } from "@/lib/auth";
import { getBilling } from "@/lib/billing";
import { syncSubscriptionsForCustomer } from "@/lib/subscription-sync";
import { redirect } from "next/navigation";
import React from "react";

const SettingsBillingPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ subscribed?: string }>;
}) => {
    const { subscribed } = await searchParams;

    if (subscribed) {
        const session = await getSession();
        if (session) {
            await syncSubscriptionsForCustomer(session.user.id).catch(() => {});
        }
    }

    const billing = await getBilling();
    if (!billing) redirect("/login");

    return <SettingsBilling billing={billing} />;
};

export default SettingsBillingPage;
