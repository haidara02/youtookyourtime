import configPromise from "@payload-config";
import { getPayload } from "payload";
import { ProductGridItem } from "@/components/ProductGridItem";

export default async function ShopPage() {
  const payload = await getPayload({ config: configPromise });
  const products = await payload.find({
    collection: "products",
    draft: false,
    sort: "title",
    // overrideAccess: false,
    select: {
      title: true,
      slug: true,
      gallery: true,
      categories: true,
      priceInVND: true,
    },
    depth: 2,
    // where: {
    //   _status: { equals: "published" },
    // },
  });
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.docs.map((product) => (
          <ProductGridItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
