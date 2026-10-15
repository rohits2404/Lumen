"use client";

import { BadgeCheckIcon, DownloadIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCertificateDownload } from "@/components/certificates/use-certificate-download";
import { CertificateSheet } from "@/components/certificates/certificate-sheet";
import {
    certificatePreviewCopy,
    linkedInAddToProfileUrl,
} from "@/lib/config/certificates";
import type { PublicCertificate } from "@/lib/certificates";

function CertificatePreviewDialog({
    row,
    open,
    onOpenChange,
}: {
    row: PublicCertificate;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { ref, pending, download } = useCertificateDownload(row);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="w-[min(960px,94vw)] max-w-none gap-0 border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-none"
            >
                <DialogTitle className="sr-only text-black">
                    {certificatePreviewCopy.title}
                </DialogTitle>

                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <p className="text-[15px] font-medium text-black drop-shadow-sm">
                        {certificatePreviewCopy.title}
                    </p>
                    <div className="flex items-center gap-2.5">
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
                            className="h-11 gap-2 bg-card px-4 shadow-sm"
                        >
                            <BadgeCheckIcon className="size-4" />
                            {certificatePreviewCopy.linkedIn}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={download}
                            loading={pending}
                            className="h-11 gap-2 bg-card px-4 shadow-sm"
                        >
                            <DownloadIcon className="size-4" />
                            {certificatePreviewCopy.download}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => onOpenChange(false)}
                            aria-label={certificatePreviewCopy.close}
                            className="size-11 bg-card shadow-sm"
                        >
                            <XIcon className="size-4" />
                        </Button>
                    </div>
                </div>

                <CertificateSheet
                    row={row}
                    documentRef={ref}
                    className="rounded-xl shadow-2xl print:rounded-none print:shadow-none"
                />
            </DialogContent>
        </Dialog>
    );
}

export { CertificatePreviewDialog };
