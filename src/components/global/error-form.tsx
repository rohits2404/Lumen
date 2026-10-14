"use client";

import { useEffect } from "react";
import { HomeButton, StatusPage } from "../shared/status-page";
import { Button } from "../ui/button";

export function AppErrorForm({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <StatusPage
            code="500"
            title="Something Went Wrong"
            description="That Page Couldn't Be Loaded. Trying Again Often Fixes It — If It Doesn't, The Error Reference Below Will Be In The Server Logs."
        >
            <Button onClick={reset} className="h-10 px-5">
                Try Again
            </Button>
            <HomeButton variant="outline" />
            {error.digest ? (
                <p className="mt-3 w-full text-[13px] text-subtle-foreground">
                    Error Reference:{" "}
                    <span className="font-mono">{error.digest}</span>
                </p>
            ) : null}
        </StatusPage>
    );
}
