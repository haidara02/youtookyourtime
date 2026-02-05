import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-2">
          <Link
            href="https://www.instagram.com/you_took_your_time/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-md font-bold underline hover:text-gray-600 transition-colors"
          >
            INSTAGRAM
          </Link>

          <p className="text-xs">
            © {new Date().getFullYear()} You Took Your Time.
          </p>

          <p className="text-xs">
            ★ site created by{" "}
            <Link
              href="https://ktng.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-900"
            >
              Khoi Nguyen
            </Link>{" "}
            ★
          </p>
        </div>
      </div>
    </footer>
  );
}
