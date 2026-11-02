import type { Product } from "@/payload-types";
import { fetchShopProducts } from "./fetchProducts";
import { ShopGrid } from "./ShopGrid";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 12;

export default async function ShopPage() {
  // First page is rendered on the server; ShopGrid loads the rest on scroll.
  let initialProducts: Partial<Product>[] = [];
  let initialHasMore = false;
  let initialLoadError = false;

  try {
    const data = await fetchShopProducts(1, ITEMS_PER_PAGE);
    initialProducts = data.docs;
    initialHasMore = data.page < data.totalPages;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    initialLoadError = true;
  }

  return (
    <ShopGrid
      initialProducts={initialProducts}
      initialHasMore={initialHasMore}
      initialLoadError={initialLoadError}
      pageSize={ITEMS_PER_PAGE}
    />
  );
}
