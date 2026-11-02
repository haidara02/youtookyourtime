import type { Metadata } from "next";

import { CartView } from "./CartView";

export const metadata: Metadata = {
  title: "Cart | You Took Your Time",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <CartView />
      <div className="mt-12 border-t pt-8">
        <p className="mb-4 text-center text-3xl font-bold text-foreground">
          To pick up an order In Store - Select your preferred store from the
          shipping menu
        </p>
      </div>
    </div>
  );
}
