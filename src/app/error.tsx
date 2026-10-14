import { AppErrorForm } from "@/components/global/error-form";
import React from "react";

const AppErrorPage = ({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) => {
    return <AppErrorForm error={error} reset={reset} />;
};

export default AppErrorPage;
