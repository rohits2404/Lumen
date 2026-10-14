import { GlobalErrorForm } from "@/components/global/global-error-form";
import React from "react";

const GlobalErrorPage = ({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) => {
    return <GlobalErrorForm error={error} reset={reset} />;
};

export default GlobalErrorPage;
