import { notFound } from "next/navigation";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import { RichText } from "@payloadcms/richtext-lexical/react";

import { Media } from "@/components/Media";
import {
  ProductPurchase,
  type PurchaseOptionGroup,
  type PurchaseVariant,
} from "@/components/ProductPurchase";
import type { VariantOption, VariantType } from "@/payload-types";

type Args = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: Args) {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection: "products",
    draft: false,
    limit: 1,
    depth: 2,
    where: {
      slug: { equals: slug },
      // Local API skips access control, so filter drafts out explicitly.
      _status: { equals: "published" },
    },
  });

  const product = docs[0];

  if (!product) {
    notFound();
  }

  const { title, description, gallery, priceInVND, inventory } = product;

  // Variants are queried directly (rather than via the product's `variants`
  // join) so drafts can be excluded and each option's type is populated.
  const variantDocs = product.enableVariants
    ? (
        await payload.find({
          collection: "variants",
          depth: 2,
          limit: 100,
          pagination: false,
          where: {
            product: { equals: product.id },
            _status: { equals: "published" },
          },
        })
      ).docs
    : [];

  const variants: PurchaseVariant[] = variantDocs.map((variant) => ({
    id: variant.id,
    optionIDs: variant.options.map((option) =>
      typeof option === "string" ? option : option.id,
    ),
    price: variant.priceInVND ?? null,
    inventory: variant.inventory ?? 0,
  }));

  // Group the options actually used by variants under their type (Size,
  // Colour…), in the type order set on the product and the option order set
  // on each type in the admin.
  const optionsByType = new Map<string, Map<string, VariantOption>>();
  const typesByID = new Map<string, VariantType>();
  for (const variant of variantDocs) {
    for (const option of variant.options) {
      if (typeof option === "string" || typeof option.variantType === "string")
        continue;
      typesByID.set(option.variantType.id, option.variantType);
      const options = optionsByType.get(option.variantType.id) ?? new Map();
      options.set(option.id, option);
      optionsByType.set(option.variantType.id, options);
    }
  }
  const typeOrder = (product.variantTypes ?? []).map((type) =>
    typeof type === "string" ? type : type.id,
  );
  const optionGroups: PurchaseOptionGroup[] = [...typesByID.values()]
    .sort((a, b) => typeOrder.indexOf(a.id) - typeOrder.indexOf(b.id))
    .map((type) => ({
      id: type.id,
      label: type.label,
      options: [...(optionsByType.get(type.id)?.values() ?? [])]
        .sort((a, b) => {
          // Fractional-index keys: compare as raw strings, not by locale.
          const keyA = a._variantOptions_options_order ?? "";
          const keyB = b._variantOptions_options_order ?? "";
          return keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
        })
        .map((option) => ({ id: option.id, label: option.label })),
    }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-2">
          {gallery?.map((item) =>
            item.image && typeof item.image !== "string" ? (
              <div
                key={item.id}
                className="relative aspect-3/4 bg-neutral-100 first:col-span-2"
              >
                <Media
                  resource={item.image}
                  imgClassName="h-full w-full object-cover"
                  fill
                />
              </div>
            ) : null,
          )}
        </div>

        <div>
          <h1 className="text-2xl font-medium">{title}</h1>
          <ProductPurchase
            productID={product.id}
            price={priceInVND ?? null}
            inventory={inventory ?? 0}
            optionGroups={optionGroups}
            variants={variants}
          />
          {description ? (
            <div className="prose mt-6 max-w-none">
              <RichText data={description} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
