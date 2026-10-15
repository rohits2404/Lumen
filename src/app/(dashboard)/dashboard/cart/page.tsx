import { Cart } from "@/components/dashboard/cart";
import { getCart } from "@/lib/cart";
import React from "react";

const CartPage = async () => {
    const summary = await getCart();

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <Cart summary={summary} />
        </main>
    );
};

export default CartPage;
