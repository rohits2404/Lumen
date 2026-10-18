"use client";

import Link from "next/link";
import {
    CircleCheckIcon,
    EllipsisIcon,
    MailIcon,
    UserRoundIcon,
    XIcon,
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { userRowMenu } from "@/lib/config/admin-users";
import type { UserRow } from "@/lib/admin/users";

function UserRowActions({
    user,
    pending,
    onSetStatus,
}: {
    user: UserRow;
    pending: boolean;
    onSetStatus: (status: "ACTIVE" | "SUSPENDED") => void;
}) {
    const suspended = user.status === "SUSPENDED";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label={`Actions for ${user.name}`}
                className="grid size-8 cursor-pointer place-items-center rounded-md text-subtle-foreground transition-colors outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            >
                <EllipsisIcon className="size-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
                {user.instructorSlug ? (
                    <DropdownMenuItem
                        render={
                            <Link
                                href={`/dashboard/instructors/${user.instructorSlug}`}
                            />
                        }
                        className="cursor-pointer p-2"
                    >
                        <UserRoundIcon />
                        {userRowMenu.viewProfile}
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem
                        disabled
                        title={userRowMenu.viewProfileUnavailable}
                        className="p-2"
                    >
                        <UserRoundIcon />
                        {userRowMenu.viewProfile}
                    </DropdownMenuItem>
                )}

                <DropdownMenuItem
                    render={<a href={`mailto:${user.email}`} />}
                    className="cursor-pointer p-2"
                >
                    <MailIcon />
                    {userRowMenu.message}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    disabled={pending}
                    onClick={() =>
                        onSetStatus(suspended ? "ACTIVE" : "SUSPENDED")
                    }
                    className={
                        suspended
                            ? "cursor-pointer p-2"
                            : "cursor-pointer p-2 text-destructive [&_svg]:text-destructive"
                    }
                >
                    {suspended ? <CircleCheckIcon /> : <XIcon />}
                    {suspended ? userRowMenu.reactivate : userRowMenu.suspend}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export { UserRowActions };
