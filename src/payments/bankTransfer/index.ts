import type { PaymentAdapter } from "@payloadcms/plugin-ecommerce/types";
import type { DefaultDocumentIDType, PayloadRequest } from "payload";

import { getShopSettings } from "@/utilities/shopSettings";
import {
  BANK_TRANSFER,
  type BankTransferCheckoutData,
  type DeliveryMethod,
} from "./client";

export { BANK_TRANSFER };

/**
 * Manual bank transfer ("chuyển khoản"). Placing an order creates it straight
 * away — reserving stock and giving the customer an order code to put in the
 * transfer note — with `paymentStatus: "awaiting"`. The shop owner marks it
 * paid in /admin once the money arrives, or cancels it (which restores stock;
 * see src/collections/Orders.ts).
 *
 * Flow (both steps are called back-to-back by the checkout page):
 * 1. initiatePayment: validate the checkout form, re-price and stock-check
 *    the cart server-side, and record a pending transaction.
 * 2. confirmOrder: re-check stock, then hand off to the plugin's
 *    `finalizeOrder`, which creates the order, marks the cart purchased and
 *    decrements inventory in one DB transaction.
 */

type CartItem = {
  product?: unknown;
  quantity: number;
};

/** Thrown for problems the customer should see verbatim. */
class CheckoutError extends Error {}

/** Relationship value (ID or populated doc) → ID. Mongo IDs are strings. */
const idOf = (value: unknown): string | undefined => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (value && typeof value === "object" && "id" in value) {
    return String((value as { id: DefaultDocumentIDType }).id);
  }
  return undefined;
};

const text = (value: unknown, max = 200) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

/**
 * Re-prices and stock-checks cart items from the DB. The plugin's own
 * initiate step checks this too, but its order step decrements stock without
 * re-checking, so a piece could be sold twice between the two steps.
 */
async function priceItems(items: CartItem[], req: PayloadRequest) {
  if (!items.length) throw new CheckoutError("Your cart is empty.");

  const lines: { product: string; quantity: number }[] = [];
  let subtotal = 0;

  for (const item of items) {
    const productID = idOf(item.product);
    const quantity = item.quantity;
    if (!productID || !Number.isInteger(quantity) || quantity < 1) {
      throw new CheckoutError("Your cart has an invalid item.");
    }

    const product = await req.payload.findByID({
      collection: "products",
      id: productID,
      depth: 0,
      disableErrors: true,
      req,
      select: {
        title: true,
        _status: true,
        inventory: true,
        priceInVND: true,
      },
    });
    if (!product || product._status !== "published") {
      throw new CheckoutError(
        "An item in your cart is no longer available. Please review your cart.",
      );
    }

    const { title } = product;
    const price = product.priceInVND;
    const stock = product.inventory ?? 0;

    if (price === null || price === undefined) {
      throw new CheckoutError(`${title} can't be ordered right now.`);
    }
    if (stock < quantity) {
      throw new CheckoutError(
        stock <= 0
          ? `${title} is sold out. Please remove it from your cart.`
          : `Only ${stock} of ${title} left. Please reduce the quantity in your cart.`,
      );
    }

    subtotal += price * quantity;
    lines.push({ product: productID, quantity });
  }

  return { lines, subtotal };
}

function readCheckoutData(raw: Record<string, unknown>) {
  const customerName = text(raw.customerName, 100);
  const phone = text(raw.phone, 20);
  const deliveryMethod: DeliveryMethod =
    raw.deliveryMethod === "pickup" ? "pickup" : "ship";

  if (!customerName) throw new CheckoutError("Please enter your name.");
  if (!/^\+?[0-9 .-]{8,15}$/.test(phone)) {
    throw new CheckoutError("Please enter a valid phone number.");
  }

  const address = (raw.shippingAddress ?? {}) as Record<string, unknown>;
  const shippingAddress =
    deliveryMethod === "ship"
      ? {
          addressLine1: text(address.addressLine1),
          addressLine2: text(address.addressLine2),
          city: text(address.city),
          state: text(address.state),
        }
      : undefined;
  if (
    shippingAddress &&
    (!shippingAddress.addressLine1 ||
      !shippingAddress.addressLine2 ||
      !shippingAddress.state)
  ) {
    throw new CheckoutError("Please complete your delivery address.");
  }

  return {
    customerName,
    phone,
    deliveryMethod,
    pickupLocationIndex: Number(raw.pickupLocationIndex ?? 0),
    shippingAddress,
    note: text(raw.note, 500),
  };
}

// No 0/O/1/I so the code is easy to read back over the phone.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

async function generateOrderCode(req: PayloadRequest) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    const code =
      "YTYT" +
      Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join(
        "",
      );
    const { totalDocs } = await req.payload.count({
      collection: "orders",
      where: { orderCode: { equals: code } },
      req,
    });
    if (totalDocs === 0) return code;
  }
  throw new Error("Could not generate a unique order code.");
}

const normalizeEmail = (email: unknown) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

export const bankTransferAdapter = (): PaymentAdapter => ({
  name: BANK_TRANSFER,
  label: "Bank transfer",
  // Stored on the transaction so confirmOrder doesn't have to trust the
  // client to resend the same delivery choice/fee.
  group: {
    name: BANK_TRANSFER,
    type: "group",
    admin: {
      condition: (data) => data?.paymentMethod === BANK_TRANSFER,
    },
    fields: [
      { name: "customerName", type: "text" },
      { name: "phone", type: "text" },
      {
        name: "deliveryMethod",
        type: "select",
        options: [
          { label: "Delivery", value: "ship" },
          { label: "In-store pickup", value: "pickup" },
        ],
      },
      { name: "pickupLocation", type: "text" },
      { name: "shippingFee", type: "number" },
      { name: "shippingAddress", type: "json" },
      { name: "note", type: "textarea" },
    ],
  },

  initiatePayment: async ({ data, req, transactionsSlug }) => {
    try {
      const checkout = readCheckoutData((req.data ?? {}) as Record<string, unknown>);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail)) {
        throw new CheckoutError("Please enter a valid email address.");
      }

      const settings = await getShopSettings(req.payload, req);
      let pickupLocation: string | undefined;
      if (checkout.deliveryMethod === "pickup") {
        const location = settings.pickupLocations[checkout.pickupLocationIndex];
        if (!location) {
          throw new CheckoutError("Please choose a pickup location.");
        }
        pickupLocation = `${location.name} — ${location.address}`;
      }
      const shippingFee =
        checkout.deliveryMethod === "ship" ? settings.shippingFee : 0;

      const { lines, subtotal } = await priceItems(
        (data.cart.items ?? []) as CartItem[],
        req,
      );
      const amount = subtotal + shippingFee;

      const transaction = await req.payload.create({
        collection: transactionsSlug as "transactions",
        data: {
          status: "pending",
          paymentMethod: BANK_TRANSFER,
          customer: req.user?.id,
          customerEmail: data.customerEmail,
          cart: data.cart.id,
          items: lines,
          amount,
          currency: "VND",
          [BANK_TRANSFER]: {
            customerName: checkout.customerName,
            phone: checkout.phone,
            deliveryMethod: checkout.deliveryMethod,
            pickupLocation,
            shippingFee,
            shippingAddress: checkout.shippingAddress,
            note: checkout.note,
          },
        },
        req,
      });

      return {
        message: "Bank transfer initiated",
        transactionID: transaction.id,
        amount,
      };
    } catch (error) {
      if (error instanceof CheckoutError) {
        // The provider's initiatePayment() throws `error` as the message,
        // so the checkout page can show it as-is.
        return { message: error.message, error: error.message };
      }
      throw error;
    }
  },

  confirmOrder: async ({ data, req, finalizeOrder, transactionsSlug }) => {
    const transaction = await req.payload.findByID({
      collection: (transactionsSlug ?? "transactions") as "transactions",
      id: data.transactionID,
      depth: 0,
      disableErrors: true,
      req,
    });
    if (
      !transaction ||
      transaction.status !== "pending" ||
      transaction.paymentMethod !== BANK_TRANSFER ||
      idOf(transaction.cart) !== data.cartID ||
      normalizeEmail(transaction.customerEmail) !==
        normalizeEmail(data.customerEmail)
    ) {
      throw new Error("Transaction is not valid for this order.");
    }

    // Stock may have changed since initiatePayment (another order, an admin
    // edit). finalizeOrder decrements without checking, so check again here.
    await priceItems((transaction.items ?? []) as CartItem[], req);

    const details = transaction[BANK_TRANSFER] ?? {};
    const settings = await getShopSettings(req.payload, req);
    const address = details.shippingAddress as
      | BankTransferCheckoutData["shippingAddress"]
      | undefined;

    const order = await finalizeOrder({
      transactionID: transaction.id,
      orderData: {
        items: transaction.items?.map(({ product, quantity }) => ({
          product: idOf(product),
          quantity,
        })),
        customer: idOf(transaction.customer),
        customerEmail: transaction.customerEmail,
        amount: transaction.amount,
        currency: transaction.currency,
        status: "processing",
        orderCode: await generateOrderCode(req),
        customerName: details.customerName,
        customerPhone: details.phone,
        note: details.note,
        deliveryMethod: details.deliveryMethod,
        shippingFee: details.shippingFee,
        pickupLocation: details.pickupLocation,
        ...(address
          ? {
              shippingAddress: {
                firstName: details.customerName,
                phone: details.phone,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2,
                city: address.city,
                state: address.state,
                country: "VN",
              },
            }
          : {}),
        paymentMethod: BANK_TRANSFER,
        paymentStatus: "awaiting",
        paymentDueAt: new Date(
          Date.now() + settings.paymentWindowHours * 60 * 60 * 1000,
        ).toISOString(),
      },
    });

    return {
      message: "Order placed",
      orderID: order.id as DefaultDocumentIDType,
      transactionID: transaction.id,
      // Lets a guest view their order page without an account.
      accessToken: order.accessToken,
    };
  },
});
