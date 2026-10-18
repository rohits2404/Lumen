"use client";

import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { LogoMark } from "@/components/shared/logo";
import { uploadBrandingAsset } from "@/lib/actions/admin-settings";
import {
    BRANDING_MIME_TYPES,
    platformControlsCopy,
    type BrandingAssetKind,
} from "@/lib/config/admin-settings";

function BrandingUpload({ logoUrl }: { logoUrl: string | null }) {
    const logoInput = React.useRef<HTMLInputElement>(null);
    const faviconInput = React.useRef<HTMLInputElement>(null);
    const [busy, setBusy] = React.useState<BrandingAssetKind | null>(null);
    const [, startUploading] = React.useTransition();

    function onPick(kind: BrandingAssetKind) {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;

            const formData = new FormData();
            formData.set("kind", kind);
            formData.set("file", file);

            setBusy(kind);
            startUploading(async () => {
                const result = await uploadBrandingAsset(formData);
                toast.add({
                    title: result.message,
                    type: result.ok ? "success" : "error",
                });
                setBusy(null);
            });
        };
    }

    return (
        <div className="flex flex-wrap items-center gap-3.5">
            <Avatar className="size-14 shrink-0 rounded-xl">
                {logoUrl ? (
                    <AvatarImage
                        src={logoUrl}
                        alt="Platform logo"
                        className="object-contain"
                    />
                ) : null}
                <AvatarFallback className="rounded-xl bg-transparent">
                    <LogoMark className="size-14 rounded-xl [&>svg]:size-6" />
                </AvatarFallback>
                {busy === "logo" ? (
                    <span className="absolute inset-0 grid place-items-center rounded-xl bg-card/70">
                        <Spinner className="size-5" />
                    </span>
                ) : null}
            </Avatar>

            <input
                ref={logoInput}
                type="file"
                accept={BRANDING_MIME_TYPES.join(",")}
                onChange={onPick("logo")}
                className="sr-only"
                aria-label={platformControlsCopy.uploadLogo}
            />
            <Button
                type="button"
                loading={busy === "logo"}
                onClick={() => logoInput.current?.click()}
                className="h-10 px-5"
            >
                {platformControlsCopy.uploadLogo}
            </Button>

            <input
                ref={faviconInput}
                type="file"
                accept={BRANDING_MIME_TYPES.join(",")}
                onChange={onPick("favicon")}
                className="sr-only"
                aria-label={platformControlsCopy.uploadFavicon}
            />
            <Button
                type="button"
                variant="outline"
                loading={busy === "favicon"}
                onClick={() => faviconInput.current?.click()}
                className="h-10 bg-card px-5 shadow-sm"
            >
                {platformControlsCopy.uploadFavicon}
            </Button>
        </div>
    );
}

export { BrandingUpload };
