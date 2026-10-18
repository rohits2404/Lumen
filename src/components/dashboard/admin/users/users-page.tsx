import Link from "next/link";
import { CirclePlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UsersStats } from "@/components/dashboard/admin/users/users-stats";
import {
    UsersTable,
    type UsersTableRow,
} from "@/components/dashboard/admin/users/users-table";
import { adminUsersCopy } from "@/lib/config/admin-users";
import { countryName } from "@/lib/config/countries";
import { getUsersPage, getUserStats, type UsersQuery } from "@/lib/admin/users";

async function UsersPage({ query }: { query: UsersQuery }) {
    const [stats, page] = await Promise.all([
        getUserStats(),
        getUsersPage(query),
    ]);

    const rows: UsersTableRow[] = page.rows.map((row) => ({
        ...row,
        countryLabel: countryName(row.country),
    }));

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-[32px] leading-none font-bold">
                        {adminUsersCopy.title}
                    </h1>
                    <p className="mt-2.5 text-[15px] text-muted-foreground">
                        {adminUsersCopy.description}
                    </p>
                </div>

                <Button
                    nativeButton={false}
                    render={<Link href="/dashboard/admin/users/new" />}
                    className="h-10 gap-2 px-5"
                >
                    <CirclePlusIcon className="size-4.5" />
                    {adminUsersCopy.addLabel}
                </Button>
            </div>

            <div className="mt-4">
                <UsersStats stats={stats} />
            </div>

            <UsersTable rows={rows} page={page} query={query} />
        </main>
    );
}

export { UsersPage };
