import type { Metadata } from "next";
import configPromise from "@payload-config";
import { getPayload } from "payload";

import { getShopSettings } from "@/utilities/shopSettings";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout | You Took Your Time",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const payload = await getPayload({ config: configPromise });
  const settings = await getShopSettings(payload);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <CheckoutForm
        shippingFee={settings.shippingFee}
        pickupLocations={settings.pickupLocations}
        paymentWindowHours={settings.paymentWindowHours}
      />
    </div>
  );
}
