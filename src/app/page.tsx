import Image from "next/image";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="mb-16">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="relative aspect-square bg-gray-100">
            {/* Placeholder */}
            <div className="flex h-full items-center justify-center text-gray-400">
              Video 1
            </div>
          </div>
          <div className="relative aspect-square bg-gray-100">
            <div className="flex h-full items-center justify-center text-gray-400">
              Video 2
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 px-10">
          {[1, 2, 3].map((item) => (
            <div key={item} className="group">
              <div className="relative aspect-square bg-gray-100 mb-2">
                <div className="flex h-full items-center justify-center text-gray-400">
                  Product {item}
                </div>
              </div>
              <h3 className="text-sm font-medium">Product Name</h3>
              <p className="text-sm text-gray-600">Out of stock</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
