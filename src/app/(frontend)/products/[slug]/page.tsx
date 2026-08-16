import { notFound } from "next/navigation";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import { RichText } from "@payloadcms/richtext-lexical/react";

import { Media } from "@/components/Media";

type Args = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Args) {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection: "products",
    draft: false,
    limit: 1,
    depth: 2,
    where: {
      slug: { equals: slug },
    },
  });

  const product = docs[0];

  if (!product) {
    notFound();
  }

  const { title, description, gallery, priceInVND, inventory } = product;
  const outOfStock = !inventory;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-2">
          {gallery?.map((item) =>
            item.image && typeof item.image !== "string" ? (
              <div
                key={item.id}
                className="relative aspect-3/4 bg-neutral-100 first:col-span-2"
              >
                <Media
                  resource={item.image}
                  imgClassName="h-full w-full object-cover"
                  fill
                />
              </div>
            ) : null,
          )}
        </div>

        <div>
          <h1 className="text-2xl font-medium">{title}</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {outOfStock
              ? "Out of stock"
              : `${priceInVND.toLocaleString("vi-VN")}₫`}
          </p>
          {description ? (
            <div className="prose mt-6 max-w-none">
              <RichText data={description} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
