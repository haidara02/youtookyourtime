"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@payloadcms/plugin-ecommerce/client/react";

import { cn } from "@/utilities/cn";
import { formatVND } from "@/utilities/formatPrice";

export type PurchaseOptionGroup = {
  id: string;
  label: string;
  options: { id: string; label: string }[];
};

export type PurchaseVariant = {
  id: string;
  optionIDs: string[];
  price: number | null;
  inventory: number;
};

type Props = {
  productID: string;
  /** Used when the product has no variants. */
  price: number | null;
  /** Used when the product has no variants. */
  inventory: number;
  optionGroups: PurchaseOptionGroup[];
  variants: PurchaseVariant[];
};

type Status = "idle" | "pending" | "added" | "error";

const idOf = (value: unknown): string | undefined =>
  typeof value === "string"
    ? value
    : value && typeof value === "object" && "id" in value
      ? String((value as { id: unknown }).id)
      : undefined;

export function ProductPurchase({
  productID,
  price,
  inventory,
  optionGroups,
  variants,
}: Props) {
  const { addItem, cart, isLoading } = useCart();
  const hasVariants = optionGroups.length > 0;

  // Preselect any option that's the only choice in its group (e.g. one colour).
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      optionGroups
        .filter((group) => group.options.length === 1)
        .map((group) => [group.id, group.options[0].id]),
    ),
  );
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<Status>("idle");
  // How many of this item were in the cart when the add started.
  const [inCartBefore, setInCartBefore] = useState(0);

  const selectionComplete = optionGroups.every((group) => selected[group.id]);

  const selectedVariant = useMemo(
    () =>
      hasVariants && selectionComplete
        ? variants.find((variant) =>
            optionGroups.every((group) =>
              variant.optionIDs.includes(selected[group.id]),
            ),
          )
        : undefined,
    [hasVariants, selectionComplete, variants, optionGroups, selected],
  );

  const currentPrice = hasVariants ? (selectedVariant?.price ?? null) : price;
  const stock = hasVariants ? (selectedVariant?.inventory ?? 0) : inventory;

  const inCart = useMemo(
    () =>
      cart?.items?.reduce((total, item) => {
        const sameProduct = idOf(item.product) === productID;
        const sameVariant = idOf(item.variant) === selectedVariant?.id;
        return sameProduct && sameVariant ? total + item.quantity : total;
      }, 0) ?? 0,
    [cart, productID, selectedVariant],
  );
  const available = Math.max(stock - inCart, 0);

  // addItem() swallows request errors, so once it stops loading, check
  // whether the cart actually gained the item.
  useEffect(() => {
    if (status !== "pending" || isLoading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to the cart request finishing
    setStatus(inCart > inCartBefore ? "added" : "error");
    if (inCart > inCartBefore) setQuantity(1);
  }, [status, isLoading, inCart, inCartBefore]);

  // Keep the chosen quantity within what's still available.
  const clampedQuantity = Math.min(Math.max(quantity, 1), Math.max(available, 1));

  const priceLabel = (() => {
    if (!hasVariants || selectedVariant) return formatVND(currentPrice);
    const prices = variants
      .map((variant) => variant.price)
      .filter((value): value is number => value !== null);
    if (prices.length === 0) return null;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? formatVND(min) : `From ${formatVND(min)}`;
  })();

  const optionAvailable = (groupID: string, optionID: string) =>
    variants.some(
      (variant) =>
        variant.inventory > 0 &&
        variant.optionIDs.includes(optionID) &&
        optionGroups.every(
          (group) =>
            group.id === groupID ||
            !selected[group.id] ||
            variant.optionIDs.includes(selected[group.id]),
        ),
    );

  const missingGroup = optionGroups.find((group) => !selected[group.id]);
  const unavailable =
    (hasVariants && selectionComplete && !selectedVariant) ||
    (!missingGroup && currentPrice === null);

  let buttonLabel = "Add to cart";
  if (missingGroup) buttonLabel = `Select ${missingGroup.label.toLowerCase()}`;
  else if (unavailable) buttonLabel = "Unavailable";
  else if (stock <= 0) buttonLabel = "Out of stock";
  else if (available <= 0) buttonLabel = "All in your cart";
  else if (status === "pending") buttonLabel = "Adding…";

  const canAdd =
    !missingGroup &&
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
    void addItem(
      { product: productID, variant: selectedVariant?.id },
      clampedQuantity,
    );
  };

  return (
    <div>
      <p className="mt-2 text-lg text-muted-foreground">
        {stock <= 0 && (!hasVariants || selectedVariant)
          ? "Out of stock"
          : (priceLabel ?? "")}
      </p>

      {optionGroups.map((group) => (
        <fieldset key={group.id} className="mt-6">
          <legend className="mb-2 text-sm font-medium">
            {group.label}
            {selected[group.id] ? (
              <span className="ml-2 font-normal text-gray-500">
                {group.options.find((o) => o.id === selected[group.id])?.label}
              </span>
            ) : null}
          </legend>
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => {
              const isSelected = selected[group.id] === option.id;
              const isAvailable = optionAvailable(group.id, option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelected((prev) => ({ ...prev, [group.id]: option.id }));
                    setStatus("idle");
                  }}
                  className={cn(
                    "min-w-12 border px-3 py-2 text-sm transition-colors",
                    isSelected
                      ? "border-foreground bg-foreground text-background"
                      : "border-gray-300 hover:border-foreground",
                    !isAvailable && !isSelected && "text-gray-400 line-through",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="mt-6 flex items-stretch gap-3">
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
        {status === "added" ? (
          <>
            Added to cart.{" "}
            <Link href="/cart" className="text-blue-600 hover:text-blue-800">
              View cart
            </Link>
          </>
        ) : status === "error" ? (
          <span className="text-brand-red">
            Couldn&apos;t add to cart. Please try again.
          </span>
        ) : stock > 0 && available > 0 && available <= 5 ? (
          <span className="text-gray-500">Only {available} left</span>
        ) : null}
      </p>
    </div>
  );
}
