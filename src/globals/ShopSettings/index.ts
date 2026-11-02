import type { GlobalConfig } from "payload";

import { adminOnly } from "@/access/adminOnly";

/**
 * Checkout settings the shop owner can change without a deploy. Read
 * server-side only (via the Local API), so public read access isn't needed.
 * Empty fields fall back to clearly-marked placeholders — see
 * src/utilities/shopSettings.ts.
 */
export const ShopSettings: GlobalConfig = {
  slug: "shopSettings",
  label: "Shop settings",
  admin: {
    group: "Ecommerce",
  },
  access: {
    read: adminOnly,
    update: adminOnly,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Bank transfer",
          description:
            "Shown to customers after they place an order, with a VietQR code they can scan in their banking app.",
          fields: [
            {
              name: "bankName",
              type: "text",
              admin: { description: "e.g. Vietcombank" },
            },
            {
              name: "bankBin",
              label: "Bank BIN",
              type: "text",
              validate: (value: string | null | undefined) =>
                !value || /^\d{6}$/.test(value) || "Must be 6 digits",
              admin: {
                description:
                  "The bank's 6-digit NAPAS code, needed for the QR code (e.g. Vietcombank 970436, Techcombank 970407, MB 970422, ACB 970416). Check it against your bank before going live.",
              },
            },
            {
              name: "accountNumber",
              type: "text",
            },
            {
              name: "accountName",
              type: "text",
              admin: {
                description:
                  "Account holder name exactly as the bank shows it, e.g. NGUYEN VAN A",
              },
            },
            {
              name: "paymentWindowHours",
              label: "Hold unpaid orders for (hours)",
              type: "number",
              defaultValue: 24,
              min: 1,
              admin: {
                description:
                  "Shown to customers as the deadline to pay. Stock stays reserved until the order is cancelled.",
              },
            },
          ],
        },
        {
          label: "Delivery",
          fields: [
            {
              name: "shippingFee",
              label: "Delivery fee (VND)",
              type: "number",
              defaultValue: 30000,
              min: 0,
              admin: { step: 1000 },
            },
            {
              name: "pickupLocations",
              label: "In-store pickup locations",
              type: "array",
              admin: {
                description:
                  "Leave empty to hide the in-store pickup option at checkout.",
              },
              fields: [
                { name: "name", type: "text", required: true },
                { name: "address", type: "text", required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
};
