import type { PaymentAdapterClient } from "@payloadcms/plugin-ecommerce/types";

// Browser-safe half of the bank transfer payment method (no server imports).
// The server adapter is in ./index.ts.

export const BANK_TRANSFER = "bankTransfer";

/** For the storefront's EcommerceProvider. */
export const bankTransferClient: PaymentAdapterClient = {
  name: BANK_TRANSFER,
  label: "Bank transfer",
  initiatePayment: true,
  confirmOrder: true,
};

export type DeliveryMethod = "ship" | "pickup";

/** What the checkout page sends to `initiatePayment` (besides cart/email). */
export type BankTransferCheckoutData = {
  customerName: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  /** Index into Shop settings → pickup locations. */
  pickupLocationIndex?: number;
  shippingAddress?: {
    addressLine1: string;
    /** Ward / commune */
    addressLine2: string;
    /** District, where still applicable */
    city?: string;
    /** Province / city */
    state: string;
  };
  note?: string;
};
