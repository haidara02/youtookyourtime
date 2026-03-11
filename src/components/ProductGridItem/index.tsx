import type { Product } from "@/payload-types";

import Link from "next/link";
import React from "react";
import clsx from "clsx";
import { Media } from "@/components/Media";

type Props = {
  product: Partial<Product>;
};

export const ProductGridItem: React.FC<Props> = ({ product }) => {
  const { gallery, priceInVND } = product;

  const image =
    gallery?.[0]?.image && typeof gallery[0]?.image !== "string"
      ? gallery[0]?.image
      : false;
  return (
    <Link
      className="relative inline-block h-full w-full group"
      href={`/products/${product.slug}`}
    >
      {image ? (
        <Media
          className={clsx(
            "relative aspect-3/4 object-cover border rounded-2xl p-8 bg-primary-foreground",
          )}
          height={80}
          imgClassName={clsx("h-full w-full object-cover rounded-2xl", {
            "transition duration-300 ease-in-out group-hover:scale-102": true,
          })}
          resource={image}
          width={80}
        />
      ) : null}

      <div className="mt-3">
        <h3 className="text-sm font-medium">{product.title}</h3>
        <p className="text-sm text-muted-foreground">
          {priceInVND?.toLocaleString("vi-VN")}₫
        </p>
      </div>
    </Link>
  );
};
