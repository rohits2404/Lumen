import type * as React from "react";
import { AwardIcon } from "lucide-react";

import {
    CERTIFICATE_DIRECTOR,
    CERTIFICATE_ISSUER,
    certificateDocumentCopy,
    VERIFY_HOST,
} from "@/lib/config/certificates";
import type { PublicCertificate } from "@/lib/certificates";
import { cn } from "@/lib/utils";

function CertificateDocument({
    row,
    className,
    ref,
}: {
    row: PublicCertificate;
    className?: string;
    ref?: React.Ref<HTMLDivElement>;
}) {
    return (
        <div
            ref={ref}
            data-certificate-print
            className={cn(
                "relative h-169.75 w-240 shrink-0 overflow-hidden bg-[#fbfaf7] font-sans text-[#1a1712] [print-color-adjust:exact]",
                className,
            )}
        >
            <div
                aria-hidden
                className="absolute -top-30 -left-30 size-80 rounded-full bg-[#f0e6e9] [print-color-adjust:exact]"
            />
            <div
                aria-hidden
                className="absolute -right-35.25 -bottom-35.25 size-90.5 rounded-full bg-[#f4e9e5] [print-color-adjust:exact]"
            />

            <div
                aria-hidden
                className="absolute inset-4.5 rounded-[4px] border-2 border-[#845eee] [print-color-adjust:exact]"
            />

            <div className="relative flex h-full flex-col items-center px-28.75 text-center">
                <div className="mt-19.25 flex items-center gap-3">
                    <span className="relative grid size-7.5 shrink-0 place-items-center">
                        <GradientShape rounded />
                        <AwardIcon className="relative size-4 text-white" />
                    </span>
                    <span className="text-[15px] font-bold tracking-[0.16em] uppercase">
                        {CERTIFICATE_ISSUER}
                    </span>
                </div>

                <h1 className="mt-11.5 font-serif text-[47px] leading-none font-bold tracking-[-0.005em]">
                    {certificateDocumentCopy.title}
                </h1>
                <span
                    aria-hidden
                    className="mt-3 block h-0.75 w-16 rounded-full bg-[#845eee] [print-color-adjust:exact]"
                />

                <p className="mt-10.5 text-[13px] font-medium tracking-[0.22em] text-[#5d574c] uppercase">
                    {certificateDocumentCopy.presentedTo}
                </p>
                <p className="mt-4 font-serif text-[48px] leading-none font-bold italic">
                    {row.holderName}
                </p>

                <p className="mt-10 max-w-125 text-[15px] leading-[25.5px] text-[#3b362d]">
                    {certificateDocumentCopy.body.before}
                    <span className="font-semibold">{row.courseTitle}</span>
                    {certificateDocumentCopy.body.middle}
                    {row.instructorName}
                    {certificateDocumentCopy.body.after}
                </p>

                <div className="mt-auto mb-13.5 w-full">
                    <div className="flex items-end justify-between">
                        <Signature
                            name={row.instructorName}
                            role={certificateDocumentCopy.instructor}
                        />

                        <div className="flex translate-y-2.5 flex-col items-center">
                            <span className="relative grid size-18.5 place-items-center">
                                <GradientShape />
                                <AwardIcon className="relative size-8 text-white" />
                            </span>
                            {row.grade ? (
                                <span className="-mt-1 rounded-full bg-[#1a1712] px-2 py-0.5 text-[11px] leading-3 font-bold tracking-[0.08em] text-white uppercase [print-color-adjust:exact]">
                                    {certificateDocumentCopy.grade(row.grade)}
                                </span>
                            ) : null}
                        </div>

                        <Signature
                            name={CERTIFICATE_DIRECTOR}
                            role={certificateDocumentCopy.director}
                        />
                    </div>

                    <div className="mt-3 flex items-center justify-between font-mono text-[13px] tracking-tight text-[#5d574c]">
                        <span>
                            {certificateDocumentCopy.id} {row.serial}
                        </span>
                        <span>
                            {certificateDocumentCopy.issued} {row.issuedOn}
                        </span>
                        <span>{VERIFY_HOST}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GradientShape({ rounded = false }: { rounded?: boolean }) {
    return (
        <svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full [print-color-adjust:exact]"
        >
            <defs>
                <linearGradient
                    id="lumen-cert-gradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                >
                    <stop offset="0%" stopColor="#e7734f" />
                    <stop offset="50%" stopColor="#c0679f" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
            </defs>
            {rounded ? (
                <rect
                    width="100"
                    height="100"
                    rx="27"
                    fill="url(#lumen-cert-gradient)"
                />
            ) : (
                <circle
                    cx="50"
                    cy="50"
                    r="50"
                    fill="url(#lumen-cert-gradient)"
                />
            )}
        </svg>
    );
}

function Signature({ name, role }: { name: string; role: string }) {
    return (
        <div className="flex flex-col items-center">
            <span className="border-b border-[#acaba7] pb-5 font-serif text-[20px] leading-none font-semibold italic">
                {name}
            </span>
            <span className="mt-0.5 text-[12px] font-medium tracking-[0.18em] text-[#5d574c] uppercase">
                {role}
            </span>
        </div>
    );
}

export { CertificateDocument };
