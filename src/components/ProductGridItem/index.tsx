"use client";

import type { Product } from "@/payload-types";

import Link from "next/link";
import React, { useState } from "react";
import { Media } from "@/components/Media";

type Props = {
  product: Partial<Product>;
};

export const ProductGridItem: React.FC<Props> = ({ product }) => {
  const { gallery, priceInVND } = product;
  const [isHovering, setIsHovering] = useState(false);

  const firstImage =
    gallery?.[0]?.image && typeof gallery[0]?.image !== "string"
      ? gallery[0]?.image
      : null;

  const secondImage =
    gallery?.[1]?.image && typeof gallery[1]?.image !== "string"
      ? gallery[1]?.image
      : null;

  const hasSecondImage = !!secondImage;

  return (
    <Link
      className="relative inline-block h-full w-full group"
      href={`/products/${product.slug}`}
      onMouseEnter={() => hasSecondImage && setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative aspect-3/4 overflow-hidden">
        {/* First image */}
        {firstImage ? (
          <div
            className="absolute inset-0 transition-opacity duration-300 ease-in-out"
            style={{
              opacity: isHovering ? 0 : 1,
            }}
          >
            <Media
              className="relative aspect-3/4 object-cover"
              height={80}
              imgClassName="h-full w-full object-cover"
              resource={firstImage}
              width={80}
            />
          </div>
        ) : null}

        {/* Second image on hover */}
        {secondImage ? (
          <div
            className="absolute inset-0 transition-opacity duration-200 ease-in-out"
            style={{
              opacity: isHovering ? 1 : 0,
            }}
          >
            <Media
              className="relative aspect-3/4 object-cover"
              height={80}
              imgClassName="h-full w-full object-cover"
              resource={secondImage}
              width={80}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-3">
        <h3 className="text-sm font-medium">{product.title}</h3>
        <p className="text-sm text-muted-foreground">
          {product.inventory == 0 ? "Out of stock" : priceInVND?.toLocaleString("vi-VN") + "₫"}
        </p>
      </div>
    </Link>
  );
};
