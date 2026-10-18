import { SettingsAccount } from "@/components/dashboard/settings/settings-account";
import { getAccount } from "@/lib/account";
import { redirect } from "next/navigation";
import React from "react";

const AdminSettingsAccountsPage = async () => {
    const account = await getAccount();
    if (!account) redirect("/login");

    return <SettingsAccount account={account} />;
};

export default AdminSettingsAccountsPage;
