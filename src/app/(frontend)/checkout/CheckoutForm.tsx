"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import {
  useCart,
  useEcommerce,
  usePayments,
} from "@payloadcms/plugin-ecommerce/client/react";

import { Media } from "@/components/Media";
import {
  BANK_TRANSFER,
  type BankTransferCheckoutData,
  type DeliveryMethod,
} from "@/payments/bankTransfer/client";
import type { Cart } from "@/payload-types";
import { useCartRestoring } from "@/providers/useCartRestoring";
import { cartHasProblems, toCartLine } from "@/utilities/cartLines";
import { formatVND } from "@/utilities/formatPrice";

type Props = {
  shippingFee: number;
  pickupLocations: { name: string; address: string }[];
  paymentWindowHours: number;
};

const inputClass =
  "w-full border border-gray-300 px-3 py-2 text-sm focus:border-foreground focus:outline-none";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block">
        {label}
        {hint ? <span className="ml-1 text-gray-500">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

/**
 * Turns a failed initiate/confirm call into something a customer can act on.
 * Our adapter's own messages arrive as plain text; anything else (plugin
 * JSON errors, network failures) gets a generic message.
 */
function toCustomerMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : "";
  try {
    JSON.parse(raw);
  } catch {
    if (raw && raw.length < 300 && !raw.startsWith("<")) return raw;
  }
  if (/stock|inventory|price/i.test(raw)) {
    return "Some items in your cart are no longer available in that quantity. Please review your cart.";
  }
  return "Something went wrong placing your order. Nothing has been charged — please try again.";
}

export function CheckoutForm({
  shippingFee,
  pickupLocations,
  paymentWindowHours,
}: Props) {
  const router = useRouter();
  const cart = useCart().cart as Cart | undefined;
  const { clearSession } = useEcommerce();
  const { initiatePayment, confirmOrder } = usePayments();
  const restoring = useCartRestoring(cart);

  const [email, setEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("ship");
  const [pickupLocationIndex, setPickupLocationIndex] = useState(0);
  const [address, setAddress] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
  });
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set once the order exists, so clearing the cart doesn't flash the
  // empty-cart state before navigation completes.
  const [redirecting, setRedirecting] = useState(false);

  const lines = (cart?.items ?? []).map(toCartLine);

  if (redirecting) {
    return (
      <p className="py-24 text-center text-sm text-gray-500">
        Order placed — taking you to your order…
      </p>
    );
  }

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

  if (cartHasProblems(lines)) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-2xl font-medium">Some items need attention</h1>
        <p className="mt-4 text-sm text-gray-600">
          An item in your cart is sold out, no longer available, or over the
          quantity in stock.
        </p>
        <Link
          href="/cart"
          className="mt-6 inline-block text-blue-600 hover:text-blue-800"
        >
          Review your cart
        </Link>
      </div>
    );
  }

  const isPickup = deliveryMethod === "pickup";
  const subtotal = lines.reduce(
    (total, line) => total + (line.unitPrice ?? 0) * line.quantity,
    0,
  );
  const deliveryFee = isPickup ? 0 : shippingFee;

  const setAddressField =
    (key: keyof typeof address) =>
    (event: { target: { value: string } }) =>
      setAddress((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    const checkout: BankTransferCheckoutData = {
      customerName,
      phone,
      deliveryMethod,
      pickupLocationIndex: isPickup ? pickupLocationIndex : undefined,
      shippingAddress: isPickup ? undefined : address,
      note,
    };

    try {
      const initiated = (await initiatePayment(BANK_TRANSFER, {
        additionalData: { customerEmail: email, ...checkout },
      })) as { transactionID: string };

      const order = (await confirmOrder(BANK_TRANSFER, {
        additionalData: {
          transactionID: initiated.transactionID,
          customerEmail: email,
        },
      })) as { orderID: string; accessToken: string };

      // The cart is now marked purchased server-side; forget it locally so
      // it isn't restored on the next visit.
      setRedirecting(true);
      clearSession();
      router.push(
        `/orders/${order.orderID}?token=${encodeURIComponent(order.accessToken)}`,
      );
    } catch (err) {
      setError(toCustomerMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-12 lg:grid-cols-3">
      <div className="space-y-10 lg:col-span-2">
        <h1 className="text-2xl font-medium">Checkout</h1>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">Contact</h2>
          <Field label="Email">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <input
                required
                autoComplete="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                required
                autoComplete="tel"
                pattern="\+?[0-9 .\-]{8,15}"
                title="8–15 digits"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">Delivery</h2>
          {pickupLocations.length > 0 ? (
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="deliveryMethod"
                  checked={!isPickup}
                  onChange={() => setDeliveryMethod("ship")}
                />
                Delivery — {formatVND(shippingFee)}
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="deliveryMethod"
                  checked={isPickup}
                  onChange={() => setDeliveryMethod("pickup")}
                />
                Pick up in store — free
              </label>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Delivery within Vietnam — {formatVND(shippingFee)}
            </p>
          )}

          {isPickup ? (
            <Field label="Pickup location">
              <select
                value={pickupLocationIndex}
                onChange={(e) => setPickupLocationIndex(Number(e.target.value))}
                className={inputClass}
              >
                {pickupLocations.map((location, index) => (
                  <option key={index} value={index}>
                    {location.name} — {location.address}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <div className="space-y-4">
              <Field label="Street address" hint="(house number, street)">
                <input
                  required
                  autoComplete="address-line1"
                  value={address.addressLine1}
                  onChange={setAddressField("addressLine1")}
                  className={inputClass}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Ward / Commune" hint="(Phường / Xã)">
                  <input
                    required
                    value={address.addressLine2}
                    onChange={setAddressField("addressLine2")}
                    className={inputClass}
                  />
                </Field>
                <Field label="District" hint="(Quận / Huyện, if any)">
                  <input
                    value={address.city}
                    onChange={setAddressField("city")}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Province / City" hint="(Tỉnh / Thành phố)">
                <input
                  required
                  autoComplete="address-level1"
                  value={address.state}
                  onChange={setAddressField("state")}
                  className={inputClass}
                />
              </Field>
            </div>
          )}

          <Field label="Note for the shop" hint="(optional)">
            <textarea
              rows={3}
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={inputClass}
            />
          </Field>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Payment</h2>
          <label className="flex items-start gap-3 border border-foreground p-4 text-sm">
            <input type="radio" checked readOnly className="mt-1" />
            <span>
              <span className="font-medium">Bank transfer (VietQR)</span>
              <span className="mt-1 block text-gray-600">
                After you place your order you&apos;ll get a QR code to scan
                in your banking app. We&apos;ll hold your items for{" "}
                {paymentWindowHours} hours.
              </span>
            </span>
          </label>
        </section>
      </div>

      {/* Order summary */}
      <div className="lg:col-span-1">
        <div className="p-6">
          <h2 className="mb-6 text-lg font-medium">Order summary</h2>
          <ul className="space-y-4">
            {lines.map((line) => (
              <li key={line.id} className="flex gap-3 text-sm">
                <div className="h-16 w-16 shrink-0 bg-gray-100">
                  {line.image ? (
                    <Media
                      resource={line.image}
                      className="relative h-full w-full"
                      imgClassName="object-cover"
                      size="64px"
                      fill
                    />
                  ) : null}
                </div>
                <div className="flex-1">
                  <p>{line.title}</p>
                  <p className="text-gray-500">Qty {line.quantity}</p>
                </div>
                <span>
                  {formatVND((line.unitPrice ?? 0) * line.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-3 border-t pt-6 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatVND(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{deliveryFee ? formatVND(deliveryFee) : "Free"}</span>
            </div>
          </div>
          <div className="mt-6 flex justify-between border-t pt-6 text-lg font-medium">
            <span>Total</span>
            <span>{formatVND(subtotal + deliveryFee)}</span>
          </div>

          {error ? (
            <p role="alert" className="mt-6 text-sm text-brand-red">
              {error}{" "}
              {/* A full page load, not <Link>: the plugin's refreshCart()
                  drops the guest cart secret (403), so re-fetching the
                  cart with current stock needs the provider to remount. */}
              <a href="/cart" className="underline">
                Review your cart
              </a>
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded bg-blue-600 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
          <Link
            href="/cart"
            className="mt-4 block text-center text-xs text-gray-600 hover:text-gray-800"
          >
            Back to cart
          </Link>
        </div>
      </div>
    </form>
  );
}
