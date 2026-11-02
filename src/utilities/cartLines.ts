import type { Cart, Media as MediaDoc, Product } from "@/payload-types";

/**
 * A cart item flattened for display (cart and checkout pages). Expects the
 * cart shape fetched by `cartsFetchQuery` in src/providers/Ecommerce.tsx.
 */
export type CartLine = {
  id: string;
  quantity: number;
  /** null when the product was unpublished/deleted after being added. */
  product: Product | null;
  title: string;
  href?: string;
  image?: MediaDoc;
  unitPrice: number | null;
  stock: number;
};

export const toCartLine = (
  item: NonNullable<Cart["items"]>[number],
): CartLine => {
  // Relationships the visitor can't read (e.g. an unpublished product) come
  // back as bare IDs instead of populated docs.
  const product =
    item.product && typeof item.product === "object" ? item.product : null;
  const galleryImage = product?.gallery?.[0]?.image;
  const image =
    galleryImage && typeof galleryImage === "object" ? galleryImage : undefined;

  return {
    id: item.id ?? "",
    quantity: item.quantity,
    product,
    title: product?.title ?? "Unavailable item",
    href: product?.slug ? `/products/${product.slug}` : undefined,
    image,
    unitPrice: product?.priceInVND ?? null,
    stock: product?.inventory ?? 0,
  };
};

/** Lines that would fail server-side validation at checkout. */
export const cartHasProblems = (lines: CartLine[]) =>
  lines.some(
    (line) =>
      !line.product || line.unitPrice === null || line.quantity > line.stock,
  );
