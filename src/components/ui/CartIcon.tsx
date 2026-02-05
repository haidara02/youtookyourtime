"use client";

import Link from "next/link";

interface CartIconProps {
  count: number;
}

export default function CartIcon({ count }: CartIconProps) {
  return (
    <Link
      href="/cart"
      className="text-xs font-bold hover:text-gray-600 transition-colors"
    >
      cart ({count})
    </Link>
  );
}
