"use client";

import * as React from "react";
import { CircleUserRoundIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { uploadAvatar } from "@/lib/actions/profile";
import { AVATAR_MIME_TYPES } from "@/lib/config/settings";

function AvatarUpload({ image, name }: { image: string | null; name: string }) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [pending, startTransition] = React.useTransition();

    function onPick(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        const formData = new FormData();
        formData.set("image", file);

        startTransition(async () => {
            const result = await uploadAvatar(formData);
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
        });
    }

    return (
        <div className="flex items-center gap-5">
            <Avatar className="size-18">
                {image ? <AvatarImage src={image} alt={name} /> : null}
                <AvatarFallback>
                    <CircleUserRoundIcon
                        className="size-8 text-subtle-foreground"
                        aria-hidden="true"
                    />
                </AvatarFallback>
                {pending ? (
                    <span className="absolute inset-0 grid place-items-center rounded-full bg-card/70">
                        <Spinner className="size-5" />
                    </span>
                ) : null}
            </Avatar>

            <input
                ref={inputRef}
                type="file"
                name="image"
                accept={AVATAR_MIME_TYPES.join(",")}
                onChange={onPick}
                className="sr-only"
                aria-label="Profile picture"
            />
            <Button
                type="button"
                loading={pending}
                onClick={() => inputRef.current?.click()}
                className="h-10 px-5"
            >
                {pending ? "Uploading…" : "Upload Image"}
            </Button>
        </div>
    );
}

export { AvatarUpload };
