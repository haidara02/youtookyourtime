/**
 * Public URL of an object in the R2 media bucket, served from the bucket's
 * custom domain (S3_PUBLIC_URL). Each path segment is encoded so filenames
 * with spaces or parentheses resolve correctly.
 */
export const getMediaPublicURL = (filename: string, prefix?: string) => {
  const base = (process.env.S3_PUBLIC_URL || "").replace(/\/+$/, "");
  const key = [...(prefix ? prefix.split("/") : []), filename]
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");

  return `${base}/${key}`;
};

/**
 * Resolves a media doc's `url` for use in src attributes. Absolute URLs (media
 * served from the public R2 domain) are returned as-is; relative ones (local
 * disk or the Payload proxy route) are prefixed with the server URL.
 */
export const resolveMediaURL = (url?: string | null) => {
  if (!url) return "";
  if (/^https?:\/\//.test(url)) return url;

  return `${process.env.NEXT_PUBLIC_SERVER_URL || ""}${url}`;
};
