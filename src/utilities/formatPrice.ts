/**
 * Formats a whole-dong amount for display, e.g. 200000 -> "200.000₫".
 * Returns null when there's no price set, so callers can choose a fallback.
 */
export const formatVND = (amount: number | null | undefined): string | null => {
  if (amount === null || amount === undefined) return null;
  return `${amount.toLocaleString("vi-VN")}₫`;
};
