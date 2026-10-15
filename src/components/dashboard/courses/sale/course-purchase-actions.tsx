"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { HeartIcon, Share2Icon, ShoppingCartIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { addToCart } from "@/lib/actions/cart";
import { toggleWishlist } from "@/lib/actions/wishlist";
import { cn } from "@/lib/utils";

function CourseBuyButtons({
    slug,
    unavailable,
}: {
    slug: string;
    unavailable?: string;
}) {
    const router = useRouter();
    const [pending, startTransition] = React.useTransition();
    const [pendingAction, setPendingAction] = React.useState<
        "add" | "buy" | null
    >(null);

    function run(action: "add" | "buy") {
        setPendingAction(action);
        startTransition(async () => {
            const result = await addToCart(slug);

            if (!result.ok) {
                toast.add({ title: result.message, type: "error" });
                setPendingAction(null);
                return;
            }

            if (action === "buy") {
                router.push("/checkout");
                return;
            }

            toast.add({ title: result.message, type: "success" });
            setPendingAction(null);
        });
    }

    return (
        <>
            <Button
                onClick={() => run("add")}
                loading={pendingAction === "add"}
                disabled={pending || unavailable !== undefined}
                className="mt-4.5 h-11 w-full gap-2 text-sm font-semibold shadow-sm"
            >
                <ShoppingCartIcon data-icon="inline-start" />
                Add To Cart
            </Button>
            <Button
                variant="outline"
                onClick={() => run("buy")}
                loading={pendingAction === "buy"}
                disabled={pending || unavailable !== undefined}
                className="mt-2.5 h-11 w-full bg-card text-sm font-semibold shadow-sm"
            >
                Buy Now
            </Button>
            {unavailable ? (
                <p className="mt-2.5 text-center text-[13px] text-muted-foreground">
                    {unavailable}
                </p>
            ) : null}
        </>
    );
}

function CourseSaveButtons({
    slug,
    wishlisted: initialWishlisted,
    wishlistable = true,
}: {
    slug: string;
    wishlisted: boolean;
    wishlistable?: boolean;
}) {
    const [wishlisted, setWishlisted] = React.useState(initialWishlisted);
    const [pending, startTransition] = React.useTransition();

    function onWishlist() {
        setWishlisted((saved) => !saved);
        startTransition(async () => {
            const result = await toggleWishlist(slug);
            setWishlisted(result.wishlisted);
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
        });
    }

    async function onShare() {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({ url });
                return;
            } catch {
                return;
            }
        }
        try {
            await navigator.clipboard.writeText(url);
            toast.add({
                title: "Course Link Copied To Clipboard",
                type: "success",
            });
        } catch {
            toast.add({ title: "Couldn't Copy The Link", type: "error" });
        }
    }

    return (
        <div className="flex gap-2.5">
            <Button
                variant="outline"
                onClick={onWishlist}
                loading={pending}
                disabled={!wishlistable}
                aria-pressed={wishlisted}
                className="h-10 flex-1 gap-1.5 bg-card shadow-sm"
            >
                <HeartIcon
                    data-icon="inline-start"
                    className={cn(
                        "size-4",
                        wishlisted && "fill-destructive text-destructive",
                    )}
                />
                {wishlisted ? "Wishlisted" : "Wishlist"}
            </Button>
            <Button
                variant="outline"
                onClick={onShare}
                className="h-10 flex-1 gap-1.5 bg-card shadow-sm"
            >
                <Share2Icon data-icon="inline-start" className="size-4" />
                Share
            </Button>
        </div>
    );
}

export { CourseBuyButtons, CourseSaveButtons };
