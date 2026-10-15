import { CertificateVerification } from "@/components/certificates/certificate-verification";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { getPublicCertificate } from "@/lib/certificates";
import { verificationCopy } from "@/lib/config/certificates";
import { AwardIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    const row = await getPublicCertificate(slug);

    if (!row) {
        return (
            <main className="mx-auto w-full max-w-220 px-6 py-20">
                <Empty className="rounded-xl bg-card py-16 ring-1 ring-border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <AwardIcon />
                        </EmptyMedia>
                        <EmptyTitle>
                            {verificationCopy.notFoundTitle}
                        </EmptyTitle>
                        <EmptyDescription>
                            {verificationCopy.notFoundDescription}
                        </EmptyDescription>
                    </EmptyHeader>
                    <Button
                        nativeButton={false}
                        render={<Link href="/dashboard/courses" />}
                        className="h-10 px-5"
                    >
                        {verificationCopy.browse}
                    </Button>
                </Empty>
            </main>
        );
    }

    return <CertificateVerification row={row} />;
};

export default Page;
