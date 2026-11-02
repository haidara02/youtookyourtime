"use client";

import Link from "next/link";
import { useCart } from "@payloadcms/plugin-ecommerce/client/react";

import { Media } from "@/components/Media";
import type { Cart } from "@/payload-types";
import { useCartRestoring } from "@/providers/useCartRestoring";
import { cartHasProblems, toCartLine } from "@/utilities/cartLines";
import { formatVND } from "@/utilities/formatPrice";

export function CartView() {
  const { decrementItem, incrementItem, isLoading, removeItem, ...rest } =
    useCart();
  // Shape set by `cartsFetchQuery` in src/providers/Ecommerce.tsx; undefined
  // until a cart exists.
  const cart = rest.cart as Cart | undefined;
  const restoring = useCartRestoring(cart);

  const lines = (cart?.items ?? []).map(toCartLine);

  if (restoring) {
    return (
      <p className="py-24 text-center text-sm text-gray-500">Loading cart…</p>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-2xl font-medium">Your cart is empty</h1>
        <Link
          href="/shop"
          className="mt-6 inline-block text-blue-600 hover:text-blue-800"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const subtotal = lines.reduce(
    (total, line) => total + (line.unitPrice ?? 0) * line.quantity,
    0,
  );
  const hasProblems = cartHasProblems(lines);

  return (
    <div className="grid gap-12 lg:grid-cols-3">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <h1 className="mb-8 text-2xl font-medium">My cart</h1>
        <ul>
          {lines.map((line) => {
            const unavailable = !line.product || line.unitPrice === null;
            const overStock = !unavailable && line.quantity > line.stock;
            return (
              <li key={line.id} className="border-t border-foreground py-6">
                <div className="flex justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="h-24 w-24 shrink-0 bg-gray-100">
                      {line.image ? (
                        <Media
                          resource={line.image}
                          className="relative h-full w-full"
                          imgClassName="object-cover"
                          size="96px"
                          fill
                        />
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium">
                        {line.href && !unavailable ? (
                          <Link href={line.href} className="hover:underline">
                            {line.title}
                          </Link>
                        ) : (
                          line.title
                        )}
                      </h3>
                      <p className="mt-1 text-sm text-gray-400">
                        {formatVND(line.unitPrice) ?? ""}
                      </p>
                      {unavailable ? (
                        <p className="mt-2 text-sm text-brand-red">
                          No longer available. Please remove it to check out.
                        </p>
                      ) : overStock ? (
                        <p className="mt-2 text-sm text-brand-red">
                          {line.stock === 0
                            ? "Sold out. Please remove it to check out."
                            : `Only ${line.stock} available. Please reduce the quantity.`}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex w-2/5 items-center justify-between gap-6 p-2">
                    {unavailable ? (
                      <span />
                    ) : (
                      <div className="flex items-center border border-gray-300">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${line.title}`}
                          disabled={isLoading}
                          onClick={() => void decrementItem(line.id)}
                          className="px-2 py-1 disabled:text-gray-300"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${line.title}`}
                          disabled={isLoading || line.quantity >= line.stock}
                          onClick={() => void incrementItem(line.id)}
                          className="px-2 py-1 disabled:text-gray-300"
                        >
                          +
                        </button>
                      </div>
                    )}
                    <span className="text-sm">
                      {unavailable
                        ? ""
                        : formatVND((line.unitPrice ?? 0) * line.quantity)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${line.title}`}
                      disabled={isLoading}
                      onClick={() => void removeItem(line.id)}
                      className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="rounded-lg p-6">
          <h2 className="mb-6 text-lg font-medium">Order summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatVND(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span>Calculated at checkout</span>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <div className="flex justify-between text-lg font-medium">
              <span>Total</span>
              <span>{formatVND(subtotal)}</span>
            </div>
          </div>

          {hasProblems ? (
            <>
              <button
                type="button"
                disabled
                className="mt-6 w-full cursor-not-allowed rounded bg-gray-300 py-3 text-white"
              >
                Checkout
              </button>
              <p className="mt-4 text-center text-xs text-brand-red">
                Please fix the items marked above to check out.
              </p>
            </>
          ) : (
            <>
              <Link
                href="/checkout"
                className="mt-6 block w-full rounded bg-blue-600 py-3 text-center text-white transition-colors hover:bg-blue-700"
              >
                Checkout
              </Link>
              <p className="mt-4 text-center text-xs text-gray-600">
                🔒 Secure Checkout
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
