import type {
  CurrenciesConfig,
  Currency,
} from "@payloadcms/plugin-ecommerce/types";

// Shared by the ecommerce plugin (server, src/plugins/index.ts) and the
// EcommerceProvider (client, src/providers/Ecommerce.tsx). They must match,
// or the provider falls back to USD and queries a `priceInUSD` field that
// doesn't exist.

// VND has no minor unit, so prices are stored as whole dong (decimals: 0).
// Leaving this at the plugin's USD-style default of 2 would make every
// amount sent to a payment provider off by 100x.
export const VND: Currency = {
  code: "VND",
  decimals: 0,
  label: "Vietnamese Dong",
  symbol: "₫",
};

export const currenciesConfig: CurrenciesConfig = {
  defaultCurrency: VND.code,
  supportedCurrencies: [VND],
};
