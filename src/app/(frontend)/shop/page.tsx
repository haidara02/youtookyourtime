"use client";

import { ProductGridItem } from "@/components/ProductGridItem";
import { useEffect, useRef, useCallback, useState } from "react";
import type { Product } from "@/payload-types";

const ITEMS_PER_PAGE = 12;

export default function ShopPage() {
  const [products, setProducts] = useState<Partial<Product>[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchProducts = useCallback(async (pageNum: number) => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/products?page=${pageNum}&limit=${ITEMS_PER_PAGE}`
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (pageNum === 1) {
        setProducts(data.docs ?? []);
      } else {
        setProducts((prev) => [...prev, ...(data.docs ?? [])]);
      }

      setHasMore(data.page < data.totalPages);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setLoadError(true);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore]);

  // Initial load
  useEffect(() => {
    fetchProducts(1);
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage((prev) => prev + 1);
          fetchProducts(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, page, fetchProducts]);

  return (
    <div className="mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => {
          // Add fade-in animation with staggered delay for new rows
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
      <div
        ref={observerTarget}
        className="mt-12 h-4"
        aria-hidden="true"
      />
      
      {isLoading && (
        <div className="mt-8 flex justify-center">
          <div className="text-sm text-muted-foreground">Loading more products...</div>
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
