"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CartIcon from "../ui/CartIcon";
import CurrencySelector from "../ui/CurrencySelector";
import { cn } from "@/utilities/cn";

const NAV_LINKS = [
  { href: "/", label: "HOME" },
  { href: "/shop", label: "SHOP" },
  { href: "/about", label: "ABOUT" },
  { href: "/blog", label: "BLOG" },
  { href: "/contact", label: "CONTACT" },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    const media = window.matchMedia("(min-width: 768px)");
    const onViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) setIsMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    media.addEventListener("change", onViewportChange);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      media.removeEventListener("change", onViewportChange);
    };
  }, [isMenuOpen]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 bg-background text-black/80"
    >
      <nav className="relative mx-auto px-4 sm:px-6 lg:px-32 py-4 md:py-8">
        <div className="flex items-start justify-between gap-4 md:h-16 md:items-center">
          <Link href="/" className="min-w-0 text-5xl font-bold">
            YOU TOOK YOUR TIME <span className="text-brand-red">(VN)</span>
          </Link>

          <div className="hidden md:flex flex-col items-end gap-2">
            <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-base font-bold">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-brand-red transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <CurrencySelector />
              <CartIcon count={0} />
            </div>
          </div>

          <button
            type="button"
            className="hover:text-brand-red -m-2 shrink-0 p-2 transition-colors md:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span
              className="flex h-5 w-6 flex-col justify-between"
              aria-hidden="true"
            >
              <span
                className={cn(
                  "h-0.5 w-full origin-center bg-current transition-transform duration-200",
                  isMenuOpen && "translate-y-[9px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "h-0.5 w-full bg-current transition-opacity duration-200",
                  isMenuOpen && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "h-0.5 w-full origin-center bg-current transition-transform duration-200",
                  isMenuOpen && "-translate-y-[9px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>

        <div className="mt-4 flex items-center gap-4 md:hidden">
          <CurrencySelector />
          <CartIcon count={0} />
        </div>

        <div
          id="mobile-nav"
          inert={!isMenuOpen}
          className={cn(
            "absolute inset-x-0 top-full bg-background md:hidden grid transition-[grid-template-rows] duration-300 ease-out",
            isMenuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr] pointer-events-none",
          )}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col items-center gap-6 px-4 py-10">
              {NAV_LINKS.map((link) => {
                const isActive = isActivePath(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "text-4xl font-bold tracking-wide transition-colors hover:text-brand-red active:text-brand-red",
                      isActive && "text-brand-red",
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
