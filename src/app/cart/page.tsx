export default function CartPage() {
  const products = [
    {
      id: 1,
      title: "Little Rascal Plushie",
      image: "Product",
      price: 200000,
      date: "20250718",
    },
    {
      id: 2,
      title: "Test",
      price: null,
      image: "Product",
      date: "20250718",
    },
    {
      id: 3,
      title: "Test",
      price: null,
      image: "Product",
      date: "20250718",
    },
  ];
  const s = products.reduce((acc, p) => acc + (p.price || 0), 0);
  const d = 11000;
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-medium mb-8">My cart</h1>
          {products.map((p) => (
            <div key={p.id} className="border-t border-foreground py-6">
              <div className="flex justify-between">
                <div className="flex gap-4">
                  <div className="h-24 w-24 bg-gray-100 shrink-0">
                    <div className="flex h-full items-center justify-center text-gray-400 text-xs">
                      {p.image || "Product"}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{p.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {p.price ? p.price.toLocaleString("en-US") + " ₫" : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-2/5 gap-6 p-2">
                  <input
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="w-16 border border-gray-300 px-2 py-1 text-center"
                  />
                  <span className="text-sm">
                    {p.price ? p.price.toLocaleString("en-US") + " ₫" : "N/A"}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-6 space-y-4 text-sm flex flex-col">
            <button className=" text-blue-600 hover:text-blue-800">
              <span className="flex items-center" data-hook="prefix-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="24"
                  height="24"
                >
                  <path d="M19,11.7071068 L11.2071068,19.5 C10.8165825,19.8905243 10.1834175,19.8905243 9.79289322,19.5 L4.5,14.2071068 C4.10947571,13.8165825 4.10947571,13.1834175 4.5,12.7928932 L12.2928932,5 L19,5 L19,11.7071068 Z M18,6 L12.7071068,6 L5.20710678,13.5 L10.5,18.7928932 L18,11.2928932 L18,6 Z M15,10 C14.4477153,10 14,9.55228475 14,9 C14,8.44771525 14.4477153,8 15,8 C15.5522847,8 16,8.44771525 16,9 C16,9.55228475 15.5522847,10 15,10 Z"></path>
                </svg>
                Enter a promo code
              </span>
            </button>
            <button className=" text-blue-600 hover:text-blue-800">
              <span className="flex items-center" data-hook="prefix-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="24"
                  height="24"
                >
                  <path d="M13,6.70710678 L13,9 L15.2928932,9 L13,6.70710678 Z M17,19 C17,19.5522847 16.5522847,20 16,20 L7,20 C6.44771525,20 6,19.5522847 6,19 L6,6 C6,5.44771525 6.44771525,5 7,5 L12.7099045,5 L17,9.2995551 L17,19 Z M16,10 L12,10 L12,6 L7,6 L7,19 L16,19 L16,10 Z"></path>
                </svg>
                Add a note
              </span>
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-foreground text-background p-6 rounded-lg">
            <h2 className="text-lg font-medium mb-6">Order summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{s ? s.toLocaleString("en-US") + " ₫" : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{d ? d.toLocaleString("en-US") + " ₫" : "N/A"}</span>
              </div>
              <div className="text-xs text-gray-600">Hanoi, Vietnam</div>
              <div className="pt-3 border-t">
                <select className="w-full border border-gray-300 px-3 py-2 text-sm">
                  <option>
                    Standard Shipping -{" "}
                    {d ? d.toLocaleString("en-US") + " ₫" : "N/A"}
                  </option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between text-lg font-medium">
                <span>Total</span>
                <span>
                  {s && d ? (s + d).toLocaleString("en-US") + " ₫" : "N/A"}
                </span>
              </div>
            </div>

            <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition-colors">
              Checkout
            </button>

            <p className="text-xs text-center text-gray-600 mt-4">
              🔒 Secure Checkout
            </p>
          </div>
        </div>
      </div>
      <div className="mt-12 border-t pt-8">
        <p className="text-3xl text-foreground font-bold text-center mb-4">
          To pick up an order In Store - Select your preferred store from the
          shipping menu
        </p>
      </div>
    </div>
  );
}
