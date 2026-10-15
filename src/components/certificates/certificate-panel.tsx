"use client";

import { CertificatePageActions } from "@/components/certificates/certificate-page-actions";
import { CertificateSheet } from "@/components/certificates/certificate-sheet";
import { useCertificateDownload } from "@/components/certificates/use-certificate-download";
import { verificationCopy } from "@/lib/config/certificates";
import type { PublicCertificate } from "@/lib/certificates";

function CertificatePanel({ row }: { row: PublicCertificate }) {
    const { ref, pending, download } = useCertificateDownload(row);

    return (
        <>
            <CertificateSheet
                row={row}
                documentRef={ref}
                className="mt-6 rounded-xl ring-1 ring-border print:mt-0 print:rounded-none print:ring-0"
            />

            <div className="mt-7">
                <CertificatePageActions
                    row={row}
                    onDownload={download}
                    pending={pending}
                />
                <p className="mt-2.5 text-[13px] text-muted-foreground print:hidden">
                    {verificationCopy.printHint}
                </p>
            </div>
        </>
    );
}

export { CertificatePanel };
