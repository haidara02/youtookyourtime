import type { CollectionSlug, PayloadRequest } from "payload";

/**
 * Admin preview URL for a frontend path. /next/preview checks the visitor is
 * a logged-in admin, turns on Next.js draft mode (so pages render drafts),
 * then redirects to `path`.
 */
export const previewURL = (path: string) =>
  `/next/preview?path=${encodeURIComponent(path)}`;

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  products: "/products",
  pages: "",
};

type Props = {
  collection: keyof typeof collectionPrefixMap;
  slug: string;
  req?: PayloadRequest;
};

/** For `admin.livePreview.url` / `admin.preview` on slugged collections. */
export const generatePreviewPath = ({ collection, slug }: Props) => {
  // No slug yet (unsaved new doc): returning null disables the preview.
  if (slug === undefined || slug === null) return null;
  return previewURL(`${collectionPrefixMap[collection]}/${slug}`);
};
