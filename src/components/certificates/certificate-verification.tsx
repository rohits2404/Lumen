import { BadgeCheckIcon } from "lucide-react";
import { CertificatePanel } from "@/components/certificates/certificate-panel";
import { verificationCopy } from "@/lib/config/certificates";
import type { PublicCertificate } from "@/lib/certificates";

function CertificateVerification({ row }: { row: PublicCertificate }) {
    return (
        <main className="mx-auto w-full max-w-252 px-6 py-12 md:py-16">
            <div className="flex flex-wrap items-center gap-2.5 print:hidden">
                <BadgeCheckIcon className="size-5 text-success" />
                <h1 className="text-2xl font-bold">
                    {verificationCopy.heading}
                </h1>
            </div>
            <p className="mt-2 text-[15px] text-muted-foreground print:hidden">
                {verificationCopy.lead}
            </p>

            <CertificatePanel row={row} />
        </main>
    );
}

export { CertificateVerification };
