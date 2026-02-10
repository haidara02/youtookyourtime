export default function ShopPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {/* TODO: Infinite Scroll*/}
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="group">
            <div className="relative aspect-square bg-gray-100 mb-2">
              <div className="flex h-full items-center justify-center text-gray-400">
                Product {i + 1}
              </div>
            </div>
            <h3 className="text-sm font-medium">Product Name</h3>
            <p className="text-sm text-gray-600">Out of stock</p>
          </div>
        ))}
      </div>
    </div>
  );
}
