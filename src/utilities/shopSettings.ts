import type { Payload, PayloadRequest } from "payload";

export type ResolvedShopSettings = {
  bank: {
    bankName: string;
    bankBin: string;
    accountNumber: string;
    accountName: string;
    /** True while any bank detail is still a placeholder. */
    isPlaceholder: boolean;
  };
  paymentWindowHours: number;
  shippingFee: number;
  pickupLocations: { name: string; address: string }[];
};

// Placeholders until the real details are entered in /admin → Shop settings.
// The BIN is Vietcombank's so the QR code is structurally valid for testing;
// the account itself is fake.
const PLACEHOLDER_BANK = {
  bankName: "Vietcombank (PLACEHOLDER)",
  bankBin: "970436",
  accountNumber: "0000000000",
  accountName: "PLACEHOLDER ACCOUNT NAME",
};

/**
 * Shop settings with placeholders filled in. Server-only (Local API).
 * Takes the Payload instance rather than importing the config, because the
 * payment adapter that uses it is itself part of the config. Pass `req` when
 * inside a Payload operation so it shares the request's DB transaction.
 */
export async function getShopSettings(
  payload: Payload,
  req?: PayloadRequest,
): Promise<ResolvedShopSettings> {
  const settings = await payload.findGlobal({
    slug: "shopSettings",
    depth: 0,
    req,
  });

  const bankName = settings.bankName?.trim();
  const bankBin = settings.bankBin?.trim();
  const accountNumber = settings.accountNumber?.trim();
  const accountName = settings.accountName?.trim();
  const complete = Boolean(bankName && bankBin && accountNumber && accountName);

  return {
    bank: complete
      ? {
          bankName: bankName!,
          bankBin: bankBin!,
          accountNumber: accountNumber!,
          accountName: accountName!,
          isPlaceholder: false,
        }
      : { ...PLACEHOLDER_BANK, isPlaceholder: true },
    paymentWindowHours: settings.paymentWindowHours ?? 24,
    shippingFee: settings.shippingFee ?? 30000,
    pickupLocations: (settings.pickupLocations ?? []).map(
      ({ name, address }) => ({ name, address }),
    ),
  };
}
