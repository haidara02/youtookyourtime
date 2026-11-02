import type { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";
import {
  APIError,
  type CollectionAfterChangeHook,
  type CollectionBeforeChangeHook,
  type DefaultDocumentIDType,
} from "payload";

import type { Order } from "@/payload-types";

/**
 * Payment status, separate from the plugin's order `status` (processing →
 * completed). Bank-transfer orders are created before the money arrives, so
 * they start "awaiting" and the shop owner marks them "paid".
 */
const paymentStatusBeforeChange: CollectionBeforeChangeHook<Order> = ({
  data,
  originalDoc,
}) => {
  if (
    originalDoc?.status === "cancelled" &&
    data.status &&
    data.status !== "cancelled"
  ) {
    throw new APIError(
      "Cancelled orders can't be reopened (their stock has already been released). Ask the customer to place a new order.",
      400,
      undefined,
      true,
    );
  }
  if (data.paymentStatus === "paid" && originalDoc?.paymentStatus !== "paid") {
    data.paidAt = data.paidAt ?? new Date().toISOString();
  }
  return data;
};

/** Puts reserved stock back when an order is cancelled (once). */
const restoreInventoryOnCancel: CollectionAfterChangeHook<Order> = async ({
  doc,
  previousDoc,
  req,
}) => {
  if (
    doc.status !== "cancelled" ||
    previousDoc?.status === "cancelled" ||
    doc.inventoryRestored
  ) {
    return doc;
  }

  const idOf = (value: unknown) =>
    (value && typeof value === "object"
      ? (value as { id: DefaultDocumentIDType }).id
      : value) as DefaultDocumentIDType | null | undefined;

  for (const item of doc.items ?? []) {
    const id = idOf(item.product);
    if (!id || !item.quantity) continue;
    // Atomic increment, mirroring how the plugin decrements on purchase.
    await req.payload.db.updateOne({
      collection: "products",
      id,
      data: { inventory: { $inc: item.quantity } },
      req,
    });
  }

  // Direct DB write so this doesn't re-run the hooks.
  await req.payload.db.updateOne({
    collection: "orders",
    id: doc.id,
    data: { inventoryRestored: true },
    req,
  });
  return { ...doc, inventoryRestored: true };
};

export const OrdersCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  admin: {
    ...defaultCollection.admin,
    useAsTitle: "orderCode",
    defaultColumns: [
      "orderCode",
      "customerName",
      "amount",
      "paymentStatus",
      "status",
      "paymentDueAt",
      "createdAt",
    ],
  },
  fields: [
    ...defaultCollection.fields,
    {
      name: "orderCode",
      type: "text",
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Customers put this in their bank transfer note.",
      },
    },
    {
      name: "paymentMethod",
      type: "select",
      options: [{ label: "Bank transfer", value: "bankTransfer" }],
      admin: { position: "sidebar", readOnly: true },
    },
    {
      name: "paymentStatus",
      type: "select",
      defaultValue: "awaiting",
      options: [
        { label: "Awaiting transfer", value: "awaiting" },
        { label: "Paid", value: "paid" },
      ],
      admin: {
        position: "sidebar",
        description:
          'Set to "Paid" once the transfer (with the order code in the note) shows up in the bank account.',
      },
    },
    {
      name: "paymentDueAt",
      label: "Pay by",
      type: "date",
      admin: {
        position: "sidebar",
        readOnly: true,
        date: { pickerAppearance: "dayAndTime" },
        description:
          "If unpaid by then, set Status to Cancelled to release the stock.",
      },
    },
    {
      name: "paidAt",
      type: "date",
      admin: {
        position: "sidebar",
        readOnly: true,
        date: { pickerAppearance: "dayAndTime" },
      },
    },
    {
      type: "collapsible",
      label: "Customer & delivery",
      fields: [
        {
          type: "row",
          fields: [
            { name: "customerName", type: "text" },
            { name: "customerPhone", type: "text" },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "deliveryMethod",
              type: "select",
              options: [
                { label: "Delivery", value: "ship" },
                { label: "In-store pickup", value: "pickup" },
              ],
            },
            {
              name: "shippingFee",
              label: "Delivery fee (VND)",
              type: "number",
            },
          ],
        },
        {
          name: "pickupLocation",
          type: "text",
          admin: {
            condition: (data) => data?.deliveryMethod === "pickup",
          },
        },
        { name: "note", label: "Customer note", type: "textarea" },
      ],
    },
    {
      // Guests view their order via /orders/[id]?token=…
      name: "accessToken",
      type: "text",
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ value, operation }) => {
            if (operation === "create" || !value) {
              return crypto.randomUUID();
            }
            return value;
          },
        ],
      },
    },
    {
      name: "inventoryRestored",
      type: "checkbox",
      admin: { hidden: true },
    },
  ],
  hooks: {
    ...defaultCollection.hooks,
    beforeChange: [
      ...(defaultCollection.hooks?.beforeChange ?? []),
      paymentStatusBeforeChange,
    ],
    afterChange: [
      ...(defaultCollection.hooks?.afterChange ?? []),
      restoreInventoryOnCancel,
    ],
  },
});
