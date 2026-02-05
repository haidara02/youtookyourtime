import Link from "next/link";
import CartIcon from "../ui/CartIcon";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold tracking-tight">
            You Took Your Time
          </Link>

          <div className="flex flex-col items-end gap-2">
            <div className="hidden md:flex md:items-center md:space-x-6 text-sm font-bold">
              <Link href="/" className="hover:text-gray-600 transition-colors">
                HOME
              </Link>
              <Link
                href="/shop"
                className="hover:text-gray-600 transition-colors"
              >
                SHOP
              </Link>
              <Link
                href="/about"
                className="hover:text-gray-600 transition-colors"
              >
                ABOUT
              </Link>
              <Link
                href="/blog"
                className="hover:text-gray-600 transition-colors"
              >
                BLOG
              </Link>
              <Link
                href="/contact"
                className="hover:text-gray-600 transition-colors"
              >
                CONTACT
              </Link>
            </div>
            <div className="flex items-center">
              <CartIcon count={0} />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
