import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { NewUserForm } from "@/components/dashboard/admin/users/new-user-form";
import { newUserCopy } from "@/lib/config/admin-users";
import { countryOptions } from "@/lib/config/countries";

function NewUserPage() {
    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <Link
                href="/dashboard/admin/users"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeftIcon className="size-4" />
                {newUserCopy.back}
            </Link>

            <h1 className="mt-4 text-[32px] leading-none font-bold">
                {newUserCopy.title}
            </h1>
            <p className="mt-2.5 text-[15px] text-muted-foreground">
                {newUserCopy.description}
            </p>

            <Card className="mt-6 w-full max-w-180 ring-border">
                <CardContent className="p-7.5">
                    <NewUserForm countries={countryOptions()} />
                </CardContent>
            </Card>
        </main>
    );
}

export { NewUserPage };
