"use client";

import * as React from "react";
import { DownloadIcon, Share2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { CertificatePreviewDialog } from "@/components/certificates/certificate-preview-dialog";
import { certificatesCopy } from "@/lib/config/certificates";
import type { CertificateRow } from "@/lib/certificates";

function CertificateActions({ row }: { row: CertificateRow }) {
    const [sharing, setSharing] = React.useState(false);
    const [preview, setPreview] = React.useState(false);

    async function share() {
        const url = new URL(
            `/certificates/${row.publicSlug}`,
            window.location.origin,
        ).toString();
        setSharing(true);
        try {
            if (typeof navigator.share === "function") {
                await navigator.share({ title: row.courseTitle, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            toast.add({ title: certificatesCopy.shareCopied, type: "success" });
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError")
                return;
            toast.add({ title: certificatesCopy.shareFailed, type: "error" });
        } finally {
            setSharing(false);
        }
    }

    return (
        <div className="flex shrink-0 items-center gap-2.5">
            <Button
                type="button"
                variant="outline"
                size="icon"
                loading={sharing}
                onClick={share}
                aria-label={certificatesCopy.share}
                title={certificatesCopy.share}
                className="size-9.5 bg-card shadow-sm"
            >
                <Share2Icon className="size-4" />
            </Button>
            <Button
                type="button"
                onClick={() => setPreview(true)}
                className="h-9.5 gap-2 px-4"
            >
                <DownloadIcon className="size-4" />
                {certificatesCopy.pdf}
            </Button>

            <CertificatePreviewDialog
                row={row}
                open={preview}
                onOpenChange={setPreview}
            />
        </div>
    );
}

export { CertificateActions };
