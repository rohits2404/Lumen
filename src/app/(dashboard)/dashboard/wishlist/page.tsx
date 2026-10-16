import { Wishlist } from "@/components/dashboard/wishlist";
import { toWishlistEntries } from "@/components/dashboard/wishlist/wishlist-course";
import { getWishlist } from "@/lib/cart";
import React from "react";

const WishlistPage = async () => {
    const { lines, total } = await getWishlist();

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <Wishlist entries={toWishlistEntries(lines)} total={total} />
        </main>
    );
};

export default WishlistPage;
