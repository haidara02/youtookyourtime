"use client";

import Link from "next/link";
import { useCart } from "@payloadcms/plugin-ecommerce/client/react";

export default function CartIcon() {
  const { cart } = useCart();
  const count =
    cart?.items?.reduce((total, item) => total + (item.quantity ?? 0), 0) ?? 0;

  return (
    <Link
      href="/cart"
      className="text-base font-bold hover:text-gray-600 transition-colors"
    >
      cart <span className="font-normal text-blue-600">({count})</span>
    </Link>
  );
}
