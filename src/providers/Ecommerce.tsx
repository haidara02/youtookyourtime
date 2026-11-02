"use client";

import { EcommerceProvider } from "@payloadcms/plugin-ecommerce/client/react";
import type { ReactNode } from "react";

import { currenciesConfig } from "@/utilities/currencies";

/**
 * Cart state for the storefront. Guest carts are created in Payload on the
 * first add-to-cart and remembered in localStorage (ID + secret), so they
 * survive reloads without an account.
 */
export function Ecommerce({ children }: { children: ReactNode }) {
  return (
    <EcommerceProvider currenciesConfig={currenciesConfig}>
      {children}
    </EcommerceProvider>
  );
}
