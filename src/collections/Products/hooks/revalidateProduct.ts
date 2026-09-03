import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";
import { revalidatePath } from "next/cache";

import type { Product } from "@/payload-types";

const revalidateProductPaths = (
  slugs: Array<string | null | undefined>,
  payload: { logger: { info: (message: string) => void } },
) => {
  const paths = new Set(["/", "/shop"]);

  for (const slug of slugs) {
    if (slug) paths.add(`/products/${slug}`);
  }

  payload.logger.info(`Revalidating product paths: ${[...paths].join(", ")}`);

  for (const path of paths) {
    revalidatePath(path);
  }
};

export const revalidateProduct: CollectionAfterChangeHook<Product> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    revalidateProductPaths([doc.slug, previousDoc?.slug], payload);
  }

  return doc;
};

export const revalidateProductDelete: CollectionAfterDeleteHook<Product> = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    revalidateProductPaths([doc?.slug], payload);
  }

  return doc;
};
