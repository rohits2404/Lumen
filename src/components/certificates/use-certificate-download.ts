"use client";

import * as React from "react";

import { toast } from "@/components/ui/toast";
import {
    DOC_HEIGHT,
    DOC_WIDTH,
} from "@/components/certificates/certificate-sheet";
import {
    CERTIFICATE_GROUND,
    certificateDownload,
} from "@/lib/config/certificates";
import type { PublicCertificate } from "@/lib/certificates";

function useCertificateDownload(row: PublicCertificate) {
    const ref = React.useRef<HTMLDivElement>(null);
    const [pending, setPending] = React.useState(false);

    const download = React.useCallback(async () => {
        const node = ref.current;
        if (!node || pending) return;

        setPending(true);
        try {
            const { domToPng } = await import("modern-screenshot");
            const dataUrl = await domToPng(node, {
                width: DOC_WIDTH,
                height: DOC_HEIGHT,
                scale: 2,
                backgroundColor: CERTIFICATE_GROUND,
            });

            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = certificateDownload.fileName(row.serial);
            link.click();
        } catch {
            toast.add({ title: certificateDownload.failed, type: "error" });
        } finally {
            setPending(false);
        }
    }, [pending, row.serial]);

    return { ref, pending, download };
}

export { useCertificateDownload };
