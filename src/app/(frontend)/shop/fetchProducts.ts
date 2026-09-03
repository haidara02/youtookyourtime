"use server";

import configPromise from "@payload-config";
import { getPayload } from "payload";
import type { Product } from "@/payload-types";

export async function fetchShopProducts(page: number, limit: number) {
  const payload = await getPayload({ config: configPromise });
  const products = await payload.find({
    collection: "products",
    draft: false,
    sort: "title",
    page,
    limit,
    select: {
      title: true,
      slug: true,
      gallery: true,
      inventory: true,
      categories: true,
      priceInVND: true,
    },
    depth: 2,
  });

  return {
    docs: products.docs as Partial<Product>[],
    page: products.page ?? page,
    totalPages: products.totalPages ?? 1,
  };
}
