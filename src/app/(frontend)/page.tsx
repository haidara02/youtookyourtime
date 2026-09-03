import Image from "next/image";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import { ProductGridItem } from "@/components/ProductGridItem";
import { Media } from "@/components/Media";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise });
  const [{ docs: latestProducts }, home] = await Promise.all([
    payload.find({
      collection: "products",
      draft: false,
      sort: "-createdAt",
      limit: 3,
      select: {
        title: true,
        slug: true,
        gallery: true,
        inventory: true,
        priceInVND: true,
      },
      depth: 2,
    }),
    payload.findGlobal({
      slug: "home",
      depth: 1,
    }),
  ]);

  return (
    <div className="w-vw">
      {/* Hero */}
      <section className="relative mb-16 h-[calc(100svh-var(--header-height))] w-full px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
        <Image
          src="/images/hero-bg.png"
          alt="You Took Your Time hero image"
          fill
          priority
          className="object-cover"
        />
        <div className="relative flex h-full flex-col items-center justify-center gap-4 md:flex-row md:gap-30">
          <div className="relative aspect-9/16 max-h-full flex-1 bg-neutral-100 md:h-full md:flex-none">
            {home.heroVideo1 && typeof home.heroVideo1 !== "string" ? (
              <Media
                resource={home.heroVideo1}
                htmlElement={null}
                videoClassName="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                Video 1
              </div>
            )}
          </div>
          <div className="relative aspect-9/16 max-h-full flex-1 bg-neutral-100 md:h-full md:flex-none">
            {home.heroVideo2 && typeof home.heroVideo2 !== "string" ? (
              <Media
                resource={home.heroVideo2}
                htmlElement={null}
                videoClassName="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                Video 2
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 px-10">
          {latestProducts.map((product) => (
            <ProductGridItem key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
