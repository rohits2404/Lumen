"use client";

import * as React from "react";

import { CertificateDocument } from "@/components/certificates/certificate-document";
import type { PublicCertificate } from "@/lib/certificates";
import { cn } from "@/lib/utils";

const DOC_WIDTH = 960;
const DOC_HEIGHT = 679;

function CertificateSheet({
    row,
    className,
    documentRef,
}: {
    row: PublicCertificate;
    className?: string;
    documentRef?: React.Ref<HTMLDivElement>;
}) {
    const host = React.useRef<HTMLDivElement>(null);
    const [scale, setScale] = React.useState(1);

    React.useEffect(() => {
        const element = host.current;
        if (!element) return;
        const observer = new ResizeObserver(([entry]) => {
            const width = entry?.contentRect.width ?? DOC_WIDTH;
            setScale(Math.min(1, width / DOC_WIDTH));
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={host} data-certificate-print-host className="w-full min-w-0">
            <div
                data-certificate-print-host
                className={cn("overflow-hidden", className)}
                style={{ width: DOC_WIDTH * scale, height: DOC_HEIGHT * scale }}
            >
                <div
                    data-certificate-print-host
                    className="origin-top-left"
                    style={{ transform: `scale(${scale})` }}
                >
                    <CertificateDocument row={row} ref={documentRef} />
                </div>
            </div>
        </div>
    );
}

export { CertificateSheet, DOC_HEIGHT, DOC_WIDTH };
