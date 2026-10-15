import { Certificates } from "@/components/dashboard/certificates";
import { getCertificatesPage } from "@/lib/certificates";
import { notFound } from "next/navigation";
import React from "react";

const CertificatePage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const params = await searchParams;
    const raw = Array.isArray(params.page) ? params.page[0] : params.page;
    const parsed = Number(raw);
    const page = await getCertificatesPage(
        Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1,
    );
    if (!page) notFound();

    return <Certificates page={page} />;
};

export default CertificatePage;
