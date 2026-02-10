export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="text-2xl">
              ★
            </span>
          ))}
        </div>
      </div>
      <form className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            NAME *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full border-b border-gray-300 px-0 py-2 focus:border-gray-900 focus:outline-none"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              EMAIL *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full border-b border-gray-300 px-0 py-2 focus:border-gray-900 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-2">
              SUBJECT *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              className="w-full border-b border-gray-300 px-0 py-2 focus:border-gray-900 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            MORE INFO
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            className="w-full border-b border-gray-300 px-0 py-2 focus:border-gray-900 focus:outline-none resize-none"
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="bg-black text-white px-12 py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            SEND
          </button>
        </div>
      </form>
    </div>
  );
}
