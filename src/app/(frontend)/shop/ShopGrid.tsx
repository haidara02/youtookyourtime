"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ProductGridItem } from "@/components/ProductGridItem";
import type { Product } from "@/payload-types";
import { fetchShopProducts } from "./fetchProducts";

type Props = {
  initialProducts: Partial<Product>[];
  initialHasMore: boolean;
  initialLoadError: boolean;
  pageSize: number;
};

/**
 * Product grid with infinite scroll. The first page is rendered on the
 * server (see page.tsx); this only fetches the pages after it.
 */
export function ShopGrid({
  initialProducts,
  initialHasMore,
  initialLoadError,
  pageSize,
}: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(initialLoadError);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Refs rather than state so the guard is never stale: the observer can
  // fire again before React re-renders, which would fetch a page twice.
  const lastPage = useRef(1);
  const inFlight = useRef(false);

  const loadMore = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsLoading(true);
    try {
      const data = await fetchShopProducts(lastPage.current + 1, pageSize);
      lastPage.current = data.page;
      setProducts((prev) => [...prev, ...data.docs]);
      setHasMore(data.page < data.totalPages);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setLoadError(true);
      setHasMore(false);
    } finally {
      inFlight.current = false;
      setIsLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!hasMore || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) void loadMore();
      },
      { threshold: 0.1 },
    );
    observer.observe(target);

    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <div className="mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => {
          // Fade-in with a staggered delay per row
          const delay = Math.floor(index / 3) * 150;
          return (
            <div
              key={product.id}
              style={{
                animation: `fadeIn 0.6s ease-in-out ${delay}ms both`,
              }}
            >
              <ProductGridItem product={product} />
            </div>
          );
        })}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="mt-12 h-4" aria-hidden="true" />

      {isLoading && (
        <div className="mt-8 flex justify-center">
          <div className="text-sm text-muted-foreground">
            Loading more products...
          </div>
        </div>
      )}

      {loadError && (
        <div className="mt-8 flex justify-center">
          <div className="text-sm text-muted-foreground">
            Couldn&apos;t load products right now. Please try again shortly.
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
