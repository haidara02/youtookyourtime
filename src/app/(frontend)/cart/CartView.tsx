"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useCart } from "@payloadcms/plugin-ecommerce/client/react";

import { Media } from "@/components/Media";
import type {
  Cart,
  Media as MediaDoc,
  Product,
  Variant,
} from "@/payload-types";
import { formatVND } from "@/utilities/formatPrice";

type Line = {
  id: string;
  quantity: number;
  /** null when the product was unpublished/deleted after being added. */
  product: Product | null;
  title: string;
  href?: string;
  image?: MediaDoc;
  optionsLabel?: string;
  unitPrice: number | null;
  stock: number;
};

const toLine = (item: NonNullable<Cart["items"]>[number]): Line => {
  // Relationships the visitor can't read (e.g. an unpublished product) come
  // back as bare IDs instead of populated docs.
  const product =
    item.product && typeof item.product === "object" ? item.product : null;
  const variant: Variant | null =
    item.variant && typeof item.variant === "object" ? item.variant : null;
  const variantRemoved = Boolean(item.variant) && !variant;

  const optionIDs =
    variant?.options.map((o) => (typeof o === "object" ? o.id : o)) ?? [];
  const optionsLabel =
    variant?.options
      .map((o) => (typeof o === "object" ? o.label : null))
      .filter(Boolean)
      .join(" / ") || undefined;

  // Prefer a gallery image tagged with one of this variant's options.
  const gallery = product?.gallery ?? [];
  const galleryItem =
    gallery.find((g) => {
      const optionID =
        g.variantOption && typeof g.variantOption === "object"
          ? g.variantOption.id
          : g.variantOption;
      return optionID && optionIDs.includes(optionID);
    }) ?? gallery[0];
  const image =
    galleryItem?.image && typeof galleryItem.image === "object"
      ? galleryItem.image
      : undefined;

  const available = Boolean(product) && !variantRemoved;

  return {
    id: item.id ?? "",
    quantity: item.quantity,
    product: available ? product : null,
    title: product?.title ?? "Unavailable item",
    href: product?.slug ? `/products/${product.slug}` : undefined,
    image,
    optionsLabel,
    unitPrice: available
      ? ((variant ? variant.priceInVND : product?.priceInVND) ?? null)
      : null,
    stock: available ? ((variant ? variant.inventory : product?.inventory) ?? 0) : 0,
  };
};

// The plugin restores a saved cart asynchronously and exposes no "loading"
// flag for it. It keeps the cart ID in localStorage (removing it if the cart
// can't be fetched), so "ID stored but no cart yet" means "still restoring".
// Polled because same-tab localStorage writes don't fire events.
const subscribeToStoredCart = (onChange: () => void) => {
  const interval = window.setInterval(onChange, 500);
  return () => window.clearInterval(interval);
};
const hasStoredCart = () => localStorage.getItem("cart") !== null;

export function CartView() {
  const { decrementItem, incrementItem, isLoading, removeItem, ...rest } =
    useCart();
  // Shape set by `cartsFetchQuery` in src/providers/Ecommerce.tsx; undefined
  // until a cart exists.
  const cart = rest.cart as Cart | undefined;
  const storedCart = useSyncExternalStore(
    subscribeToStoredCart,
    hasStoredCart,
    () => true, // server render: assume there may be a cart to restore
  );

  const lines = (cart?.items ?? []).map(toLine);

  if (!cart && storedCart) {
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
  const hasProblems = lines.some(
    (line) =>
      !line.product || line.unitPrice === null || line.quantity > line.stock,
  );

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
                      {line.optionsLabel ? (
                        <p className="mt-1 text-sm text-gray-500">
                          {line.optionsLabel}
                        </p>
                      ) : null}
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
