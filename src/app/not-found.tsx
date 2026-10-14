import { HomeButton, StatusPage } from "@/components/shared/status-page";
import React from "react";

const NotFoundPage = () => {
    return (
        <StatusPage
            code="404"
            title="Page Not Found"
            description="The Page You're Looking For Doesn't Exist."
        >
            <HomeButton />
            <HomeButton href="/" label="Go To Homepage" variant="outline" />
        </StatusPage>
    );
};

export default NotFoundPage;
