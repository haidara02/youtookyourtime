"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import CartIcon from "../ui/CartIcon";
import CurrencySelector from "../ui/CurrencySelector";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const setHeaderHeight = () => {
      document.documentElement.style.setProperty(
        "--header-height",
        `${header.offsetHeight}px`,
      );
    };

    setHeaderHeight();

    const resizeObserver = new ResizeObserver(setHeaderHeight);
    resizeObserver.observe(header);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 bg-background text-black/80"
    >
      <nav className="mx-auto px-4 sm:px-6 lg:px-32 py-4 md:py-8 ">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:h-16">
          <Link href="/" className="text-5xl font-bold">
            YOU TOOK YOUR TIME <span className="text-brand-red">(VN)</span>
          </Link>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-base font-bold">
              <Link
                href="/"
                className="hover:text-brand-red transition-colors"
              >
                HOME
              </Link>
              <Link
                href="/shop"
                className="hover:text-brand-red transition-colors"
              >
                SHOP
              </Link>
              <Link
                href="/about"
                className="hover:text-brand-red transition-colors"
              >
                ABOUT
              </Link>
              <Link
                href="/blog"
                className="hover:text-brand-red transition-colors"
              >
                BLOG
              </Link>
              <Link
                href="/contact"
                className="hover:text-brand-red transition-colors"
              >
                CONTACT
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <CurrencySelector />
              <CartIcon count={0} />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
