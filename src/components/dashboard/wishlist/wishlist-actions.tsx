"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { HeartIcon, ShoppingCartIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { addToCart, addWishlistToCart } from "@/lib/actions/cart";
import { removeFromWishlist } from "@/lib/actions/wishlist";

function RemoveFromWishlistButton({
    slug,
    title,
}: {
    slug: string;
    title: string;
}) {
    const [pending, startTransition] = React.useTransition();

    return (
        <Button
            variant="outline"
            size="icon"
            aria-label={`Remove ${title} from your wishlist`}
            loading={pending}
            onClick={() =>
                startTransition(async () => {
                    const result = await removeFromWishlist(slug);
                    toast.add({
                        title: result.message,
                        type: result.ok ? "success" : "error",
                    });
                })
            }
            className="size-10 bg-card"
        >
            <HeartIcon className="size-4.5 text-destructive" />
        </Button>
    );
}

function EnrollNowButton({ slug }: { slug: string }) {
    const router = useRouter();
    const [pending, startTransition] = React.useTransition();

    return (
        <Button
            loading={pending}
            onClick={() =>
                startTransition(async () => {
                    const result = await addToCart(slug);
                    if (!result.ok) {
                        toast.add({ title: result.message, type: "error" });
                        return;
                    }
                    router.push("/checkout");
                })
            }
            className="h-10 gap-2 px-4.5 text-sm font-semibold"
        >
            Enroll Now
        </Button>
    );
}

function AddAllToCartButton() {
    const [pending, startTransition] = React.useTransition();

    return (
        <Button
            loading={pending}
            onClick={() =>
                startTransition(async () => {
                    const result = await addWishlistToCart();
                    toast.add({
                        title: result.message,
                        type: result.ok ? "success" : "error",
                    });
                })
            }
            className="h-10 gap-2 px-4.5 text-sm font-semibold"
        >
            <ShoppingCartIcon className="size-4" />
            Add All To Cart
        </Button>
    );
}

export { AddAllToCartButton, EnrollNowButton, RemoveFromWishlistButton };
