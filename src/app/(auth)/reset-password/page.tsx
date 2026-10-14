import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import React from "react";

const ResetPasswordPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ token?: string; error?: string }>;
}) => {
    const { token, error } = await searchParams;

    return <ResetPasswordForm token={token} linkError={error} />;
};

export default ResetPasswordPage;
