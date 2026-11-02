import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import QRCode from "qrcode";

import type { Order } from "@/payload-types";
import { formatVND } from "@/utilities/formatPrice";
import { getShopSettings } from "@/utilities/shopSettings";
import { buildVietQRPayload } from "@/utilities/vietqr";
import { CopyButton } from "./CopyButton";

type Args = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
};

export const metadata: Metadata = {
  title: "Your order | You Took Your Time",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(iso));

/**
 * Order status page. Guests reach it from checkout with the order's secret
 * access token in the URL (there are no customer accounts yet), so the
 * token is required and must match.
 */
export default async function OrderPage({ params, searchParams }: Args) {
  const [{ id }, { token }] = await Promise.all([params, searchParams]);
  if (!token) notFound();

  const payload = await getPayload({ config: configPromise });

  let order: Order | undefined;
  try {
    const { docs } = await payload.find({
      collection: "orders",
      depth: 2,
      limit: 1,
      where: {
        and: [{ id: { equals: id } }, { accessToken: { equals: token } }],
      },
    });
    order = docs[0];
  } catch {
    // Malformed IDs throw rather than returning no results.
  }
  if (!order) notFound();

  const settings = await getShopSettings(payload);
  const amount = order.amount ?? 0;
  const shippingFee = order.shippingFee ?? 0;
  const code = order.orderCode ?? "";
  const cancelled = order.status === "cancelled";
  const paid = order.paymentStatus === "paid";
  const overdue =
    !paid &&
    Boolean(order.paymentDueAt) &&
    new Date(order.paymentDueAt!) < new Date();
  const showPaymentInstructions = !cancelled && !paid && !overdue;

  const qrSvg = showPaymentInstructions
    ? await QRCode.toString(
        buildVietQRPayload({
          bankBin: settings.bank.bankBin,
          accountNumber: settings.bank.accountNumber,
          amount,
          note: code,
        }),
        { type: "svg", margin: 1, errorCorrectionLevel: "M" },
      )
    : null;

  const address = order.shippingAddress;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm text-gray-500">Order {code}</p>
      <h1 className="mt-1 text-2xl font-medium">
        {cancelled
          ? "This order was cancelled"
          : paid
            ? "Payment received — thank you!"
            : `Thank you${order.customerName ? `, ${order.customerName}` : ""}!`}
      </h1>

      {cancelled ? (
        <p className="mt-4 text-sm text-gray-600">
          If you think this is a mistake, please contact us with your order
          code.
        </p>
      ) : paid ? (
        <p className="mt-4 text-sm text-gray-600">
          {order.status === "completed"
            ? "Your order is complete."
            : "We're preparing your order."}
        </p>
      ) : overdue ? (
        <p className="mt-4 text-sm text-brand-red">
          The payment deadline for this order has passed. If you&apos;ve
          already transferred, please contact us with your order code.
        </p>
      ) : null}

      {showPaymentInstructions ? (
        <section className="mt-8 border border-foreground p-6">
          <h2 className="text-lg font-medium">Pay by bank transfer</h2>
          <p className="mt-2 text-sm text-gray-600">
            Scan the QR code in your banking app — the amount and note are
            filled in for you. Please pay by{" "}
            <strong>{formatDateTime(order.paymentDueAt!)}</strong>, or your
            order will be cancelled.
          </p>

          {settings.bank.isPlaceholder ? (
            <p className="mt-4 bg-yellow-100 p-3 text-sm font-medium">
              Test details — this is not a real bank account. Do not
              transfer.
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-8 sm:flex-row">
            <div
              className="mx-auto h-56 w-56 shrink-0 sm:mx-0"
              aria-label="VietQR payment code"
              role="img"
              // Generated server-side from our own payload string.
              dangerouslySetInnerHTML={{ __html: qrSvg! }}
            />
            <dl className="grid flex-1 grid-cols-[auto_1fr] content-start gap-x-6 gap-y-3 text-sm">
              <dt className="text-gray-500">Amount</dt>
              <dd className="font-medium">{formatVND(amount)}</dd>
              <dt className="text-gray-500">Bank</dt>
              <dd>{settings.bank.bankName}</dd>
              <dt className="text-gray-500">Account number</dt>
              <dd>
                {settings.bank.accountNumber}
                <CopyButton
                  value={settings.bank.accountNumber}
                  label="account number"
                />
              </dd>
              <dt className="text-gray-500">Account name</dt>
              <dd>{settings.bank.accountName}</dd>
              <dt className="text-gray-500">Transfer note</dt>
              <dd className="font-medium">
                {code}
                <CopyButton value={code} label="transfer note" />
              </dd>
            </dl>
          </div>
          <p className="mt-6 text-xs text-gray-500">
            Transferring manually? Use the exact amount and put{" "}
            <strong>{code}</strong> in the note so we can match your payment.
            We&apos;ll update this page once it arrives.
          </p>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-lg font-medium">Items</h2>
        <ul className="mt-4 divide-y border-y text-sm">
          {order.items?.map((item) => {
            const product =
              typeof item.product === "object" ? item.product : null;
            return (
              <li key={item.id} className="flex justify-between py-3">
                <span>{product?.title ?? "Item"}</span>
                <span className="text-gray-500">× {item.quantity}</span>
              </li>
            );
          })}
        </ul>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatVND(amount - shippingFee)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd>{shippingFee ? formatVND(shippingFee) : "Free"}</dd>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-medium">
            <dt>Total</dt>
            <dd>{formatVND(amount)}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-10 text-sm">
        <h2 className="text-lg font-medium">
          {order.deliveryMethod === "pickup" ? "Pickup" : "Delivery"}
        </h2>
        {order.deliveryMethod === "pickup" ? (
          <p className="mt-2">{order.pickupLocation}</p>
        ) : address ? (
          <address className="mt-2 not-italic leading-relaxed">
            {address.firstName}
            <br />
            {address.addressLine1}
            <br />
            {[address.addressLine2, address.city, address.state]
              .filter(Boolean)
              .join(", ")}
            <br />
            {address.phone}
          </address>
        ) : null}
      </section>

      <p className="mt-10 text-xs text-gray-500">
        Bookmark this page to check your order status later.{" "}
        <Link href="/shop" className="text-blue-600 hover:text-blue-800">
          Continue shopping
        </Link>
      </p>
    </div>
  );
}
