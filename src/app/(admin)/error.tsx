"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { StatusPage, HomeButton } from "@/components/shared/status-page";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    React.useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <StatusPage
            title="This Page Couldn't Be Loaded"
            description="Something Went Wrong Reading The Platform Data. Trying Again Often Fixes It — If It Doesn't, The Error Reference Below Will Be In The Server Logs."
            className="min-h-[70vh]"
        >
            <Button onClick={reset} className="h-10 px-5">
                Try Again
            </Button>
            <HomeButton
                href="/dashboard/admin"
                label="Back to console"
                variant="outline"
            />
            {error.digest ? (
                <p className="mt-3 w-full text-[13px] text-subtle-foreground">
                    Error Reference:{" "}
                    <span className="font-mono">{error.digest}</span>
                </p>
            ) : null}
        </StatusPage>
    );
}
