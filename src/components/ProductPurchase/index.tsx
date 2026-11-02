"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@payloadcms/plugin-ecommerce/client/react";

import { formatVND } from "@/utilities/formatPrice";

type Props = {
  productID: string;
  price: number | null;
  inventory: number;
};

type Status = "idle" | "pending" | "added" | "error";

const idOf = (value: unknown): string | undefined =>
  typeof value === "string"
    ? value
    : value && typeof value === "object" && "id" in value
      ? String((value as { id: unknown }).id)
      : undefined;

/**
 * Price + add-to-cart. Most pieces are one-offs (stock of 1), so the
 * quantity stepper only appears when there's more than one available.
 */
export function ProductPurchase({ productID, price, inventory }: Props) {
  const { addItem, cart, isLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<Status>("idle");
  // How many were in the cart when the add started.
  const [inCartBefore, setInCartBefore] = useState(0);

  const inCart = useMemo(
    () =>
      cart?.items?.reduce(
        (total, item) =>
          idOf(item.product) === productID ? total + item.quantity : total,
        0,
      ) ?? 0,
    [cart, productID],
  );
  const available = Math.max(inventory - inCart, 0);
  const clampedQuantity = Math.min(
    Math.max(quantity, 1),
    Math.max(available, 1),
  );

  // addItem() swallows request errors, so once it stops loading, check
  // whether the cart actually gained the item.
  useEffect(() => {
    if (status !== "pending" || isLoading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to the cart request finishing
    setStatus(inCart > inCartBefore ? "added" : "error");
    if (inCart > inCartBefore) setQuantity(1);
  }, [status, isLoading, inCart, inCartBefore]);

  const soldOut = inventory <= 0;
  const unavailable = price === null;

  let buttonLabel = "Add to cart";
  if (unavailable) buttonLabel = "Unavailable";
  else if (soldOut) buttonLabel = "Sold out";
  else if (available <= 0) buttonLabel = "In your cart";
  else if (status === "pending") buttonLabel = "Adding…";

  const canAdd =
    !unavailable &&
    available > 0 &&
    !isLoading &&
    status !== "pending";

  const handleAdd = () => {
    if (!canAdd) return;
    // Set in the same batch as addItem's own isLoading=true, so the effect
    // above never sees "pending" before the request has started.
    setInCartBefore(inCart);
    setStatus("pending");
    void addItem({ product: productID }, clampedQuantity);
  };

  return (
    <div>
      <p className="mt-2 text-lg text-muted-foreground">
        {soldOut ? "Sold out" : (formatVND(price) ?? "")}
      </p>

      <div className="mt-6 flex items-stretch gap-3">
        {available > 1 ? (
          <div className="flex items-center border border-gray-300">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={clampedQuantity <= 1}
              onClick={() => setQuantity(clampedQuantity - 1)}
              className="px-3 py-2 disabled:text-gray-300"
            >
              −
            </button>
            <span className="w-8 text-center text-sm" aria-live="polite">
              {clampedQuantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={clampedQuantity >= available}
              onClick={() => setQuantity(clampedQuantity + 1)}
              className="px-3 py-2 disabled:text-gray-300"
            >
              +
            </button>
          </div>
        ) : null}
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="flex-1 rounded bg-blue-600 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {buttonLabel}
        </button>
      </div>

      <p className="mt-3 min-h-5 text-sm" aria-live="polite">
        {status === "added" || (status === "idle" && available <= 0 && inCart > 0) ? (
          <>
            {status === "added" ? "Added to cart." : "This piece is in your cart."}{" "}
            <Link href="/cart" className="text-blue-600 hover:text-blue-800">
              View cart
            </Link>
          </>
        ) : status === "error" ? (
          <span className="text-brand-red">
            Couldn&apos;t add to cart. Please try again.
          </span>
        ) : null}
      </p>
    </div>
  );
}
