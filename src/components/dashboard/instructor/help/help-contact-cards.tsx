import { Button } from "@/components/ui/button";
import { instructorHelpCopy } from "@/lib/config/instructor-help";
import { instructorNav } from "@/lib/config/instructor-nav";
import { MessagesSquareIcon, SendIcon } from "lucide-react";
import Link from "next/link";

const discussionsRow = instructorNav
    .flatMap((group) => group.items)
    .find((item) => item.href === "/dashboard/instructor/discussions");

function HelpContactCards({ supportEmail }: { supportEmail: string }) {
    const { support, community } = instructorHelpCopy;
    const discussionsHref = discussionsRow?.href ?? "/dashboard/instructor";
    const discussionsBuilt = discussionsRow?.built ?? false;
    const mailto = `mailto:${supportEmail}?subject=${encodeURIComponent(support.subject)}`;

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-6">
                <h3 className="text-base leading-none">{support.title}</h3>
                <p className="mt-3.5 text-sm leading-5 text-muted-foreground">
                    {support.description}
                </p>
                <Button
                    nativeButton={false}
                    className="mt-4 h-10 gap-2 px-4.5 text-sm font-semibold"
                    render={<a href={mailto} />}
                >
                    <SendIcon className="size-4.5" />
                    {support.action}
                </Button>
            </div>

            <div className="rounded-xl border bg-card p-6">
                <h3 className="text-base leading-none">{community.title}</h3>
                <p className="mt-3.5 text-sm leading-5 text-muted-foreground">
                    {community.description}
                </p>
                {discussionsBuilt ? (
                    <Button
                        variant="outline"
                        nativeButton={false}
                        className="mt-4 h-10 gap-2 px-4.5 text-sm font-semibold"
                        render={<Link href={discussionsHref} />}
                    >
                        <MessagesSquareIcon className="size-4.5" />
                        {community.action}
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        disabled
                        title={community.unavailable}
                        className="mt-4 h-10 gap-2 px-4.5 text-sm font-semibold"
                    >
                        <MessagesSquareIcon className="size-4.5" />
                        {community.action}
                    </Button>
                )}
            </div>
        </div>
    );
}

export { HelpContactCards };
