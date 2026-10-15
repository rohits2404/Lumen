"use client";

import { BadgeCheckIcon, DownloadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    certificatePreviewCopy,
    linkedInAddToProfileUrl,
} from "@/lib/config/certificates";
import type { PublicCertificate } from "@/lib/certificates";

function CertificatePageActions({
    row,
    onDownload,
    pending,
}: {
    row: PublicCertificate;
    onDownload: () => void;
    pending: boolean;
}) {
    return (
        <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            <Button
                type="button"
                onClick={onDownload}
                loading={pending}
                className="h-11 gap-2 px-5"
            >
                <DownloadIcon className="size-4" />
                {certificatePreviewCopy.download}
            </Button>
            <Button
                nativeButton={false}
                variant="outline"
                render={
                    <a
                        href={linkedInAddToProfileUrl(row)}
                        target="_blank"
                        rel="noopener noreferrer"
                    />
                }
                className="h-11 gap-2 bg-card px-5 shadow-sm"
            >
                <BadgeCheckIcon className="size-4" />
                {certificatePreviewCopy.linkedIn}
            </Button>
        </div>
    );
}

export { CertificatePageActions };
