"use client";

import { EcommerceProvider } from "@payloadcms/plugin-ecommerce/client/react";
import type { ReactNode } from "react";

import { currenciesConfig } from "@/utilities/currencies";

/**
 * What every cart fetch includes, beyond the plugin's default of bare IDs and
 * prices: enough for the cart page to render lines (title, link, image,
 * option labels) and cap quantities at stock. Depth 2 reaches the gallery's
 * media docs and the variants' option docs.
 */
const cartsFetchQuery = {
  depth: 2,
  populate: {
    products: {
      title: true,
      slug: true,
      gallery: true,
      inventory: true,
      priceInVND: true,
    },
    variants: {
      options: true,
      inventory: true,
      priceInVND: true,
    },
  },
} as const;

/**
 * Cart state for the storefront. Guest carts are created in Payload on the
 * first add-to-cart and remembered in localStorage (ID + secret), so they
 * survive reloads without an account.
 */
export function Ecommerce({ children }: { children: ReactNode }) {
  return (
    <EcommerceProvider
      currenciesConfig={currenciesConfig}
      api={{ cartsFetchQuery }}
    >
      {children}
    </EcommerceProvider>
  );
}
